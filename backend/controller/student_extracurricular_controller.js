const ExtraCurricularActivity = require("../models/extra_curricular_activity");
const Student = require("../models/students");

// Get activities by student and semester
exports.getActivitiesByStudentAndSemester = async (req, res) => {
    try {
        const { studentId, semesterId } = req.params;

        const activities = await ExtraCurricularActivity.findAll({
            where: { studentId, semesterId },
            include: [
                {
                    model: Student,
                    attributes: ["name", "rollNumber"]
                }
            ]
        });

        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching extracurricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

// Add or update extracurricular activity
exports.addOrUpdateActivity = async (req, res) => {
    try {
        const { id, ...activityData } = req.body;

        if (id) {
            // Update existing activity
            const [updated] = await ExtraCurricularActivity.update(activityData, {
                where: { id }
            });

            if (updated) {
                const updatedActivity = await ExtraCurricularActivity.findByPk(id, {
                    include: [
                        {
                            model: Student,
                            attributes: ["name", "rollNumber"]
                        }
                    ]
                });
                res.status(200).json(updatedActivity);
            } else {
                res.status(404).json({ message: 'Activity not found' });
            }
        } else {
            // Create new activity
            const newActivity = await ExtraCurricularActivity.create(activityData);
            res.status(201).json(newActivity);
        }
    } catch (error) {
        console.error("Error creating/updating extracurricular activity:", error);
        res.status(500).json({ message: "Error creating/updating activity", error: error.message });
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

// Get all activities for a student
exports.getStudentExtraCurricularActivities = async (req, res) => {
    try {
        const { studentId } = req.params;
        const activities = await ExtraCurricularActivity.findAll({
            where: { studentId },
            order: [['date', 'DESC']],
            include: [
                {
                    model: Student,
                    attributes: ["name", "rollNumber"]
                }
            ]
        });
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching student's extracurricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};
