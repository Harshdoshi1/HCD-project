const { supabase } = require("./config/supabaseClient");

async function listTables() {
  try {
    console.log("Checking database structure...\n");

    // List all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from("subjects")
      .select()
      .limit(1);

    if (tablesError) {
      console.error("Error accessing subjects table:", tablesError);
    } else {
      console.log("Successfully accessed subjects table");
      if (tables && tables.length > 0) {
        console.log("Available columns:", Object.keys(tables[0]));
      } else {
        console.log("Table is empty");
      }
    }

    // Try to insert a test record
    const testData = {
      name: "Test Subject",
      code: "TEST101",
      course_type: "degree",
      credits: 3,
      subject_type: "central",
    };

    console.log("\nTrying to insert test record:", testData);

    const { data: insertData, error: insertError } = await supabase
      .from("subjects")
      .insert([testData])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);

      // If insert failed, try to get table definition
      console.log("\nAttempting to get table definition...");
      const { data: def, error: defError } = await supabase.rpc(
        "get_table_definition",
        { table_name: "subjects" }
      );

      if (defError) {
        console.error("Could not get table definition:", defError);
      } else {
        console.log("Table definition:", def);
      }
    } else {
      console.log("Insert successful:", insertData[0]);
    }
  } catch (error) {
    console.error("Script failed:", error);
  }
}

listTables();
