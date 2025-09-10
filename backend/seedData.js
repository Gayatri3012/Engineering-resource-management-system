const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Assignment = require('./models/Assignment');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Assignment.deleteMany({});
        console.log('Cleared existing data');

        // Create manager
        const hashedPassword = await bcrypt.hash('password123', 10);
        const manager = await User.create({
            name: 'John Manager',
            email: 'manager@company.com',
            password: hashedPassword,
            role: 'manager'
        });

       // Create engineers
const engineers = await User.insertMany([
    {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        role: 'engineer',
        skills: ['JavaScript', 'React', 'Node.js'],
        seniority: 'senior',
        maxCapacity: 100,
        department: 'Frontend'
    },
    {
        name: 'Raj Mehta',
        email: 'raj@example.com',
        password: hashedPassword,
        role: 'engineer',
        skills: ['Python', 'Django', 'PostgreSQL'],
        seniority: 'mid',
        maxCapacity: 100,
        department: 'Backend'
    },
    {
        name: 'Angela Martin',
        email: 'angela@dundermifflin.com',
        password: hashedPassword,
        role: 'engineer',
        skills: ['Java', 'Spring', 'MySQL'],
        seniority: 'junior',
        maxCapacity: 50,
        department: 'Mobile'
    },
    {
        name: 'Jim Halpert',
        email: 'jim@dundermifflin.com',
        password: hashedPassword,
        role: 'engineer',
        skills: ['JavaScript', 'Angular', 'MongoDB'],
        seniority: 'mid',
        maxCapacity: 50,
        department: 'Full Stack'
    },
    {
        name: 'Anjali Verma',
        email: 'engineer@company.com',
        password: hashedPassword,
        role: 'engineer',
        skills: ['Node.js', 'Express', 'MongoDB'],
        seniority: 'junior',
        maxCapacity: 100,
        department: 'Backend'
    }
]);

        // Create projects
        const projects = await Project.insertMany([
            {
                name: 'Web Portal Redesign',
                description: 'Modernize the company web portal',
                startDate: new Date('2025-08-01'),
                endDate: new Date('2025-12-31'),
                requiredSkills: ['JavaScript', 'React', 'Node.js'],
                teamSize: 3,
                status: 'active',
                managerId: manager._id
            },
            {
                name: 'Database Migration',
                description: 'Migrate legacy database to PostgreSQL',
                startDate: new Date('2025-09-01'),
                endDate: new Date('2025-11-30'),
                requiredSkills: ['Python', 'PostgreSQL'],
                teamSize: 2,
                status: 'planning',
                managerId: manager._id
            },
            {
                name: 'Mobile App Development',
                description: 'Create new mobile app for customers',
                startDate: new Date('2025-10-01'),
                endDate: new Date('2026-03-31'),
                requiredSkills: ['Java', 'Spring'],
                teamSize: 4,
                status: 'active',
                managerId: manager._id
            }
        ]);

        // Create assignments
        await Assignment.insertMany([
            {
                engineerId: engineers[0]._id,
                projectId: projects[0]._id,
                allocationPercentage: 70,
                startDate: new Date('2025-08-01'),
                endDate: new Date('2025-12-31'),
                role: 'Tech Lead'
            },
            {
                engineerId: engineers[1]._id,
                projectId: projects[1]._id,
                allocationPercentage: 100,
                startDate: new Date('2025-09-01'),
                endDate: new Date('2025-11-30'),
                role: 'Database Engineer'
            },
            {
                engineerId: engineers[2]._id,
                projectId: projects[2]._id,
                allocationPercentage: 50,
                startDate: new Date('2025-10-01'),
                endDate: new Date('2026-03-31'),
                role: 'Junior Developer'
            },
            {
                engineerId: engineers[3]._id,
                projectId: projects[0]._id,
                allocationPercentage: 40,
                startDate: new Date('2025-08-01'),
                endDate: new Date('2025-12-31'),
                role: 'Frontend Developer'
            },
            {
                engineerId: engineers[0]._id,
                projectId: projects[2]._id,
                allocationPercentage: 30,
                startDate: new Date('2025-10-01'),
                endDate: new Date('2026-03-31'),
                role: 'Technical Consultant'
            },
            {
                engineerId: engineers[3]._id,
                projectId: projects[1]._id,
                allocationPercentage: 60,
                startDate: new Date('2025-09-01'),
                endDate: new Date('2025-11-30'),
                role: 'Developer'
            }
        ]);

        console.log('Sample data inserted successfully');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();