const Project = require('../models/Project');

const getAllProjects = async (req, res) => {
    try {
        const { status, managerId } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (managerId) filter.managerId = managerId;

        // Find projects with filters and populate manager
        const projects = await Project.find(filter)
            .populate('managerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message
        });
    }
};

const createProject = async (req, res) => {
    try {
        const { name, description, startDate, endDate, requiredSkills, teamSize } = req.body;

        // Validate required fields
        if (!name || !startDate || !endDate || !teamSize) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, startDate, endDate, teamSize'
            });
        }

        // Create project with authenticated user as manager
        const project = await Project.create({
            name,
            description,
            startDate,
            endDate,
            requiredSkills: requiredSkills || [],
            teamSize,
            managerId: req.user._id, // From auth middleware
            status: 'planning' // Default status
        });

        // Fetch created project with populated manager
        const populatedProject = await Project.findById(project._id)
            .populate('managerId', 'name email');

        res.status(201).json({
            success: true,
            project: populatedProject
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating project',
            error: error.message
        });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find project and populate manager
        const project = await Project.findById(id)
            .populate('managerId', 'name email');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Get current date
        const currentDate = new Date();

        // Find current assignments for this project
        const currentAssignments = await Assignment.find({
            projectId: id,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).populate('engineerId', 'name email skills seniority');

        // Combine project data with assignments
        const projectData = {
            ...project.toObject(),
            currentAssignments: currentAssignments.map(assignment => ({
                _id: assignment._id,
                engineer: assignment.engineerId,
                allocationPercentage: assignment.allocationPercentage,
                role: assignment.role,
                startDate: assignment.startDate,
                endDate: assignment.endDate
            }))
        };

        

        res.status(200).json({
            success: true,
            project: projectData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project details',
            error: error.message
        });
    }
};
const editProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updateData = req.body;

    // Optional: Add validation to ensure only managers can edit
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Only managers can edit projects.' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validations
      }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
            // Fetch created project with populated manager
        const populatedProject = await Project.findById(updatedProject._id)
            .populate('managerId', 'name email');
    
        res.status(200).json({
            success: true,
            project: populatedProject
        });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = { 
    getAllProjects,
    createProject,
    getProjectById,
    editProject
};