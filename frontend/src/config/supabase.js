import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please check your environment variables."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
});

// Define table names
export const TABLES = {
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

export default supabase;
