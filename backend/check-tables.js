const { supabase } = require("./config/supabaseClient");

async function checkDatabase() {
  try {
    console.log("Checking database structure...\n");

    // 1. List all tables
    console.log("1. Getting list of tables:");
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.error("Error getting tables:", tablesError);
    } else {
      console.log(
        "Tables found:",
        tables.map((t) => t.table_name)
      );
    }

    // 2. Check subjects table specifically
    console.log("\n2. Checking subjects table:");
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("*")
      .limit(1);

    if (subjectsError) {
      console.error("Error accessing subjects table:", subjectsError);
    } else {
      if (subjects && subjects.length > 0) {
        console.log(
          "Subjects table exists with columns:",
          Object.keys(subjects[0])
        );
        console.log("Sample record:", subjects[0]);
      } else {
        console.log("Subjects table exists but is empty");
      }
    }

    // 3. Try raw query to get table structure
    console.log("\n3. Getting subjects table structure:");
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "subjects")
      .eq("table_schema", "public");

    if (columnsError) {
      console.error("Error getting columns:", columnsError);
    } else {
      console.log("Column details:", columns);
    }

    // 4. Try the exact query that's failing
    console.log("\n4. Testing the exact query from the controller:");
    const { data: testData, error: testError } = await supabase
      .from("subjects")
      .select("code")
      .eq("code", "TEST101")
      .single();

    if (testError) {
      console.error("Test query error:", testError);
    } else {
      console.log("Test query successful:", testData);
    }
  } catch (error) {
    console.error("Check failed:", error);
  }
}

checkDatabase();
