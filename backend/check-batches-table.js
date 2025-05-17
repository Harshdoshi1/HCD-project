const { supabase } = require("./config/supabaseClient");

async function checkBatchesTable() {
  try {
    console.log("Checking batches table...");

    // Check if table exists
    const { data: tables, error: tablesError } = await supabase
      .from("_tables")
      .select("name");

    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      return;
    }

    console.log("Available tables:", tables);

    // Try to fetch batches
    const { data: batches, error: batchesError } = await supabase
      .from("batches")
      .select("*");

    if (batchesError) {
      console.error("Error fetching batches:", batchesError);
      return;
    }

    console.log("Batches in table:", batches);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkBatchesTable();
