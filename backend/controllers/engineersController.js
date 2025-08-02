const User = require('../models/User');
const Assignment = require('../models/Assignment');

const getAllEngineers = async (req, res) => {
    try {
        // Find all engineers
        const engineers = await User.find({ role: 'engineer' }).select('-password');

        // Get current date
        const currentDate = new Date();

        // Calculate available capacity for each engineer
        const engineersWithCapacity = await Promise.all(engineers.map(async (engineer) => {
            // Find active assignments for the engineer
            const activeAssignments = await Assignment.find({
                engineerId: engineer._id,
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate }
            });

            // Calculate total allocated capacity
            const totalAllocated = activeAssignments.reduce((sum, assignment) => {
                return sum + assignment.allocationPercentage;
            }, 0);

            // Convert engineer to object and add available capacity
            const engineerObj = engineer.toObject();
            engineerObj.availableCapacity = Math.max(0, engineer.maxCapacity - totalAllocated);
            
            return engineerObj;
        }));

        res.status(200).json({
            success: true,
            count: engineersWithCapacity.length,
            engineers: engineersWithCapacity
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching engineers',
            error: error.message
        });
    }
};

const getEngineerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find engineer by ID
        const engineer = await User.findOne({ 
            _id: id, 
            role: 'engineer' 
        }).select('-password');

        if (!engineer) {
            return res.status(404).json({
                success: false,
                message: 'Engineer not found'
            });
        }

        // Get current date
        const currentDate = new Date();

        // Find active assignments with project details
        const activeAssignments = await Assignment.find({
            engineerId: engineer._id,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).populate('projectId', 'name description');

        // Calculate capacity breakdown
        const totalAllocated = activeAssignments.reduce((sum, assignment) => 
            sum + assignment.allocationPercentage, 0);

        // Prepare response object
        const engineerDetails = {
            ...engineer.toObject(),
            availableCapacity: Math.max(0, engineer.maxCapacity - totalAllocated),
            totalAllocated,
            activeAssignments: activeAssignments.map(assignment => ({
                project: assignment.projectId,
                allocationPercentage: assignment.allocationPercentage,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
                role: assignment.role
            }))
        };

        res.status(200).json({
            success: true,
            engineer: engineerDetails
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching engineer details',
            error: error.message
        });
    }
};
const getEngineerCapacity = async (req, res, next) => {
    try {
    const engineer = await User.findOne({ _id: req.params.id, role: 'engineer' });
    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found' });
    }

    const currentDate = new Date();
    const assignments = await Assignment.find({
      engineerId: req.params.id,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    const totalAllocated = assignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    const available = Math.max(0, engineer.maxCapacity - totalAllocated);
    res.json({ availableCapacity: available });
  } catch (err) {
    console.error('Capacity error:', err); // 👈 Add this
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
    getAllEngineers,
    getEngineerCapacity,
    getEngineerById
};


