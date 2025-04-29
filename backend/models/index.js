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
