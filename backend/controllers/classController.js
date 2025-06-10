const Class = require('../models/class');
const Semester = require('../models/semester');
const Batch = require('../models/batch');
const { Op } = require('sequelize');

// Get all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll({
            include: [{
                model: Semester,
                include: [Batch]
            }]
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get classes by semester ID
exports.getClassesBySemester = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const classes = await Class.findAll({
            where: { semesterId },
            include: [{
                model: Semester,
                include: [Batch]
            }]
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new class
exports.createClass = async (req, res) => {
    try {
        const { className, numberOfStudents, semesterId } = req.body;

        // Validate if semester exists
        const semester = await Semester.findByPk(semesterId);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        // Check if class with same name already exists in this semester
        const existingClass = await Class.findOne({
            where: {
                className,
                semesterId
            }
        });

        if (existingClass) {
            return res.status(400).json({ message: 'Class with this name already exists in this semester' });
        }

        const newClass = await Class.create({
            className,
            numberOfStudents,
            semesterId
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create multiple classes
exports.createMultipleClasses = async (req, res) => {
    try {
        const { classes, semesterId } = req.body;

        // Validate if semester exists
        const semester = await Semester.findByPk(semesterId);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        // Check for duplicate class names in the input
        const classNames = classes.map(c => c.className);
        const uniqueClassNames = new Set(classNames);
        if (classNames.length !== uniqueClassNames.size) {
            return res.status(400).json({ message: 'Duplicate class names are not allowed' });
        }

        // Check for existing classes with same names
        const existingClasses = await Class.findAll({
            where: {
                semesterId,
                className: classNames
            }
        });

        if (existingClasses.length > 0) {
            return res.status(400).json({
                message: 'Some classes already exist in this semester',
                existingClasses: existingClasses.map(c => c.className)
            });
        }

        const createdClasses = await Class.bulkCreate(
            classes.map(classData => ({
                ...classData,
                semesterId
            }))
        );

        res.status(201).json(createdClasses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update class
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { className, numberOfStudents } = req.body;

        const classToUpdate = await Class.findByPk(id);
        if (!classToUpdate) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // If className is being changed, check for duplicates
        if (className && className !== classToUpdate.className) {
            const existingClass = await Class.findOne({
                where: {
                    className,
                    semesterId: classToUpdate.semesterId,
                    id: { [Op.ne]: id }
                }
            });

            if (existingClass) {
                return res.status(400).json({ message: 'Class with this name already exists in this semester' });
            }
        }

        await classToUpdate.update({
            className,
            numberOfStudents
        });

        res.json(classToUpdate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete class
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classToDelete = await Class.findByPk(id);

        if (!classToDelete) {
            return res.status(404).json({ message: 'Class not found' });
        }

        await classToDelete.destroy();
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 