const sequelize = require('../config/db');
const User = require('./users');
const Batch = require('./batch');
const Semester = require('./semester');
const Faculty = require('./faculty');
const Subject = require('./subjects');
const UniqueSubDegree = require('./uniqueSubDegree');
const UniqueSubDiploma = require('./uniqueSubDiploma');
const AssignSubject = require('./assignSubject');
const ComponentWeightage = require('./component_weightage');
const ComponentMarks = require('./component_marks');
const Student = require('./students');

const syncDB = async () => {
    try {
        // First try to authenticate
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        
        // Then sync the tables
        await sequelize.sync({ alter: false }); // Changed to false to prevent automatic alterations
        console.log('✅ All tables synchronized.');
    } catch (error) {
        console.error('❌ Error with database:', error);
        throw error; // Propagate the error
    }
};

module.exports = { User, Batch, Semester, Faculty, Subject, UniqueSubDegree, UniqueSubDiploma, AssignSubject, ComponentWeightage, ComponentMarks, Student, syncDB };
