const ExtraCurricularActivity = require("../models/extra_curricular_activity");
const Student = require("../models/students");

// Get activities by enrollment number and semester
exports.getActivitiesByEnrollmentAndSemester = async (req, res) => {
    try {
        const { enrollmentNumber, semesterId } = req.params;

        const activities = await ExtraCurricularActivity.findAll({
            where: { enrollmentNumber, semesterId },
            include: [
                {
                    model: Student,
                    attributes: ["name", "rollNumber"],
                    where: { enrollmentNumber }
                }
            ]
        });

        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching extracurricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

// Add new extracurricular activity
exports.addActivity = async (req, res) => {
    try {
        const {
            enrollmentNumber,
            semesterId,
            activityName,
            achievementLevel,
            date,
            description,
            certificateUrl
        } = req.body;

        // Validate required fields
        if (!enrollmentNumber || !semesterId || !activityName || !date || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["enrollmentNumber", "semesterId", "activityName", "date", "description"]
            });
        }

        // Check if student exists
        const student = await Student.findOne({
            where: { enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found",
                enrollmentNumber
            });
        }

        // Create new activity
        const newActivity = await ExtraCurricularActivity.create({
            enrollmentNumber,
            semesterId,
            activityName,
            achievementLevel,
            date: new Date(date),
            description,
            certificateUrl
        });

        res.status(201).json(newActivity);
    } catch (error) {
        console.error("Error creating extracurricular activity:", error);
        res.status(500).json({ message: "Error creating activity", error: error.message });
    }
};

// Update existing extracurricular activity
exports.updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            enrollmentNumber,
            semesterId,
            activityName,
            achievementLevel,
            date,
            description,
            certificateUrl
        } = req.body;

        // Validate required fields
        if (!enrollmentNumber || !semesterId || !activityName || !date || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["enrollmentNumber", "semesterId", "activityName", "date", "description"]
            });
        }

        // Check if student exists
        const student = await Student.findOne({
            where: { enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found",
                enrollmentNumber
            });
        }

        // Update existing activity
        const [updated] = await ExtraCurricularActivity.update({
            enrollmentNumber,
            semesterId,
            activityName,
            achievementLevel,
            date: new Date(date),
            description,
            certificateUrl
        }, {
            where: { id }
        });

        if (updated) {
            const updatedActivity = await ExtraCurricularActivity.findByPk(id, {
                include: [
                    {
                        model: Student,
                        attributes: ["name", "rollNumber"],
                        where: { enrollmentNumber }
                    }
                ]
            });
            res.status(200).json(updatedActivity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error("Error updating extracurricular activity:", error);
        res.status(500).json({ message: "Error updating activity", error: error.message });
    }
};

// Delete extracurricular activity
exports.deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const deleted = await ExtraCurricularActivity.destroy({
            where: { id: activityId }
        });

        if (deleted) {
            res.status(200).json({ message: 'Activity deleted successfully' });
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error("Error deleting extracurricular activity:", error);
        res.status(500).json({ message: "Error deleting activity", error: error.message });
    }
};

// Get all activities for a student by enrollment number
exports.getStudentExtraCurricularActivities = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        const activities = await ExtraCurricularActivity.findAll({
            where: { enrollmentNumber },
            order: [['date', 'DESC']],
            include: [
                {
                    model: Student,
                    attributes: ["name", "rollNumber"],
                    where: { enrollmentNumber }
                }
            ]
        });
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching student's extracurricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};
