const CoCurricularActivity = require("../models/cocurricularActivity");

// Add new co-curricular activity
const addActivity = async (req, res) => {
    try {
        const activityData = {
            enrollmentNumber: req.body.enrollmentNumber,
            semesterId: req.body.semesterId,
            activityName: req.body.activityName,
            achievementLevel: req.body.achievementLevel,
            date: req.body.date,
            description: req.body.description,
            certificateUrl: req.body.certificateUrl,
            score: req.body.score || 0
        };

        const newActivity = await CoCurricularActivity.create(activityData);
        res.status(201).json(newActivity);
    } catch (error) {
        console.error("Error adding co-curricular activity:", error);
        res.status(500).json({ message: "Error adding activity", error: error.message });
    }
};

// Update existing co-curricular activity
const updateActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const updateData = {
            activityName: req.body.activityName,
            achievementLevel: req.body.achievementLevel,
            date: req.body.date,
            description: req.body.description,
            certificateUrl: req.body.certificateUrl,
            score: req.body.score
        };

        const updated = await CoCurricularActivity.update(updateData, {
            where: { id: activityId }
        });

        if (updated[0] === 1) {
            const updatedActivity = await CoCurricularActivity.findByPk(activityId);
            res.status(200).json(updatedActivity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error("Error updating co-curricular activity:", error);
        res.status(500).json({ message: "Error updating activity", error: error.message });
    }
};

// Delete co-curricular activity
const deleteActivity = async (req, res) => {
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

// Get all activities for a student by enrollment number
const getStudentActivities = async (req, res) => {
    try {
        const { enrollmentNumber } = req.body;
        const activities = await CoCurricularActivity.findAll({
            where: { enrollmentNumber }
        });
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching student activities:", error);
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

module.exports = { getStudentActivities, deleteActivity, updateActivity, addActivity }