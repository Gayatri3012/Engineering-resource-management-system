const Assignment = require('../models/Assignment');
const User = require('../models/User')
const Project = require('../models/Project');

const getAllAssignments = async (req, res) => {
    try {
        const { engineerId, projectId, startDate, endDate } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (engineerId) filter.engineerId = engineerId;
        if (projectId) filter.projectId = projectId;
        
        // Add date range filters if provided
        if (startDate || endDate) {
            filter.$and = [];
            if (startDate) {
                filter.$and.push({ endDate: { $gte: new Date(startDate) } });
            }
            if (endDate) {
                filter.$and.push({ startDate: { $lte: new Date(endDate) } });
            }
        }

        // Find assignments with filters and populate references
        const assignments = await Assignment.find(filter)
            .populate('engineerId', 'name email skills seniority')
            .populate('projectId', 'name description status')
            .sort({ startDate: 1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching assignments',
            error: error.message
        });
    }
};
const createAssignment = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debug log
        
        const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = req.body;
        
        // Validate required fields
        if (!engineerId || !projectId || !allocationPercentage || !startDate || !endDate) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate date format and logic
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }
        
        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Validate allocation percentage
        if (allocationPercentage <= 0 || allocationPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Allocation percentage must be between 1 and 100'
            });
        }

        // Check if engineer exists
        console.log('Looking for engineer:', engineerId);
        const engineer = await User.findOne({ _id: engineerId, role: 'engineer' });
        
        if (!engineer) {
            console.log('Engineer not found');
            return res.status(404).json({
                success: false,
                message: 'Engineer not found'
            });
        }
        
        console.log('Engineer found:', engineer.name, 'Max capacity:', engineer.maxCapacity);

        // Check if project exists
        const project = await Project.findById(projectId); // Assuming you have a Project model
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Find overlapping assignments (corrected logic)
        const overlappingAssignments = await Assignment.find({
            engineerId,
            $or: [
                {
                    startDate: { $lte: start },
                    endDate: { $gte: start }
                },
                {
                    startDate: { $lte: end },
                    endDate: { $gte: end }
                },
                {
                    startDate: { $gte: start },
                    endDate: { $lte: end }
                }
            ]
        });

        console.log('Overlapping assignments found:', overlappingAssignments.length);

        // Calculate total allocation
        const totalAllocation = overlappingAssignments.reduce((sum, assignment) => 
            sum + assignment.allocationPercentage, 0) + allocationPercentage;

        console.log('Total allocation:', totalAllocation, 'Engineer capacity:', engineer.maxCapacity);

        // Check capacity
        if (totalAllocation > engineer.maxCapacity) {
            const available = engineer.maxCapacity - (totalAllocation - allocationPercentage);
            return res.status(400).json({
                success: false,
                message: `Assignment exceeds engineer's capacity. Available: ${available}%`
            });
        }

        // Create assignment
        console.log('Creating assignment...');
        const assignmentData = {
            engineerId,
            projectId,
            allocationPercentage: Number(allocationPercentage),
            startDate: start,
            endDate: end,
            role: role || 'Developer'
        };
        
        console.log('Assignment data:', assignmentData);
        
        const assignment = await Assignment.create(assignmentData);
        console.log('Assignment created with ID:', assignment._id);

        // Fetch populated assignment
        const populatedAssignment = await Assignment.findById(assignment._id)
            .populate('engineerId', 'name email skills seniority')
            .populate('projectId', 'name description status');

        console.log('Assignment saved successfully');
        
        res.status(201).json({
            success: true,
            assignment: populatedAssignment
        });

    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating assignment',
            error: error.message
        });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { allocationPercentage, startDate, endDate, role } = req.body;

        // Find existing assignment
        const existingAssignment = await Assignment.findById(id);
        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Find engineer
        const engineer = await User.findOne({ 
            _id: existingAssignment.engineerId, 
            role: 'engineer' 
        });

        // Find overlapping assignments excluding current assignment
        const overlappingAssignments = await Assignment.find({
            _id: { $ne: id },
            engineerId: existingAssignment.engineerId,
            $or: [
                {
                    startDate: { $lte: new Date(startDate || existingAssignment.startDate) },
                    endDate: { $gte: new Date(startDate || existingAssignment.startDate) }
                },
                {
                    startDate: { $lte: new Date(endDate || existingAssignment.endDate) },
                    endDate: { $gte: new Date(endDate || existingAssignment.endDate) }
                }
            ]
        });

        // Calculate total allocation
        const newAllocation = allocationPercentage || existingAssignment.allocationPercentage;
        const totalAllocation = overlappingAssignments.reduce((sum, assignment) => 
            sum + assignment.allocationPercentage, 0) + newAllocation;

        // Check capacity
        if (totalAllocation > engineer.maxCapacity) {
            return res.status(400).json({
                success: false,
                message: `Assignment exceeds engineer's capacity. Available: ${
                    engineer.maxCapacity - totalAllocation + newAllocation
                }%`
            });
        }

        // Update assignment
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id,
            {
                allocationPercentage: newAllocation,
                startDate: startDate ? new Date(startDate) : existingAssignment.startDate,
                endDate: endDate ? new Date(endDate) : existingAssignment.endDate,
                role: role || existingAssignment.role
            },
            { new: true }
        ).populate('engineerId', 'name email skills seniority')
         .populate('projectId', 'name description status');

        res.status(200).json({
            success: true,
            assignment: updatedAssignment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating assignment',
            error: error.message
        });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete assignment
        const assignment = await Assignment.findByIdAndDelete(id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Assignment deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting assignment',
            error: error.message
        });
    }
};

module.exports = {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
};