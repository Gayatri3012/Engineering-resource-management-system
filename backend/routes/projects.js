const express = require('express');
const { getAllProjects, createProject, getProjectById, editProject } = require('../controllers/projectsController');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is a manager
const isManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Managers only.'
        });
    }
    next();
};

// Project routes
router.get('/', auth, getAllProjects);
router.post('/', auth, isManager, createProject);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth,isManager, editProject);


module.exports = router;