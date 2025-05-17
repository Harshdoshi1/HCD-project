<<<<<<< HEAD
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { supabase } = require("../config/supabaseClient");
const { Batch } = require("../models/batch");

// ✅ Add Subject (Check if already assigned to batch & semester)
const assignSubject = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body); // Debugging

    const { subjects } = req.body;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty subjects array" });
    }

    for (const subject of subjects) {
      const { subjectName, semesterNumber, batchName } = subject;

      if (!subjectName || !semesterNumber || !batchName) {
        return res.status(400).json({
          message: "Missing subjectName, semesterNumber, or batchName",
        });
      }

      const batch = await Batch.findOne({ where: { batchName } });
      if (!batch) {
        return res
          .status(404)
          .json({ message: `Batch '${batchName}' not found` });
      }

      const semester = await Semester.findOne({
        where: { semesterNumber, batchId: batch.id },
      });
      if (!semester) {
        return res.status(404).json({
          message: `Semester '${semesterNumber}' not found for batch '${batchName}'`,
        });
      }

      const existingSubject = await Subject.findOne({
        where: { subjectName, semesterId: semester.id, batchId: batch.id },
      });

      if (existingSubject) {
        return res.status(400).json({
          message: `Subject '${subjectName}' already assigned to this batch and semester`,
        });
      }

      await Subject.create({
        subjectName,
        semesterId: semester.id,
        batchId: batch.id,
      });
    }

    res.status(201).json({ message: "Subjects assigned successfully" });
  } catch (error) {
    console.error("Error assigning subjects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDropdownData = async (req, res) => {
  try {
    const subjects = await UniqueSubDegree.findAll();

    const batches = [...new Set(subjects.map((s) => s.batch))];
    const semesters = [...new Set(subjects.map((s) => s.semester))];
    const programs = [...new Set(subjects.map((s) => s.program))];

    return res.status(200).json({ subjects, batches, semesters, programs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { program } = req.body;

    if (!program || (program !== "degree" && program !== "diploma")) {
      return res
        .status(400)
        .json({ message: "Invalid or missing program parameter" });
    }

    let subjects;
    if (program === "degree") {
      subjects = await UniqueSubDegree.findAll();
    } else if (program === "diploma") {
      subjects = await UniqueSubDiploma.findAll();
    }

    return res.status(200).json({ subjects });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching subjects", error: error.message });
  }
};

// Function to add a unique subject for Degree
const addUniqueSubDegree = async (req, res) => {
  try {
    const { sub_code, sub_level, sub_name, sub_credit } = req.body;

    if (!sub_code || !sub_level || !sub_name || !sub_credit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const subject = await UniqueSubDegree.create({
      sub_code,
      sub_level,
      sub_name,
      sub_credit,
    });
    return res
      .status(201)
      .json({ message: "Degree subject added successfully", subject });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding degree subject", error: error.message });
  }
};

// Function to add a unique subject for Diploma
const addUniqueSubDiploma = async (req, res) => {
  try {
    const { sub_code, sub_level, sub_name, sub_credit } = req.body;

    if (!sub_code || !sub_level || !sub_name || !sub_credit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const subject = await UniqueSubDiploma.create({
      sub_code,
      sub_level,
      sub_name,
      sub_credit,
    });
    return res
      .status(201)
      .json({ message: "Diploma subject added successfully", subject });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding diploma subject", error: error.message });
  }
};

module.exports = { addUniqueSubDegree, addUniqueSubDiploma };

const getSubjectsByBatchAndSemester = async (req, res) => {
  try {
    const { batchName, semesterNumber } = req.params;

    // Find batch ID from batchName
    const batch = await Batch.findOne({ where: { batchName } });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Find semester where batchId matches
    const semester = await Semester.findOne({
      where: { semesterNumber, batchId: batch.id },
    });
    if (!semester) {
      return res
        .status(404)
        .json({ message: "Semester not found for this batch" });
    }

    // Fetch subjects for the given batch and semester
    const subjects = await Subject.findAll({
      where: { semesterId: semester.id, batchId: batch.id },
    });

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all batches
// @route   GET /api/batches
// @access  Admin (HOD)
const getAllBatches = async (req, res) => {
  try {
    console.log("Fetching all batches...");
    const { data: batches, error } = await Batch.findAll();
    
    if (error) {
      console.error("Error fetching batches:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!batches || batches.length === 0) {
      console.log("No batches found");
      return res.status(200).json([]);
    }

    console.log("Batches fetched successfully:", batches);
    res.status(200).json(batches);
  } catch (error) {
    console.error("Error in getAllBatches:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add Subject
const addSubject = async (req, res) => {
  try {
    const { name, code, courseType, credits, subjectType } = req.body;

    if (courseType === "degree") {
      await UniqueSubDegree.create({
        sub_code: code,
        sub_name: name,
        sub_credit: credits,
        sub_level: subjectType,
      });
    } else if (courseType === "diploma") {
      await UniqueSubDiploma.create({
        sub_code: code,
        sub_name: name,
        sub_credit: credits,
        sub_level: subjectType,
      });
    } else {
      return res.status(400).json({ error: "Invalid course type" });
    }

    res.status(201).json({ message: "Subject added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding subject", details: error.message });
  }
};

module.exports = { addSubject };

// @desc    Add a new batch
// @route   POST /api/batches
// @access  Admin (HOD)
// const addBatch = async (req, res) => {
//     try {
//         const { batchName } = req.body;

//         // Check if batch already exists
//         const existingBatch = await Batch.findOne({ where: { batchName } });
//         if (existingBatch) {
//             return res.status(400).json({ message: "Batch already exists" });
//         }

//         const batch = await Batch.create({ batchName });
//         res.status(201).json({ message: "Batch created successfully", batch });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };
const addBatch = async (req, res) => {
  try {
    const { batchName, batchStart, batchEnd, courseType } = req.body;

    // Validate that batchStart and batchEnd are dates
    if (
      isNaN(new Date(batchStart).getTime()) ||
      isNaN(new Date(batchEnd).getTime())
    ) {
      return res
        .status(400)
        .json({ message: "Invalid date format for batchStart or batchEnd" });
    }

    // Validate that courseType is either "Degree" or "Diploma"
    if (!["Degree", "Diploma"].includes(courseType)) {
      return res.status(400).json({
        message: "Invalid courseType. It must be 'Degree' or 'Diploma'",
      });
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ where: { batchName } });
    if (existingBatch) {
      return res.status(400).json({ message: "Batch already exists" });
    }

    // Create the new batch
    const batch = await Batch.create({
      batchName,
      batchStart: new Date(batchStart), // Convert to Date object
      batchEnd: new Date(batchEnd), // Convert to Date object
      courseType,
    });

    res.status(201).json({ message: "Batch created successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
=======
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Import models
const { Op } = require("sequelize"); // Ensure Op is imported

>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

<<<<<<< HEAD
// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
=======

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("emaio",email)

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required',
                error: 'Missing required fields'
            });
        }

        // Log the received email (for debugging)
        console.log('Login attempt for email:', email);

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({ 
                message: 'Invalid email or password',
                error: 'User not found'
            });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for email:', email);
            return res.status(400).json({ 
                message: 'Invalid email or password',
                error: 'Invalid password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1h' }
        );

        console.log('Login successful for email:', email);
        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message 
        });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    }

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Error fetching user" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password is hashed
    if (!user.password.startsWith("$2")) {
      // Password is not hashed, hash it now
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Update user with hashed password
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("email", email);

      if (updateError) {
        console.error("Error updating password:", updateError);
        return res.status(500).json({ message: "Error updating password" });
      }

      // Update user object with hashed password
      user.password = hashedPassword;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase.from("users").select();

    if (error) throw error;

    // Remove password from response
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

<<<<<<< HEAD
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
      endDate,
    });

    res
      .status(201)
      .json({ message: "Semester added successfully", semester: newSemester });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get semesters by batch
// @route   GET /api/semesters/:batchId
// @access  Admin (HOD)

const getSemestersByBatch = async (req, res) => {
  try {
    console.log("Received request with params:", req.params); // Debugging log

    const { batchName } = req.params; // Use params instead of query
    if (!batchName) {
      console.log("❌ Missing batchName in request.");
      return res.status(400).json({ message: "Batch name is required." });
    }

    console.log(`🔍 Searching for batch: ${batchName}`);
    const { data: batch, error: batchError } = await Batch.findOne({
      batchName,
    });

    if (batchError || !batch) {
      console.log(`❌ Batch '${batchName}' not found in DB.`);
      return res.status(404).json({ message: "Batch not found." });
    }

    console.log(`✅ Found batch with ID: ${batch.id}, fetching semesters...`);
    const { data: semesters, error: semestersError } = await Semester.findAll({
      batchId: batch.id,
    });

    if (semestersError) {
      console.error("Error fetching semesters:", semestersError);
      return res.status(500).json({ message: "Error fetching semesters" });
    }

    if (!semesters || !semesters.length) {
      console.log(`⚠️ No semesters found for batch ID: ${batch.id}`);
      return res
        .status(404)
        .json({ message: "No semesters found for this batch." });
    }

    console.log(`✅ Found ${semesters.length} semesters. Sending response.`);
    res.status(200).json(semesters);
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Add a new faculty member
// @route   POST /api/users/addFaculty
// @access  Admin (HOD)
const addFaculty = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: role || "Faculty",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return res
        .status(500)
        .json({ message: "Error creating user", error: error.message });
    }

    res.status(201).json({
      message: "Faculty added successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error in addFaculty:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getSemestersByBatch,
  getAllUsers,
  addBatch,
  getAllBatches,
  addSemester,
  addSubject,
  getSubjectsByBatchAndSemester,
  addUniqueSubDegree,
  addUniqueSubDiploma,
  getSubjects,
  getDropdownData,
  assignSubject,
  addFaculty,
=======
module.exports = {
    registerUser,
    loginUser,
    getAllUsers,

>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
};
