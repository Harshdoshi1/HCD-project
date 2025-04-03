const CoCurricularActivity = require("../models/co_curricular_activity");
const Student = require("../models/students");

// Get activities by student and semester
exports.getActivitiesByStudentAndSemester = async (req, res) => {
    try {
        const { studentId, semesterId } = req.params;

        const activities = await CoCurricularActivity.findAll({
            where: { studentId, semesterId }
        });

        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching co-curricular activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

// Add or update co-curricular activity
exports.addOrUpdateActivity = async (req, res) => {
    try {
        const { id, ...activityData } = req.body;

        if (id) {
            // Update existing activity
            const [updated] = await CoCurricularActivity.update(activityData, {
                where: { id }
            });

            if (updated) {
                const updatedActivity = await CoCurricularActivity.findByPk(id);
                res.status(200).json(updatedActivity);
            } else {
                res.status(404).json({ message: 'Activity not found' });
            }
        } else {
            // Create new activity
            const newActivity = await CoCurricularActivity.create(activityData);
            res.status(201).json(newActivity);
        }
    } catch (error) {
        console.error("Error creating/updating co-curricular activity:", error);
        res.status(500).json({ message: "Error creating/updating activity", error: error.message });
    }
};

// Delete co-curricular activity
exports.deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const deleted = await CoCurricularActivity.destroy({
            where: { id: activityId }
        });

        if (deleted) {
            res.status(200).json({ message: 'Activity deleted successfully' });
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error("Error deleting co-curricular activity:", error);
        res.status(500).json({ message: "Error deleting activity", error: error.message });
    }
};

// Get all activities for a student
exports.getStudentCoCurricularActivities = async (req, res) => {
    try {
        const { studentId } = req.params;
        const activities = await CoCurricularActivity.findAll({
            where: { studentId }
        });
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching student activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};
