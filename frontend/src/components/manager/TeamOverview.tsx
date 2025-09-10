import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import CapacityBar from '../ui/CapacityBar';
import { Search, Filter, User } from 'lucide-react';
import { calculateEngineerCapacity } from '@/utils/engineerCapacity';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/shadcn-components';

interface TeamOverviewProps {
  onCreateAssignment?: (engineerId: string) => void;
  embedded?: boolean; //  prop to control the view
  maxRows?: number; // New prop to limit rows when embedded
}

const TeamOverview: React.FC<TeamOverviewProps> = ({ 
  embedded = false, 
  maxRows = 10 
}) => {
  const { state, fetchEngineers, fetchAssignments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    fetchEngineers();
    fetchAssignments();
  }, []);

  // Calculate capacity for each engineer
  const engineersWithCapacity = state.engineers.map(engineer => 
    calculateEngineerCapacity(engineer, state.assignments)
  ).map(engineerWithCapacity => ({
    ...engineerWithCapacity,
    totalAllocated: engineerWithCapacity.capacityInfo.totalAllocated,
    availableCapacity: engineerWithCapacity.capacityInfo.availableCapacity,
    assignments: engineerWithCapacity.currentAssignments
  }));

  // Get all unique skills for filter
  const allSkills = Array.from(
    new Set(state.engineers.flatMap(engineer => engineer.skills))
  ).sort();

  // Filter engineers based on search and filters
  let filteredEngineers = engineersWithCapacity.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !skillFilter || engineer.skills.includes(skillFilter);
    const matchesSeniority = !seniorityFilter || engineer.seniority === seniorityFilter;
    
    const matchesCapacity = !capacityFilter || 
      (capacityFilter === 'available' && engineer.availableCapacity > 0) ||
      (capacityFilter === 'overloaded' && engineer.capacityInfo.utilizationPercentage === 100) ||
      (capacityFilter === 'full' && engineer.availableCapacity === 0);

    return matchesSearch && matchesSkill && matchesSeniority && matchesCapacity;
  });

  // Limit rows when embedded
  if (embedded && maxRows) {
    filteredEngineers = filteredEngineers.slice(0, maxRows);
  }

const getCapacityStatus = (allocated: number, max: number) => {
  if (allocated > max) return 'Overloaded';
  if (allocated >= max * 0.9) return 'At Capacity';
  if (allocated >= max * 0.7) return 'High Load';
  return 'Available';
};

  const getCapacityBadgeVariant = (allocated: number, max: number) => {
    const percentage = (allocated / max) * 100;
    if (percentage > 100) return 'destructive';
    if (percentage >= 90) return 'warning';
    if (percentage >= 70) return 'secondary';
    return 'success';
  };


  const getAvailabilityInfo = (engineer: any) => {
    const currentCapacity = engineer.availableCapacity;
    
    if (currentCapacity >= 50) {
      return {
        status: "Available now",
        detail: `${currentCapacity}% capacity available`,
        color: "text-green-600"
      };
    } else if (currentCapacity > 0) {
      return {
        status: "Partially available",
        detail: `${currentCapacity}% capacity available`,
        color: "text-yellow-600"
      };
    }
    
    // Find next availability date
    if (engineer.assignments.length === 0) {
      return {
        status: "Available now",
        detail: "No active assignments",
        color: "text-green-600"
      };
    }
    
    const sortedEndDates = engineer.assignments
      .map((assignment:any) => ({
        endDate: new Date(assignment.endDate),
        allocation: assignment.allocationPercentage
      }))
      .sort((a:any, b:any) => a.endDate.getTime() - b.endDate.getTime());
    
    const nextEndDate = sortedEndDates[0].endDate;
    const isWithinMonth = (nextEndDate.getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000);
    
    return {
      status: nextEndDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: nextEndDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      detail: isWithinMonth ? "Available soon" : "Long-term commitment",
      color: isWithinMonth ? "text-orange-600" : "text-red-600"
    };
  };

  // Render embedded version (for dashboard)
  if (embedded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {filteredEngineers.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No engineers found</h3>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEngineers.map((engineer) => (
                    <TableRow key={engineer._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {engineer.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {engineer.seniority} • {engineer.department}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {engineer.skills.slice(0, 2).map((skill) => (
                            <Badge
                              key={skill}
                              variant="default"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {engineer.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{engineer.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <CapacityBar
                            current={engineer.totalAllocated}
                            max={engineer.maxCapacity}
                            size="sm"
                            showText={false}
                          />
                          <div className="text-xs text-gray-600 mt-1">
                            {engineer.totalAllocated}% / {engineer.maxCapacity}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCapacityBadgeVariant(engineer.totalAllocated, engineer.maxCapacity)} className="text-xs">
                          {getCapacityStatus(engineer.totalAllocated, engineer.maxCapacity)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const availability = getAvailabilityInfo(engineer);
                          return (
                            <div>
                              <div className={`text-xs font-medium ${availability.color}`}>
                                {availability.status}
                              </div>
                              <div className="text-xs text-gray-500">
                                {availability.detail}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {engineersWithCapacity.length > maxRows && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Showing {maxRows} of {engineersWithCapacity.length} engineers
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render full standalone version
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
              <p className="text-gray-600">Monitor engineer capacity and availability</p>
            </div>
            <div className="text-sm text-gray-600">
              {filteredEngineers.length} of {state.engineers.length} engineers
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Engineers</p>
                <p className="text-2xl font-bold text-gray-900">{state.engineers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {engineersWithCapacity.filter(e => e.availableCapacity > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High</p>
                <p className="text-2xl font-bold text-gray-900">
                  {engineersWithCapacity.filter(e => e.capacityInfo.utilizationPercentage >= 80 && e.capacityInfo.utilizationPercentage < 100).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <User className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overloaded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {engineersWithCapacity.filter(e => e.capacityInfo.utilizationPercentage === 100).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search engineers by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <select
                value={seniorityFilter}
                onChange={(e) => setSeniorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
              </select>

              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Capacity</option>
                <option value="available">Available</option>
                <option value="full">At Capacity</option>
                <option value="overloaded">Overloaded</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredEngineers.length} of {state.engineers.length} engineers
              </div>
            </div>
          </div>
        </div>

        {/* Engineers Table */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6">
            <div className="rounded-md border">
              {filteredEngineers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No engineers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEngineers.map((engineer) => (
                      <TableRow key={engineer._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {engineer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {engineer.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {engineer.seniority} • {engineer.department}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {engineer.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="default"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {engineer.skills.length > 3 && (
                              <Badge variant="secondary">
                                +{engineer.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <CapacityBar
                              current={engineer.totalAllocated}
                              max={engineer.maxCapacity}
                              size="sm"
                              showText={false}
                            />
                            <div className="text-xs text-gray-600 mt-1">
                              {engineer.totalAllocated}% / {engineer.maxCapacity}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCapacityBadgeVariant(engineer.totalAllocated, engineer.maxCapacity)}>
                            {getCapacityStatus(engineer.totalAllocated, engineer.maxCapacity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const availability = getAvailabilityInfo(engineer);
                            return (
                              <div>
                                <div className={`text-sm font-medium ${availability.color}`}>
                                  {availability.status}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {availability.detail}
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;