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
const Gettedmarks = require('./gettedmarks');
const CoCurricularActivity = require('./co_curricular_activity');

const syncDB = async () => {
    try {
        // Drop all tables first
        await sequelize.drop();
        
        // Recreate all tables
        await sequelize.sync({ alter: true });
        console.log('All tables synchronized successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = { User, Batch, Semester, Faculty, Subject, UniqueSubDegree, UniqueSubDiploma, AssignSubject, ComponentWeightage, ComponentMarks, Student, Gettedmarks, CoCurricularActivity, syncDB };
