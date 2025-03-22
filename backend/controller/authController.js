const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Faculty, Batch, Semester, Subject, UniqueSubDegree, UniqueSubDiploma } = require('../models'); // Import models
const { Op } = require("sequelize"); // Ensure Op is imported


// ✅ Add Subject (Check if already assigned to batch & semester)
const assignSubject = async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); // Debugging

        const { subjects } = req.body;
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: "Invalid or empty subjects array" });
        }

        for (const subject of subjects) {
            const { subjectName, semesterNumber, batchName } = subject;

            if (!subjectName || !semesterNumber || !batchName) {
                return res.status(400).json({ message: "Missing subjectName, semesterNumber, or batchName" });
            }

            const batch = await Batch.findOne({ where: { batchName } });
            if (!batch) {
                return res.status(404).json({ message: `Batch '${batchName}' not found` });
            }

            const semester = await Semester.findOne({ where: { semesterNumber, batchId: batch.id } });
            if (!semester) {
                return res.status(404).json({ message: `Semester '${semesterNumber}' not found for batch '${batchName}'` });
            }

            const existingSubject = await Subject.findOne({
                where: { subjectName, semesterId: semester.id, batchId: batch.id }
            });

            if (existingSubject) {
                return res.status(400).json({ message: `Subject '${subjectName}' already assigned to this batch and semester` });
            }

            await Subject.create({ subjectName, semesterId: semester.id, batchId: batch.id });
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
        return res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};



const getSubjects = async (req, res) => {
    try {
        // const { program } = req.body;

        // if (!program || (program !== 'degree' && program !== 'diploma')) {
        //     return res.status(400).json({ message: "Invalid or missing program parameter" });
        // }

        // let subjects;
        // if (program === 'degree') {
            subjects = await UniqueSubDegree.findAll();
        // } else if (program === 'diploma') {
        //     subjects = await UniqueSubDiploma.findAll();
        // }

        return res.status(200).json({ subjects });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};




// Function to add a unique subject for Degree
const addUniqueSubDegree = async (req, res) => {
    try {
        const { sub_code, sub_level, sub_name, sub_credit } = req.body;

        if (!sub_code || !sub_level || !sub_name || !sub_credit) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const subject = await UniqueSubDegree.create({ sub_code, sub_level, sub_name, sub_credit });
        return res.status(201).json({ message: 'Degree subject added successfully', subject });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding degree subject', error: error.message });
    }
};

// Function to add a unique subject for Diploma
const addUniqueSubDiploma = async (req, res) => {
    try {
        const { sub_code, sub_level, sub_name, sub_credit } = req.body;

        if (!sub_code || !sub_level || !sub_name || !sub_credit) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const subject = await UniqueSubDiploma.create({ sub_code, sub_level, sub_name, sub_credit });
        return res.status(201).json({ message: 'Diploma subject added successfully', subject });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding diploma subject', error: error.message });
    }
};

module.exports = { addUniqueSubDegree, addUniqueSubDiploma };


const getSubjectsByBatchSemesterandFaculty = async (req, res) => {
    try {
        const { batchName, semesterNumber, facultyId } = req.body; // Read from request body
        console.log("Received:", batchName, semesterNumber, facultyId);

        if (!batchName || !semesterNumber || !facultyId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find faculty name from Users table using facultyId
        const faculty = await User.findOne({ where: { id: facultyId }, attributes: ["name"] });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }
        console.log("Faculty Name:", faculty.name);

        // Fetch all subject codes assigned to the faculty from AssignSubjects table
        const assignedSubjects = await AssignSubjects.findAll({
            where: { facultyId },
            attributes: ["subjectCode"], // Fetch only subject codes
        });

        if (!assignedSubjects.length) {
            console.log("No assigned subjects found for this faculty.");
        } else {
            const subjectCodes = assignedSubjects.map(sub => sub.subjectCode);
            console.log("Assigned Subject Codes:", subjectCodes);
        }

        // Find batch ID from batchName
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Find semester where batchId matches
        const semester = await Semester.findOne({ where: { semesterNumber, batchId: batch.id } });
        if (!semester) {
            return res.status(404).json({ message: "Semester not found for this batch" });
        }

        // Fetch subjects where facultyName matches the fetched faculty's name
        const subjects = await Subject.findAll({
            where: { semesterId: semester.id, batchId: batch.id, facultyName: faculty.name }
        });

        if (!subjects.length) {
            return res.status(404).json({ message: "No subjects found for this semester, batch, and faculty" });
        }

        // Get subject names from subjects
        const subjectNames = subjects.map(s => s.subjectName);

        // Fetch sub_code and sub_level from UniqueSubDegree using sub_name
        const uniqueSubs = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ["sub_name", "sub_code", "sub_level"], // Fetch only required attributes
        });

        // Send the response properly formatted
        res.status(200).json({
            facultyName: faculty.name,
            assignedSubjects,
            subjects,
            uniqueSubjects: uniqueSubs
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getSubjectsByBatchAndSemester = async (req, res) => {
    try {
        const { batchName, semesterNumber } = req.params;

        // Find batch ID from batchName
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Find semester where batchId matches
        const semester = await Semester.findOne({ where: { semesterNumber, batchId: batch.id } });
        if (!semester) {
            return res.status(404).json({ message: "Semester not found for this batch" });
        }

        // Fetch subjects for the given batch and semester
        const subjects = await Subject.findAll({ where: { semesterId: semester.id, batchId: batch.id } });

        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found for this semester and batch" });
        }

        // Get subject names from subjects
        const subjectNames = subjects.map(s => s.subjectName);

        // Fetch sub_code and sub_level from UniqueSubDegree using sub_name
        const uniqueSubs = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ["sub_name", "sub_code", "sub_level"], // Fetch only required attributes
        });

        // Send the response properly formatted
        res.status(200).json({
            subjects,
            uniqueSubjects: uniqueSubs
        });
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
        const batches = await Batch.findAll(); // Sequelize equivalent of find()
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add Subject
const addSubject = async (req, res) => {
    try {
        const { name, code, courseType, credits, subjectType } = req.body;

        if (courseType === 'degree') {
            await UniqueSubDegree.create({
                sub_code: code,
                sub_name: name,
                sub_credit: credits,
                sub_level: subjectType
            });
        } else if (courseType === 'diploma') {
            await UniqueSubDiploma.create({
                sub_code: code,
                sub_name: name,
                sub_credit: credits,
                sub_level: subjectType
            });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        res.status(201).json({ message: 'Subject added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding subject', details: error.message });
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
        if (isNaN(new Date(batchStart).getTime()) || isNaN(new Date(batchEnd).getTime())) {
            return res.status(400).json({ message: "Invalid date format for batchStart or batchEnd" });
        }

        // Validate that courseType is either "Degree" or "Diploma"
        if (!['Degree', 'Diploma'].includes(courseType)) {
            return res.status(400).json({ message: "Invalid courseType. It must be 'Degree' or 'Diploma'" });
        }

        // Check if batch already exists
        const existingBatch = await Batch.findOne({ where: { batchName } });
        if (existingBatch) {
            return res.status(400).json({ message: "Batch already exists" });
        }

        // Create the new batch
        const batch = await Batch.create({
            batchName,
            batchStart: new Date(batchStart),  // Convert to Date object
            batchEnd: new Date(batchEnd),      // Convert to Date object
            courseType
        });

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
        console.log("Received request with params:", req.params); // Debugging log

        const { batchName } = req.params; // Use params instead of query
        if (!batchName) {
            console.log("❌ Missing batchName in request.");
            return res.status(400).json({ message: "Batch name is required." });
        }

        console.log(`🔍 Searching for batch: ${batchName}`);
        const batch = await Batch.findOne({ where: { batchName } });

        if (!batch) {
            console.log(`❌ Batch '${batchName}' not found in DB.`);
            return res.status(404).json({ message: "Batch not found." });
        }

        console.log(`✅ Found batch with ID: ${batch.id}, fetching semesters...`);
        const semesters = await Semester.findAll({ where: { batchId: batch.id } });

        if (!semesters.length) {
            console.log(`⚠️ No semesters found for batch ID: ${batch.id}`);
            return res.status(404).json({ message: "No semesters found for this batch." });
        }

        console.log(`✅ Found ${semesters.length} semesters. Sending response.`);
        res.status(200).json(semesters);
    } catch (error) {
        console.error("❌ Server Error:", error.message);
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
    addSemester,
    addSubject,
    getSubjectsByBatchAndSemester,
    addUniqueSubDegree,
    addUniqueSubDiploma,
    getSubjects,
    getDropdownData,
    assignSubject,
    getSubjectsByBatchSemesterandFaculty
};
