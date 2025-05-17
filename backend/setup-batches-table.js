const { supabase } = require("./config/supabaseClient");
const fs = require("fs");
const path = require("path");

async function setupBatchesTable() {
  try {
    console.log("Setting up batches table...");
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, "create-batches-table.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Split the SQL into individual statements
    const statements = sql
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", { sql: statement });
      if (error) {
        console.error("Error executing SQL:", error);
        return;
      }
    }
    
    console.log("Batches table setup completed successfully");
    
    // Verify the table structure
    const { data: batches, error } = await supabase
      .from("batches")
      .select("*");
    
    if (error) {
      console.error("Error verifying table:", error);
      return;
    }
    
    console.log("Current batches:", batches);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

setupBatchesTable();
