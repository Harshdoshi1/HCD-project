const sequelize = require('../config/db');
const User = require('./users');
const Batch = require('./batch');
const Semester = require('./semester');
const Faculty = require('./faculty');
const Subject = require('./subjects');
const UniqueSubDegree = require('./uniqueSubDegree');
const UniqueSubDiploma = require('./uniqueSubDiploma');
const AssignSubject = require('./assignSubject');
const ComponentWeightage = require('./componentWeightage');
const ComponentMarks = require('./componentMarks');
const Student = require('./students');
const Gettedmarks = require('./gettedmarks');
const SubjectWiseGrades = require('./SubjectWiseGrades');
const ParticipationType = require('./participationTypes');
const CourseOutcome = require('./courseOutcome');
const SubjectComponentCo = require('./subjectComponentCo');
const ClassSection = require('./classSection');
const EventOutcomes = require('./EventOutcomes');
const EventOutcomeMapping = require('./EventOutcomeMapping');
const SubComponents = require('./subComponents');
const StudentMarks = require('./studentMarks');
const StudentBloomsDistribution = require('./StudentBloomsDistribution');
const BloomsTaxonomy = require('./bloomsTaxonomy');   


// Import associations to set up relationships
require('./associations');

// const CoCurricularActivity = require('./cocurricularActivity');
// const ExtraCurricularActivity = require('./extraCurricularActivity');
// const CoCurricularActivities = require('./coCurricularActivity');

const syncDB = async () => {
    try {
        console.log('Starting database synchronization...');

        // First check if tables exist
        const tables = await sequelize.query('SHOW TABLES', { type: sequelize.QueryTypes.SELECT });
        const tableNames = tables.map(table => Object.values(table)[0]);

        // If no tables exist, create them
        if (tableNames.length === 0) {
            console.log('No tables found. Creating all tables...');
            await sequelize.sync({ force: true });
        } else {
            // If tables exist, sync with alter option
            console.log('Tables found. Synchronizing with alter option...');
            await sequelize.sync({ alter: true });
        }

        console.log('Database synchronization completed successfully.');
    } catch (error) {
        console.error('Error during database synchronization:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    Batch,
    Semester,
    Faculty,
    Subject,
    UniqueSubDegree,
    UniqueSubDiploma,
    AssignSubject,
    ComponentWeightage,
    ComponentMarks,
    Student,
    Gettedmarks,
    SubjectWiseGrades,
    ParticipationType,
    CourseOutcome,
    SubjectComponentCo,
    ClassSection,
    EventOutcomes,
    EventOutcomeMapping,
    SubComponents,
    StudentMarks,
    StudentBloomsDistribution,
    BloomsTaxonomy,
    syncDB
};
