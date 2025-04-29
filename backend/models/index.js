<<<<<<< Updated upstream
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

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('All tables synchronized.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = { User, Batch, Semester, Faculty, Subject, UniqueSubDegree, UniqueSubDiploma, AssignSubject, ComponentWeightage, syncDB };
=======
const supabase = require("../supabaseClient");

// Define table names
const TABLES = {
  USERS: "users",
  BATCHES: "Batches",
  SEMESTERS: "Semesters",
  FACULTIES: "Faculties",
  SUBJECTS: "Subjects",
  UNIQUE_SUB_DEGREES: "UniqueSubDegrees",
  UNIQUE_SUB_DIPLOMAS: "UniqueSubDiplomas",
  ASSIGN_SUBJECTS: "AssignSubjects",
  COMPONENT_WEIGHTAGES: "ComponentWeightages",
  COMPONENT_MARKS: "ComponentMarks",
  STUDENTS: "Students",
  GETTED_MARKS: "Gettedmarks",
  PARTICIPATION_TYPES: "ParticipationTypes",
  STUDENT_POINTS: "StudentPoints",
  EVENT_MASTER: "EventMaster",
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
>>>>>>> Stashed changes
