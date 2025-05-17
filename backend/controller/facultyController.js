const bcrypt = require('bcrypt');
const { supabase } = require('../config/db');

const createAssignSubject = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const batch = req.body.batch.value;
        const semester = req.body.semester.value;
        const subject = req.body.subject.value;
        const faculty = req.body.faculty.label;
        console.log("assigned received: ", batch, "--", semester, "--", subject, "--", faculty);

        // Find Batch ID & Course Type
        const { data: batchRecord, error: batchError } = await supabase
            .from('batches')
            .select('id, program')
            .eq('name', batch)
            .single();

        if (batchError || !batchRecord) {
            return res.status(400).json({ error: "Batch not found" });
        }
        console.log("Batch Found:", batchRecord);

        // Find Subject based on program type
        const tableName = batchRecord.program === 'Degree' ? 'unique_sub_degree' : 'unique_sub_diploma';
        const { data: subjectRecord, error: subjectError } = await supabase
            .from(tableName)
            .select('sub_code')
            .eq('sub_name', subject)
            .single();

        if (subjectError || !subjectRecord) {
            return res.status(400).json({ error: "Subject not found" });
        }
        console.log("Subject Found:", subjectRecord);

        // Create assignment
        const { data: assignSubject, error: assignError } = await supabase
            .from('assign_subjects')
            .insert({
                batch_id: batchRecord.id,
                semester_id: semester,
                faculty_name: faculty,
                subject_code: subjectRecord.sub_code
            })
            .select()
            .single();

        if (assignError) {
            console.error("Error assigning subject:", assignError);
            return res.status(500).json({ error: assignError.message });
        }

        console.log("Assigned Subject:", assignSubject);
        res.status(201).json(assignSubject);
    } catch (error) {
        console.error("Error in createAssignSubject:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get all AssignSubject entries
const getAllAssignSubjects = async (req, res) => {
    try {
        const { data: assignSubjects, error } = await supabase
            .from('assign_subjects')
            .select(`
                *,
                batches!inner(*),
                semesters!inner(*),
                unique_sub_degree(*),
                unique_sub_diploma(*)
            `);

        if (error) {
            console.error('Error fetching assign subjects:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(assignSubjects);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single AssignSubject entry by ID
const getAssignSubjectById = async (req, res) => {
    try {
        const { data: assignSubject, error } = await supabase
            .from('assign_subjects')
            .select(`
                *,
                batches!inner(*),
                semesters!inner(*),
                unique_sub_degree(*),
                unique_sub_diploma(*)
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !assignSubject) {
            return res.status(404).json({ message: 'AssignSubject not found' });
        }

        res.status(200).json(assignSubject);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update an AssignSubject entry
const updateAssignSubject = async (req, res) => {
    try {
        const { batch_id, semester_id, faculty_name, subject_code } = req.body;

        const { data: assignSubject, error } = await supabase
            .from('assign_subjects')
            .update({ 
                batch_id, 
                semester_id, 
                faculty_name, 
                subject_code 
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating assign subject:', error);
            return res.status(404).json({ message: 'Failed to update AssignSubject' });
        }

        res.status(200).json(assignSubject);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete an AssignSubject entry
// const deleteAssignSubject = async (req, res) => {
//     try {
//         const { error } = await supabase
//             .from('assign_subjects')
//             .delete()
//             .eq('id', req.params.id);

//         if (error) {
//             console.error('Error deleting assign subject:', error);
//             return res.status(404).json({ message: 'Failed to delete AssignSubject' });
//         }
// const getSubjectsByFaculty = async (req, res) => {
//     try {
//         const { facultyId } = req.params;
//         console.log("getted facultyId", facultyId);

//         const facultyName = await User.findOne({ where: { id: facultyId } });
//         console.log("getted facultyName", facultyName.name);
//         const assignSubjects = await AssignSubject.findAll({
            
//             where: { facultyName: facultyName.name },
//             include: [
//                 {
//                     model: Batch,
//                     attributes: ['batchName', 'courseType']
//                 }
//                 ,
//                 // {
//                 //     model: Semester,
//                 //     attributes: ['semesterNumber']
//                 // },
//                 {
//                     model: UniqueSubDegree,
//                     attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level'],
//                     required: false
//                 }
//                 ,
//                 {
//                     model: UniqueSubDiploma,
//                     attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level'],
//                     required: false
//                 }
//             ]
//         });
//         console.log("getted assignSubjects", assignSubjects);
//         // Transform the data to match the frontend's expected format
//         const formattedSubjects = assignSubjects.map(assignSubject => {
//             const subject = assignSubject.UniqueSubDegree || assignSubject.UniqueSubDiploma;
//             return {
//                 id: assignSubject.id,
//                 name: subject.sub_name,
//                 code: subject.sub_code,
//                 credits: subject.sub_credit,
//                 type: subject.sub_level,
//                 description: subject.sub_name,
//                 department: assignSubject.Batch.courseType,
//                 semester: `${assignSubject.Semester.semesterNumber} Semester`,
//                 batch: assignSubject.Batch.batchName
//             };
//         });

//         res.status(200).json(formattedSubjects);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// Get subjects assigned to a specific faculty
const getSubjectsByFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;
        console.log("Requested facultyId:", facultyId);

        // Find faculty name using ID
        const { data: faculty, error: facultyError } = await supabase
            .from('users')
            .select('name')
            .eq('id', facultyId)
            .single();

        if (facultyError || !faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Get assigned subjects with related data
        const { data: assignSubjects, error: subjectsError } = await supabase
            .from('assign_subjects')
            .select(`
                id,
                semester_id,
                batches!inner(name, program),
                unique_sub_degree(sub_code, sub_name, sub_credit, sub_level),
                unique_sub_diploma(sub_code, sub_name, sub_credit, sub_level)
            `)
            .eq('faculty_name', faculty.name);

        if (subjectsError) {
            console.error('Error fetching subjects:', subjectsError);
            return res.status(500).json({ error: subjectsError.message });
        }

        console.log("Fetched assignSubjects:", assignSubjects?.length || 0);

        // Format results
        const formattedSubjects = assignSubjects.map(assignSubject => {
            const subject = assignSubject.unique_sub_degree || assignSubject.unique_sub_diploma;
            return {
                id: assignSubject.id,
                name: subject?.sub_name || 'N/A',
                code: subject?.sub_code || 'N/A',
                credits: subject?.sub_credit || 'N/A',
                type: subject?.sub_level || 'N/A',
                description: subject?.sub_name || 'N/A',
                department: assignSubject.batches.program,
                batch: assignSubject.batches.name,
                semesterId: assignSubject.semester_id
            };
        });

        res.status(200).json(formattedSubjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: error.message });
    }
};

const addFaculty = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (role.toLowerCase() !== 'faculty') {
            return res.status(400).json({ message: 'Invalid role. Only faculty can be added.' });
        }

        // Check if faculty already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'Faculty already exists' });
        }

        // Try to sign in first to check if user exists in auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        let authUser;

        if (signInError && signInError.status !== 400) {
            // If error is not 'Invalid login credentials', then it's an unexpected error
            console.error('Sign in error:', signInError);
            return res.status(500).json({
                message: 'Registration failed',
                error: signInError.message
            });
        }

        if (signInData?.user) {
            // User exists in auth system
            authUser = signInData.user;
        } else {
            // User doesn't exist, create new auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: 'faculty'
                    }
                }
            });

            if (authError) {
                console.error('Auth error:', authError);
                return res.status(400).json({
                    message: 'Registration failed',
                    error: authError.message
                });
            }

            if (!authData?.user) {
                return res.status(400).json({
                    message: 'Registration failed',
                    error: 'User creation failed'
                });
            }

            authUser = authData.user;
        }

        // Create user record in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                auth_id: authUser.id,
                name,
                email,
                role: 'faculty'
            })
            .select()
            .single();

        if (userError) {
            console.error('Database error:', userError);
            // Clean up auth user if db insert fails
            await supabase.auth.admin.deleteUser(authUser.id);
            return res.status(500).json({
                message: 'Registration failed',
                error: userError.message
            });
        }

        // Create faculty record
        const { data: facultyData, error: facultyError } = await supabase
            .from('faculty')
            .insert({
                user_id: userData.id
            })
            .select()
            .single();

        if (facultyError) {
            console.error('Faculty error:', facultyError);
            // Clean up user and auth records if faculty creation fails
            await supabase
                .from('users')
                .delete()
                .eq('id', userData.id);
            await supabase.auth.admin.deleteUser(authUser.id);
            return res.status(500).json({
                message: 'Registration failed',
                error: facultyError.message
            });
        }

        // Automatically confirm the email
        await supabase.rpc('confirm_user', { user_id: authUser.id });

        res.status(201).json({
            message: 'Faculty registered successfully',
            user: userData,
            faculty: facultyData
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
module.exports = {
    updateAssignSubject,
    getAssignSubjectById,
    createAssignSubject,
    addFaculty,
    // deleteAssignSubject,
    getAllAssignSubjects,
    getSubjectsByFaculty
};