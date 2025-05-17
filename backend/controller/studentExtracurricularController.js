const { supabase } = require('../config/db');

// Get activities by enrollment number and semester
const getActivitiesByEnrollmentAndSemester = async (req, res) => {
    try {
        const { enrollmentNumber, semesterId } = req.params;

        // First fetch the activities
        const { data: activities, error: activitiesError } = await supabase
            .from('extracurricular_activities')
            .select('*')
            .eq('enrollment_number', enrollmentNumber)
            .eq('semester_id', semesterId);

        if (activitiesError) {
            throw activitiesError;
        }

        // If we need student details, fetch the student separately
        if (activities && activities.length > 0) {
            const { data: student, error: studentError } = await supabase
                .from('students')
                .select('name, enrollment_number')
                .eq('enrollment_number', enrollmentNumber)
                .single();

            if (studentError) {
                throw studentError;
            }

            // Combine the data
            const activitiesWithStudent = activities.map(activity => ({
                ...activity,
                student: student
            }));

            res.status(200).json(activitiesWithStudent);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error fetching extracurricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

// Add new extracurricular activity
const addActivity = async (req, res) => {
    try {
        const {
            enrollmentNumber,
            semesterId,
            activityName,
            achievementLevel,
            date,
            description,
            certificateUrl,
            score
        } = req.body;

        // Validate required fields
        if (!enrollmentNumber || !semesterId || !activityName || !date || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["enrollmentNumber", "semesterId", "activityName", "date", "description"]
            });
        }

        // Check if student exists using Supabase
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('enrollment_number', enrollmentNumber)
            .single();

        if (studentError || !student) {
            return res.status(404).json({
                message: "Student not found",
                enrollmentNumber
            });
        }

        // Create new activity using Supabase
        const { data: newActivity, error: activityError } = await supabase
            .from('extracurricular_activities')
            .insert({
                enrollment_number: enrollmentNumber,
                semester_id: semesterId,
                activity_name: activityName,
                achievement_level: achievementLevel,
                date: new Date(date).toISOString(),
                description,
                certificate_url: certificateUrl,
                score
            })
            .select()
            .single();

        if (activityError) {
            throw activityError;
        }

        res.status(201).json(newActivity);
    } catch (error) {
        console.error("Error creating extracurricular activity:", error);
        res.status(500).json({ message: "Error creating activity", error: error.message });
    }
};

// Update existing extracurricular activity
const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            enrollmentNumber,
            semesterId,
            activityName,
            achievementLevel,
            date,
            description,
            certificateUrl,
            score
        } = req.body;

        // Validate required fields
        if (!enrollmentNumber || !semesterId || !activityName || !date || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["enrollmentNumber", "semesterId", "activityName", "date", "description"]
            });
        }

        // Check if student exists using Supabase
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('enrollment_number', enrollmentNumber)
            .single();

        if (studentError || !student) {
            return res.status(404).json({
                message: "Student not found",
                enrollmentNumber
            });
        }

        // Update existing activity using Supabase
        const { data: updated, error: updateError } = await supabase
            .from('extracurricular_activities')
            .update({
                enrollment_number: enrollmentNumber,
                semester_id: semesterId,
                activity_name: activityName,
                achievement_level: achievementLevel,
                date: new Date(date).toISOString(),
                description,
                certificate_url: certificateUrl,
                score
            })
            .eq('id', id)
            .select();

        if (updateError) {
            throw updateError;
        }

        if (updated && updated.length > 0) {
            // Fetch the student details to include with the response
            const { data: studentDetails, error: studentDetailsError } = await supabase
                .from('students')
                .select('name, enrollment_number')
                .eq('enrollment_number', enrollmentNumber)
                .single();

            if (studentDetailsError) {
                throw studentDetailsError;
            }

            // Combine the activity with student details
            const updatedActivityWithStudent = {
                ...updated[0],
                student: studentDetails
            };

            res.status(200).json(updatedActivityWithStudent);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error("Error updating extracurricular activity:", error);
        res.status(500).json({ message: "Error updating activity", error: error.message });
    }
};

// Delete extracurricular activity
const deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        
        // Delete activity using Supabase
        const { data, error } = await supabase
            .from('extracurricular_activities')
            .delete()
            .eq('id', activityId);

        if (error) {
            throw error;
        }

        // Supabase doesn't return the number of deleted rows by default
        // We can check if the operation was successful by the absence of an error
        res.status(200).json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error("Error deleting extracurricular activity:", error);
        res.status(500).json({ message: "Error deleting activity", error: error.message });
    }
};


const getStudentExtraCurricularActivities = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        console.log("Received enrollment number:", enrollmentNumber);

        // Fetch activities using Supabase
        const { data: activities, error: activitiesError } = await supabase
            .from('extracurricular_activities')
            .select('*')
            .eq('enrollment_number', enrollmentNumber)
            .order('date', { ascending: false });

        if (activitiesError) {
            throw activitiesError;
        }

        if (activities && activities.length > 0) {
            // Fetch student details
            const { data: student, error: studentError } = await supabase
                .from('students')
                .select('name, enrollment_number')
                .eq('enrollment_number', enrollmentNumber)
                .single();

            if (studentError) {
                throw studentError;
            }

            // Combine activities with student details
            const activitiesWithStudent = activities.map(activity => ({
                ...activity,
                student: student
            }));

            res.status(200).json(activitiesWithStudent);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error fetching student's extracurricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

const getextraStudentActivities = async (req, res) => {
    try {
        const { enrollmentNumber } = req.body;
        
        // Fetch activities using Supabase
        const { data: activities, error } = await supabase
            .from('extracurricular_activities')
            .select('*')
            .eq('enrollment_number', enrollmentNumber);

        if (error) {
            throw error;
        }

        res.status(200).json(activities || []);
    } catch (error) {
        console.error("Error fetching student activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

const getextraStudentActivitieswithenrollmentandSemester = async (req, res) => {
    try {
        const { enrollmentNumber, semesterId } = req.body;

        if (!enrollmentNumber || !semesterId) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["enrollmentNumber", "semesterId"]
            });
        }

        // Fetch activities using Supabase
        const { data: activities, error } = await supabase
            .from('extracurricular_activities')
            .select('*')
            .eq('enrollment_number', enrollmentNumber)
            .eq('semester_id', semesterId);

        if (error) {
            throw error;
        }

        if (!activities || activities.length === 0) {
            return res.status(200).json({ message: "No activities found for the given enrollment number and semester" });
        }

        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching student activities with enrollment and semester:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};
module.exports = { getextraStudentActivitieswithenrollmentandSemester, getStudentExtraCurricularActivities, getextraStudentActivities, getActivitiesByEnrollmentAndSemester, addActivity, updateActivity, deleteActivity }