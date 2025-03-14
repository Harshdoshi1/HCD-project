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
        const { studentId, semesterId } = req.params;
        const { activityName, achievementLevel, date, description, score } = req.body;

        const [activity, created] = await CoCurricularActivity.findOrCreate({
            where: { studentId, semesterId, activityName },
            defaults: {
                achievementLevel,
                date,
                description,
                score
            }
        });

        if (!created) {
            await activity.update({
                achievementLevel: achievementLevel || activity.achievementLevel,
                date: date || activity.date,
                description: description || activity.description,
                score: score || activity.score
            });
        }

        res.status(200).json(activity);
    } catch (error) {
        console.error("Error adding/updating co-curricular activity:", error);
        res.status(500).json({ message: "Error adding/updating activity", error: error.message });
    }
};

// Delete co-curricular activity
exports.deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await CoCurricularActivity.destroy({ where: { id } });

        if (deleted) {
            res.status(200).json({ message: "Activity deleted successfully" });
        } else {
            res.status(404).json({ message: "Activity not found" });
        }
    } catch (error) {
        console.error("Error deleting co-curricular activity:", error);
        res.status(500).json({ message: "Error deleting activity", error: error.message });
    }
};
