const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/faculty');
const Batch = require("../models/batch");

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Admin (HOD)


const getAllBatches = async (req, res) => {
    try {
      const batches = await Batch.find();
      res.status(200).json(batches);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


const addBatch = async (req, res) => {
  try {
    const { batchName } = req.body;

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchName });
    if (existingBatch) {
      return res.status(400).json({ message: "Batch already exists" });
    }

    const batch = new Batch({ batchName });
    await batch.save();
    res.status(201).json({ message: "Batch created successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};



const addFaculty = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Ensure role is 'faculty'
        if (role !== 'Faculty') {
            return res.status(400).json({ message: 'Invalid role. Only faculty can be added.' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Faculty already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new faculty user
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        // Create faculty record with user ID
        const newFaculty = new Faculty({ user: newUser._id });
        await newFaculty.save();

        res.status(201).json({ 
            message: 'Faculty registered successfully', 
            user: newUser, 
            facultyId: newFaculty._id 
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
        const user = await User.findOne({ email });
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
            { id: user._id, role: user.role },
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
        const users = await User.find().select('-password'); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getAllUsers, addFaculty, addBatch, getAllBatches };
