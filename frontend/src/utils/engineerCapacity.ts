import type { Assignment, Engineer, EngineerWithCapacity } from "@/types";

// engineerCapacityUtils.ts
/**
 * Extracts engineer ID from assignment, handling both string and populated object cases
 */
function extractEngineerId(engineerId: string | { _id: string }): string {
  if (typeof engineerId === 'string') {
    return engineerId;
  }
  
  if (engineerId && typeof engineerId === 'object' && '_id' in engineerId) {
    return engineerId._id;
  }
  
  throw new Error('Invalid engineerId format');
}

/**
 * Filters assignments for a specific engineer that are still active
 */
function getActiveAssignmentsForEngineer(
  assignments: Assignment[], 
  engineerId: string,
  currentDate: Date = new Date()
): Assignment[] {
  return assignments.filter(assignment => {
    try {
      const assignmentEngineerId = extractEngineerId(assignment.engineerId);
      const isForThisEngineer = assignmentEngineerId === engineerId;
      const isStillActive = new Date(assignment.endDate) > currentDate;
      
      return isForThisEngineer && isStillActive;
    } catch (error) {
      console.warn('Skipping assignment with invalid engineerId:', assignment);
      return false;
    }
  });
}

/**
 * Calculates total allocated capacity for an engineer
 */
function calculateTotalAllocated(assignments: Assignment[]): number {
  return assignments.reduce((sum, assignment) => {
    return sum + (assignment.allocationPercentage || 0);
  }, 0);
}

/**
 * Calculates capacity metrics for a single engineer
 */
export function calculateEngineerCapacity(
  engineer: Engineer, 
  allAssignments: Assignment[],
  currentDate: Date = new Date()
): EngineerWithCapacity {
  const activeAssignments = getActiveAssignmentsForEngineer(
    allAssignments, 
    engineer._id, 
    currentDate
  );
  
  const totalAllocated = calculateTotalAllocated(activeAssignments);
  const availableCapacity = Math.max(0, engineer.maxCapacity - totalAllocated);
  const utilizationPercentage = engineer.maxCapacity > 0 ? (totalAllocated / engineer.maxCapacity) * 100 : 0;
  const maxCapacity = engineer.maxCapacity;

  return {
    ...engineer,
    capacityInfo: {
      totalAllocated,
      maxCapacity,
      availableCapacity,
      utilizationPercentage
    },
    currentAssignments: activeAssignments
  };
}

/**
 * Calculates capacity for multiple engineers
 */
export function calculateEngineersCapacity(
  engineers: Engineer[], 
  assignments: Assignment[],
  currentDate: Date = new Date()
): EngineerWithCapacity[] {
  return engineers.map(engineer => 
    calculateEngineerCapacity(engineer, assignments, currentDate)
  );
}

/**
 * Gets engineers with available capacity above a threshold
 */
export function getAvailableEngineers(
  engineers: Engineer[], 
  assignments: Assignment[],
  minAvailableCapacity: number = 0,
  currentDate: Date = new Date()
): EngineerWithCapacity[] {
  const engineersWithCapacity = calculateEngineersCapacity(engineers, assignments, currentDate);
  
  return engineersWithCapacity.filter(engineer => 
    engineer.capacityInfo.availableCapacity > minAvailableCapacity
  );
}

/**
 * Gets overallocated engineers (allocated > maxCapacity)
 */
export function getOverallocatedEngineers(
  engineers: Engineer[], 
  assignments: Assignment[],
  currentDate: Date = new Date()
): EngineerWithCapacity[] {
  const engineersWithCapacity = calculateEngineersCapacity(engineers, assignments, currentDate);
  
  return engineersWithCapacity.filter(engineer => 
    engineer.capacityInfo.totalAllocated > engineer.maxCapacity
  );
}

/**
 * Gets capacity summary statistics
 */
export function getCapacitySummary(
  engineers: Engineer[], 
  assignments: Assignment[],
  currentDate: Date = new Date()
) {
  const engineersWithCapacity = calculateEngineersCapacity(engineers, assignments, currentDate);
  
  const totalMaxCapacity = engineersWithCapacity.reduce((sum, eng) => sum + eng.maxCapacity, 0);
  const totalAllocated = engineersWithCapacity.reduce((sum, eng) => sum + eng.capacityInfo.totalAllocated, 0);
  const totalAvailable = engineersWithCapacity.reduce((sum, eng) => sum + eng.capacityInfo.availableCapacity, 0);
  
  return {
    totalEngineers: engineers.length,
    totalMaxCapacity,
    totalAllocated,
    totalAvailable,
    utilizationPercentage: totalMaxCapacity > 0 ? (totalAllocated / totalMaxCapacity) * 100 : 0,
    overallocatedCount: engineersWithCapacity.filter(eng => eng.capacityInfo.totalAllocated > eng.maxCapacity).length,
    fullyAllocatedCount: engineersWithCapacity.filter(eng => eng.capacityInfo.availableCapacity === 0).length,
    availableCount: engineersWithCapacity.filter(eng => eng.capacityInfo.availableCapacity > 0).length
  };
}
