const { supabase } = require("./config/supabaseClient");

async function verifyTables() {
  try {
    console.log("\n=== Verifying Database Tables ===\n");

    // Check unique_sub_degrees table
    console.log("1. Checking unique_sub_degrees table:");
    const { data: degreeData, error: degreeError } = await supabase
      .from("unique_sub_degrees")
      .select("*")
      .limit(1);

    if (degreeError) {
      console.error("Error accessing unique_sub_degrees:", degreeError);
    } else {
      console.log("✓ unique_sub_degrees table is accessible");
      if (degreeData && degreeData.length > 0) {
        console.log("Sample record:", degreeData[0]);
      } else {
        console.log("Table is empty");
      }
    }

    // Check unique_sub_diplomas table
    console.log("\n2. Checking unique_sub_diplomas table:");
    const { data: diplomaData, error: diplomaError } = await supabase
      .from("unique_sub_diplomas")
      .select("*")
      .limit(1);

    if (diplomaError) {
      console.error("Error accessing unique_sub_diplomas:", diplomaError);
    } else {
      console.log("✓ unique_sub_diplomas table is accessible");
      if (diplomaData && diplomaData.length > 0) {
        console.log("Sample record:", diplomaData[0]);
      } else {
        console.log("Table is empty");
      }
    }

    // Try inserting test records
    console.log("\n3. Attempting test inserts:");

    // Test degree subject
    const degreeSubject = {
      sub_code: "TEST101",
      sub_name: "Test Degree Subject",
      sub_credit: 3,
      sub_level: "central",
      program: "Degree",
      semester: 1,
    };

    console.log("\nTrying to insert degree subject:", degreeSubject);
    const { error: degreeInsertError } = await supabase
      .from("unique_sub_degrees")
      .insert([degreeSubject]);

    if (degreeInsertError) {
      console.error("Error inserting degree subject:", degreeInsertError);
    } else {
      console.log("✓ Successfully inserted degree subject");
    }

    // Test diploma subject
    const diplomaSubject = {
      sub_code: "TEST102",
      sub_name: "Test Diploma Subject",
      sub_credit: 3,
      sub_level: "central",
    };

    console.log("\nTrying to insert diploma subject:", diplomaSubject);
    const { error: diplomaInsertError } = await supabase
      .from("unique_sub_diplomas")
      .insert([diplomaSubject]);

    if (diplomaInsertError) {
      console.error("Error inserting diploma subject:", diplomaInsertError);
    } else {
      console.log("✓ Successfully inserted diploma subject");
    }
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

verifyTables();
