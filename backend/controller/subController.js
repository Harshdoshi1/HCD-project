const { supabase } = require('../config/db');

// Add Subject
const addSubject = async (req, res) => {
    try {
        const { name, code, courseType, credits, subjectType, semester } = req.body;

        if (courseType === 'degree') {
            const { error } = await supabase
                .from('unique_sub_degrees')
                .insert({
                    sub_code: code,
                    sub_name: name,
                    sub_credit: credits,
                    sub_level: subjectType,
                    semester: semester,
                    program: 'Degree'
                });

            if (error) throw error;
        } else if (courseType === 'diploma') {
            const { error } = await supabase
                .from('unique_sub_diplomas')
                .insert({
                    sub_code: code,
                    sub_name: name,
                    sub_credit: credits,
                    sub_level: subjectType
                });

            if (error) throw error;
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        res.status(201).json({ message: 'Subject added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding subject', details: error.message });
    }
};

// Get subject with components
const getSubjectWithComponents = async (req, res) => {
    try {
        const { subjectCode } = req.params;

        // Get subject
        const { data: subject, error: subjectError } = await supabase
            .from('unique_sub_degrees')
            .select(`
                *,
                weightage:component_weightages(*),
                marks:component_marks(*)
            `)
            .eq('sub_code', subjectCode)
            .single();

        if (subjectError) throw subjectError;

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json(subject);
    } catch (error) {
        console.error('Error getting subject with components:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Subject by Code and Course Type
const getSubjectByCode = async (req, res) => {
    try {
        const { code, courseType } = req.params;

        const { data: subject, error } = await supabase
            .from(courseType === 'degree' ? 'unique_sub_degrees' : 'unique_sub_diplomas')
            .select('*')
            .eq('sub_code', code)
            .single();

        if (error) throw error;

        if (!courseType.match(/^(degree|diploma)$/i)) {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching subject', details: error.message });
    }
};
// Add Subject (Check if already assigned to batch & semester)
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

            // Get batch
            const { data: batch, error: batchError } = await supabase
                .from('batches')
                .select('id')
                .eq('batch_name', batchName)
                .single();

            if (batchError || !batch) {
                return res.status(404).json({ message: `Batch '${batchName}' not found` });
            }

            // Get semester
            const { data: semester, error: semesterError } = await supabase
                .from('semesters')
                .select('id')
                .eq('semester_number', semesterNumber)
                .eq('batch_id', batch.id)
                .single();

            if (semesterError || !semester) {
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

// Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const { code, courseType } = req.params;
        let deleted;

        if (courseType === 'degree') {
            deleted = await UniqueSubDegree.destroy({ where: { sub_code: code } });
        } else if (courseType === 'diploma') {
            deleted = await UniqueSubDiploma.destroy({ where: { sub_code: code } });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        if (!deleted) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting subject', details: error.message });
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
        const subjects = await UniqueSubDegree.findAll();


        return res.status(200).json({ subjects });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

const getSubjectsByBatchAndSemester = async (req, res) => {
    try {
        const { batchName, semesterNumber } = req.params;
        console.log(`Fetching subjects for batch: ${batchName}, semester: ${semesterNumber}`);

        // Find batch ID from batchName using Supabase
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('name', batchName)
            .single();

        if (batchError || !batch) {
            console.log(`Batch not found: ${batchName}`);
            return res.status(404).json({ message: "Batch not found" });
        }

        console.log(`Found batch with ID: ${batch.id}`);

        // Find semester where batch_id matches using Supabase
        const { data: semester, error: semesterError } = await supabase
            .from('semesters')
            .select('id')
            .eq('semester_number', semesterNumber)
            .eq('batch_id', batch.id)
            .single();

        if (semesterError || !semester) {
            console.log(`Semester ${semesterNumber} not found for batch ID: ${batch.id}`);
            return res.status(404).json({ message: "Semester not found for this batch" });
        }

        console.log(`Found semester with ID: ${semester.id}`);

        // Fetch subjects for the given batch and semester using Supabase
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('*')
            .eq('semester_id', semester.id)
            .eq('batch_id', batch.id);

        if (subjectsError) {
            throw subjectsError;
        }

        if (!subjects || subjects.length === 0) {
            console.log(`No subjects found for semester ID: ${semester.id} and batch ID: ${batch.id}`);
            return res.status(404).json({ message: "No subjects found for this semester and batch" });
        }

        console.log(`Found ${subjects.length} subjects`);

        // Get subject names from subjects
        const subjectNames = subjects.map(s => s.subject_name);

        // Fetch details from unique_sub_degrees using sub_name using Supabase
        const { data: uniqueSubs, error: uniqueSubsError } = await supabase
            .from('unique_sub_degrees')
            .select('sub_name, sub_code, sub_level')
            .in('sub_name', subjectNames);

        if (uniqueSubsError) {
            throw uniqueSubsError;
        }

        console.log(`Found ${uniqueSubs ? uniqueSubs.length : 0} unique subjects`);

        // Send the response properly formatted
        res.status(200).json({
            subjects,
            uniqueSubjects: uniqueSubs || []
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



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


const addSubjectWithComponents = async (req, res) => {
    try {
        const { subject, name, credits, type, componentsWeightage, componentsMarks } = req.body;

        // Validate input
        if (!subject || !name || !credits) {
            return res.status(400).json({
                error: 'Missing required fields',
                received: { subject, name, credits }
            });
        }

        if (!componentsWeightage || !componentsMarks || !Array.isArray(componentsWeightage) || !Array.isArray(componentsMarks)) {
            return res.status(400).json({
                error: 'Invalid component data',
                received: { componentsWeightage, componentsMarks }
            });
        }

        // Check if subject exists in UniqueSubDegree
        const { data: existingSubject, error: subjectError } = await supabase
            .from('unique_sub_degree')
            .select('*')
            .eq('sub_code', subject)
            .single();

        if (subjectError && subjectError.code !== 'PGRST116') throw subjectError;

        // Create or update subject
        const subjectData = {
            sub_code: subject,
            sub_name: name,
            sub_credit: credits,
            sub_level: type || 'central',
            program: 'Degree'
        };

        const { data: subjectRecord, error: upsertError } = await supabase
            .from('unique_sub_degree')
            .upsert(subjectData)
            .select()
            .single();

        if (upsertError) throw upsertError;

        // Prepare mapping helper
        function mapComponents(components) {
            const map = { ESE: 0, CSE: 0, IA: 0, TW: 0, VIVA: 0 };
            if (Array.isArray(components)) {
                components.forEach(comp => {
                    if (comp.name && typeof comp.value === 'number') {
                        const key = comp.name.toUpperCase();
                        if (map.hasOwnProperty(key)) {
                            map[key] = comp.value;
                        }
                    } else if (comp.name && typeof comp.weightage === 'number') {
                        // fallback for weightage
                        const key = comp.name.toUpperCase();
                        if (map.hasOwnProperty(key)) {
                            map[key] = comp.weightage;
                        }
                    }
                });
            }
            return map;
        }

        // Map weightages and marks
        const weightageMap = mapComponents(componentsWeightage);
        const marksMap = mapComponents(componentsMarks);

        // Upsert into ComponentWeightage
        const weightageData = {
            subject_id: subject,
            ese: weightageMap.ESE,
            cse: weightageMap.CSE,
            ia: weightageMap.IA,
            tw: weightageMap.TW,
            viva: weightageMap.VIVA
        };

        const { data: weightage, error: weightageError } = await supabase
            .from('component_weightage')
            .upsert(weightageData)
            .select()
            .single();

        if (weightageError) throw weightageError;

        // Upsert into ComponentMarks
        const marksData = {
            subject_id: subject,
            ese: marksMap.ESE,
            cse: marksMap.CSE,
            ia: marksMap.IA,
            tw: marksMap.TW,
            viva: marksMap.VIVA
        };

        const { data: marks, error: marksError } = await supabase
            .from('component_marks')
            .upsert(marksData)
            .select()
            .single();

        if (marksError) throw marksError;

        res.status(201).json({
            subject: subjectRecord,
            weightage,
            marks
        });
    } catch (error) {
        console.error("Error adding subject with components:", error);
        res.status(500).json({ error: error.message });
    }
};

const getSubjectComponentsWithSubjectCode = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        console.log('Fetching components for subject code:', subjectCode);

        // Find the subject by code
        const subject = await UniqueSubDegree.findOne({ where: { sub_code: subjectCode } });
        if (!subject) {
            console.log('Subject not found with code:', subjectCode);
            return res.status(404).json({ error: 'Subject not found' });
        }

        console.log('Found subject:', subject.sub_code, subject.sub_name);

        // Use the subject's sub_code as the subjectId in the related tables
        const weightage = await ComponentWeightage.findOne({ where: { subjectId: subject.sub_code } });
        const marks = await ComponentMarks.findOne({ where: { subjectId: subject.sub_code } });

        console.log('Component weightage:', weightage);
        console.log('Component marks:', marks);

        // If no weightage or marks are found, return empty objects
        res.status(200).json({
            subject,
            weightage: weightage || {},
            marks: marks || {}
        });
    } catch (error) {
        console.error('Error getting subject components:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all unique subjects from UniqueSubDegrees
const getAllUniqueSubjects = async (req, res) => {
    try {
        // Fetch unique subjects using Supabase
        const { data: subjects, error } = await supabase
            .from('unique_sub_degrees')
            .select('*');
        
        if (error) throw error;
        
        console.log(`Found ${subjects.length} unique subjects`);
        return res.status(200).json({ subjects });
    } catch (error) {
        console.error('Error fetching unique subjects:', error);
        return res.status(500).json({ message: "Error fetching unique subjects", error: error.message });
    }
};

// Get subjects by batch
const getSubjectsByBatch = async (req, res) => {
    try {
        const { batchName } = req.params;
        console.log(`Fetching subjects for batch: ${batchName}`);
        
        // First get the batch ID using Supabase
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('name', batchName)
            .single();
            
        if (batchError || !batch) {
            console.log(`Batch not found: ${batchName}`);
            return res.status(404).json({ message: "Batch not found" });
        }
        
        console.log(`Found batch with ID: ${batch.id}`);
        
        // Get all subjects assigned to this batch using Supabase
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, subject_name, batch_id, semester_id')
            .eq('batch_id', batch.id);
            
        if (subjectsError) {
            throw subjectsError;
        }
        
        console.log(`Found ${subjects ? subjects.length : 0} subjects for batch ID: ${batch.id}`);
        
        // Get all unique subjects from unique_sub_degrees using Supabase
        const { data: uniqueSubjects, error: uniqueSubjectsError } = await supabase
            .from('unique_sub_degrees')
            .select('*');
            
        if (uniqueSubjectsError) {
            throw uniqueSubjectsError;
        }
        
        console.log(`Found ${uniqueSubjects ? uniqueSubjects.length : 0} unique subjects`);
        
        return res.status(200).json({ 
            subjects: subjects || [],
            uniqueSubjects: uniqueSubjects || []
        });
    } catch (error) {
        console.error('Error fetching subjects by batch:', error);
        return res.status(500).json({ message: "Error fetching subjects by batch", error: error.message });
    }
};

// Get all subjects with their related information
const getAllSubjectsWithDetails = async (req, res) => {
    try {
        // Find all subjects with their related batch and semester information
        const subjects = await Subject.findAll({
            include: [
                {
                    model: Batch,
                    attributes: ['batchName', 'courseType']
                },
                {
                    model: Semester,
                    attributes: ['semesterNumber']
                }
            ]
        });

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }

        // Get the unique subject codes and names from UniqueSubDegree
        const subjectNames = subjects.map(s => s.subjectName);
        const uniqueSubjectsInfo = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level', 'program']
        });

        // Map the unique subject info to each subject
        const subjectsWithDetails = subjects.map(subject => {
            const uniqueInfo = uniqueSubjectsInfo.find(u => u.sub_name === subject.subjectName);
            return {
                id: subject.id,
                subjectName: subject.subjectName,
                batchId: subject.batchId,
                semesterId: subject.semesterId,
                batchName: subject.Batch ? subject.Batch.batchName : null,
                semesterNumber: subject.Semester ? subject.Semester.semesterNumber : null,
                courseType: subject.Batch ? subject.Batch.courseType : null,
                sub_code: uniqueInfo ? uniqueInfo.sub_code : null,
                sub_credit: uniqueInfo ? uniqueInfo.sub_credit : null,
                sub_level: uniqueInfo ? uniqueInfo.sub_level : null,
                program: uniqueInfo ? uniqueInfo.program : null
            };
        });

        return res.status(200).json({ subjects: subjectsWithDetails });
    } catch (error) {
        console.error("Error fetching subjects with details:", error);
        return res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

// Get subjects by batch
const getSubjectsByBatchWithDetails = async (req, res) => {
    try {
        const { batchName } = req.params;
        
        // Find batch ID from batchName
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }
        
        // Find all subjects for this batch with their related semester information
        const subjects = await Subject.findAll({
            where: { batchId: batch.id },
            include: [
                {
                    model: Semester,
                    attributes: ['semesterNumber']
                }
            ]
        });
        
        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found for this batch" });
        }
        
        // Get the unique subject codes and names from UniqueSubDegree
        const subjectNames = subjects.map(s => s.subjectName);
        const uniqueSubjectsInfo = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level', 'program']
        });
        
        // Map the unique subject info to each subject
        const subjectsWithDetails = subjects.map(subject => {
            const uniqueInfo = uniqueSubjectsInfo.find(u => u.sub_name === subject.subjectName);
            return {
                id: subject.id,
                subjectName: subject.subjectName,
                batchId: subject.batchId,
                semesterId: subject.semesterId,
                semesterNumber: subject.Semester ? subject.Semester.semesterNumber : null,
                sub_code: uniqueInfo ? uniqueInfo.sub_code : null,
                sub_credit: uniqueInfo ? uniqueInfo.sub_credit : null,
                sub_level: uniqueInfo ? uniqueInfo.sub_level : null,
                program: uniqueInfo ? uniqueInfo.program : null
            };
        });
        
        return res.status(200).json({ subjects: subjectsWithDetails });
    } catch (error) {
        console.error("Error fetching subjects by batch:", error);
        return res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

// Get subjects by batch and semester
const getSubjectsByBatchAndSemesterWithDetails = async (req, res) => {
    try {
        const { batchName, semesterNumber } = req.params;
        
        // Find batch ID from batchName
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }
        
        // Find semester ID from semesterNumber and batchId
        const semester = await Semester.findOne({ 
            where: { 
                semesterNumber: parseInt(semesterNumber), 
                batchId: batch.id 
            } 
        });
        if (!semester) {
            return res.status(404).json({ message: "Semester not found for this batch" });
        }
        
        // Find all subjects for this batch and semester
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('*')
            .eq('batch_id', batch.id)
            .eq('semester_id', semester.id);

        if (subjectsError) throw subjectsError;
        
        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found for this batch and semester" });
        }
        
        // Get the unique subject codes and names from UniqueSubDegree
        const subjectNames = subjects.map(s => s.subjectName);
        const uniqueSubjectsInfo = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level', 'program']
        });
        
        // Map the unique subject info to each subject
        const subjectsWithDetails = subjects.map(subject => {
            const uniqueInfo = uniqueSubjectsInfo.find(u => u.sub_name === subject.subjectName);
            return {
                id: subject.id,
                subjectName: subject.subjectName,
                batchId: subject.batchId,
                semesterId: subject.semesterId,
                semesterNumber: parseInt(semesterNumber),
                sub_code: uniqueInfo ? uniqueInfo.sub_code : null,
                sub_credit: uniqueInfo ? uniqueInfo.sub_credit : null,
                sub_level: uniqueInfo ? uniqueInfo.sub_level : null,
                program: uniqueInfo ? uniqueInfo.program : null
            };
        });
        
        return res.status(200).json({ subjects: subjectsWithDetails });
    } catch (error) {
        console.error("Error fetching subjects by batch and semester:", error);
        return res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

module.exports = { 
    getSubjectsByBatchAndSemester, 
    addSubject, 
    getSubjectWithComponents, 
    addSubjectWithComponents, 
    getDropdownData, 
    getSubjectsByBatchSemesterandFaculty, 
    assignSubject, 
    getSubjectByCode, 
    deleteSubject, 
    getSubjects, 
    addUniqueSubDegree, 
    addUniqueSubDiploma, 
    getSubjectComponentsWithSubjectCode, 
    getAllUniqueSubjects, 
    getSubjectsByBatch,
    getAllSubjectsWithDetails,
    getSubjectsByBatchWithDetails,
    getSubjectsByBatchAndSemesterWithDetails 
};
