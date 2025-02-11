const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Faculty, Batch, Semester } = require('../models'); // Import models

// @desc    Get all batches
// @route   GET /api/batches
// @access  Admin (HOD)
const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll(); // Sequelize equivalent of find()
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Add a new batch
// @route   POST /api/batches
// @access  Admin (HOD)
const addBatch = async (req, res) => {
    try {
        const { batchName } = req.body;

        // Check if batch already exists
        const existingBatch = await Batch.findOne({ where: { batchName } });
        if (existingBatch) {
            return res.status(400).json({ message: "Batch already exists" });
        }

        const batch = await Batch.create({ batchName });
        res.status(201).json({ message: "Batch created successfully", batch });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add faculty (Admin/HOD only)
// @route   POST /api/faculty
// @access  Admin (HOD)
const addFaculty = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (role !== 'Faculty') {
            return res.status(400).json({ message: 'Invalid role. Only faculty can be added.' });
        }

        // Check if faculty already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Faculty already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create faculty user
        const newUser = await User.create({ name, email, password: hashedPassword, role });

        // Create faculty record
        const newFaculty = await Faculty.create({ userId: newUser.id });

        res.status(201).json({ 
            message: 'Faculty registered successfully', 
            user: newUser, 
            facultyId: newFaculty.id 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Requires Admin Role)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } }); // Exclude password
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a semester to a batch
// @route   POST /api/semesters
// @access  Admin (HOD)
const addSemester = async (req, res) => {
    try {
        const { batchName, semesterNumber, startDate, endDate } = req.body;

        if (!batchName || !semesterNumber || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find batch
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found." });
        }

        // Create semester
        const newSemester = await Semester.create({
            batchId: batch.id, 
            semesterNumber, 
            startDate, 
            endDate
        });

        res.status(201).json({ message: "Semester added successfully", semester: newSemester });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get semesters by batch
// @route   GET /api/semesters/:batchId
// @access  Admin (HOD)
const getSemestersByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const semesters = await Semester.findAll({ where: { batchId } });
        if (!semesters.length) {
            return res.status(404).json({ message: "No semesters found for this batch." });
        }

        res.status(200).json(semesters);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getSemestersByBatch,
    getAllUsers,
    addFaculty,
    addBatch,
    getAllBatches,
    addSemester
};
