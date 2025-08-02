const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['engineer', 'manager']
    },
    skills: {
        type: [String],
        default: []
    },
    seniority: {
        type: String,
        enum: ['junior', 'mid', 'senior'],
        required: false
    },
    maxCapacity: {
        type: Number,
        default: 100
    },
    department: {
        type: String
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;