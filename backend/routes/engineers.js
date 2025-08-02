const express = require('express');
const { getAllEngineers, getEngineerCapacity, getAvailableCapacity } = require('../controllers/engineersController');
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

// Get all engineers (managers only)
router.get('/', auth, isManager, getAllEngineers);

// Get engineer capacity (any authenticated user)
router.get('/:id/capacity', auth, getEngineerCapacity);


module.exports = router;