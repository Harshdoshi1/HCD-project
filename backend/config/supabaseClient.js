require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "Key exists" : "Key missing");

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase URL or Anonymous Key. Please check your environment variables."
  );
}

// Initialize Supabase client with explicit options
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
});

// Test the connection
supabase
  .from("users")
  .select("count")
  .then(
    () => console.log("Supabase connection successful"),
    (error) => console.error("Supabase connection error:", error)
  );

module.exports = { supabase };
