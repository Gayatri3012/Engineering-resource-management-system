const express = require('express');
const { getAllAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentsController');
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

// Assignment routes
router.get('/', auth, getAllAssignments);
router.post('/', auth, isManager, createAssignment);
router.put('/:id', auth, isManager, updateAssignment);
router.delete('/:id', auth, isManager, deleteAssignment);

module.exports = router;