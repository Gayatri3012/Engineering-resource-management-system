const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator')


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user data without password
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};

const getProfile = async (req, res) => {
    try {
        // req.user is already populated by auth middleware
        const userWithoutPassword = req.user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    console.log("in updateprofile")
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, department, seniority, maxCapacity, skills } = req.body;
        console.log(name, department, seniority, maxCapacity, skills)
        
        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare update data
        const updateData = {};
        
        if (name !== undefined) updateData.name = name.trim();
        if (department !== undefined) updateData.department = department.trim();
        if (seniority !== undefined) updateData.seniority = seniority;
        if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity;
        
        // Handle skills - remove duplicates and trim
        if (skills !== undefined) {
            const uniqueSkills = [...new Set(skills.map(skill => skill.trim()).filter(skill => skill.length > 0))];
            updateData.skills = uniqueSkills;
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password -__v');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: error.message
        });
    }
};

const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Validate required fields
        if (!email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            role
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user data without password
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(201).json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

module.exports = {
    login,
    getProfile,
    register,
    updateProfile
};