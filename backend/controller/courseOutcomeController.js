const CourseOutcome = require('../models/courseOutcome');
const Subject = require('../models/subject'); // Assuming subject model path

// Get all course outcomes for a specific subject
exports.getCourseOutcomesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const subjectExists = await Subject.findByPk(subjectId);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const courseOutcomes = await CourseOutcome.findAll({
            where: { subject_id: subjectId },
            order: [['co_code', 'ASC']]
        });
        res.status(200).json(courseOutcomes);
    } catch (error) {
        console.error('Error fetching course outcomes:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a specific course outcome by ID
exports.getCourseOutcomeById = async (req, res) => {
    try {
        const { id } = req.params;
        const courseOutcome = await CourseOutcome.findByPk(id);
        if (!courseOutcome) {
            return res.status(404).json({ message: 'Course Outcome not found' });
        }
        res.status(200).json(courseOutcome);
    } catch (error) {
        console.error('Error fetching course outcome by ID:', error);
        res.status(500).json({ error: error.message });
    }
};

// Note: Creation, update, deletion might be better handled within the subject creation/update flow
// or if independent CO management is truly needed.
