const { supabase } = require("./config/supabaseClient");
const fs = require('fs');
const path = require('path');

async function setupSubjectsTable() {
  try {
    console.log('Setting up subjects table...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-subjects-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL commands
    const { error } = await supabase.rpc('exec_sql', { sql_command: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }

    console.log('✓ Subjects table created successfully');

    // Verify the table structure
    const { data: subjects, error: verifyError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('Error verifying table:', verifyError);
    } else {
      console.log('\nTable structure verified:');
      if (subjects && subjects.length > 0) {
        console.log('Columns:', Object.keys(subjects[0]));
        console.log('Sample data:', subjects[0]);
      } else {
        console.log('Table exists but is empty');
      }
    }
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupSubjectsTable(); 