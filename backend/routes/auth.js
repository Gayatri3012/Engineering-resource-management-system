const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getProfile, updateProfile } = require('../controllers/authController');
const protect = require('../middleware/auth');

const profileValidation = [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('department').optional().trim().isLength({ max: 50 }),
    body('seniority').optional().isIn(['junior', 'mid', 'senior', 'lead', 'principal']),
    body('maxCapacity').optional().isInt({ min: 1, max: 100 }),
    body('skills').optional().isArray()
];



// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

// Protected route
router.put('/profile', protect, profileValidation, updateProfile);

module.exports = router;