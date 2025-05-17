<<<<<<< HEAD
const { supabase } = require("../config/supabaseClient");

// Define table names
const TABLES = {
  USERS: "users",
  BATCHES: "batches",
  SEMESTERS: "semesters",
  FACULTIES: "faculties",
  SUBJECTS: "subjects",
  UNIQUE_SUB_DEGREES: "unique_sub_degrees",
  UNIQUE_SUB_DIPLOMAS: "unique_sub_diplomas",
  ASSIGN_SUBJECTS: "assign_subjects",
  COMPONENT_WEIGHTAGES: "component_weightages",
  COMPONENT_MARKS: "component_marks",
  STUDENTS: "students",
  GETTED_MARKS: "getted_marks",
  PARTICIPATION_TYPES: "participation_types",
  STUDENT_POINTS: "student_points",
  EVENT_MASTER: "event_master",
};

// Helper function to create model functions
const createModel = (tableName) => ({
  findAll: () => supabase.from(tableName).select("*"),
  findOne: (where) =>
    supabase.from(tableName).select("*").match(where).single(),
  create: (data) => supabase.from(tableName).insert(data).select(),
  update: (where, data) =>
    supabase.from(tableName).update(data).match(where).select(),
  delete: (where) => supabase.from(tableName).delete().match(where),
});

// Create models for all tables
const models = {
  User: createModel(TABLES.USERS),
  Batch: createModel(TABLES.BATCHES),
  Semester: createModel(TABLES.SEMESTERS),
  Faculty: createModel(TABLES.FACULTIES),
  Subject: createModel(TABLES.SUBJECTS),
  UniqueSubDegree: createModel(TABLES.UNIQUE_SUB_DEGREES),
  UniqueSubDiploma: createModel(TABLES.UNIQUE_SUB_DIPLOMAS),
  AssignSubject: createModel(TABLES.ASSIGN_SUBJECTS),
  ComponentWeightage: createModel(TABLES.COMPONENT_WEIGHTAGES),
  ComponentMarks: createModel(TABLES.COMPONENT_MARKS),
  Student: createModel(TABLES.STUDENTS),
  Gettedmarks: createModel(TABLES.GETTED_MARKS),
  ParticipationType: createModel(TABLES.PARTICIPATION_TYPES),
  StudentPoints: createModel(TABLES.STUDENT_POINTS),
  EventMaster: createModel(TABLES.EVENT_MASTER),
};

// Initialize function to check if tables exist
const syncDB = async () => {
  try {
    console.log("Checking Supabase tables...");

    // List all tables
    const { data: tables, error } = await supabase
      .from("_tables")
      .select("name");

    if (error) {
      console.error("Error checking tables:", error);
      return;
    }

    console.log("Tables checked successfully");
    return true;
  } catch (error) {
    console.error("Error during table check:", error);
    throw error;
  }
};

module.exports = { ...models, syncDB, TABLES };
=======
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

module.exports = { User, Batch, Semester, Faculty, Subject, UniqueSubDegree, UniqueSubDiploma, AssignSubject, ComponentWeightage, ComponentMarks, Student, Gettedmarks, ParticipationType,SubjectWiseGrades, syncDB };
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
