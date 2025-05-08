const { supabase } = require("./config/supabaseClient");

async function setupTable() {
  try {
    console.log('Setting up subjects table...');

    // First, try to delete the existing table if it exists
    try {
      await supabase.schema.raw('DROP TABLE IF EXISTS subjects');
      console.log('✓ Dropped existing table (if it existed)');
    } catch (error) {
      console.log('Note: Could not drop existing table:', error.message);
    }

    // Create the table with the correct structure
    try {
      await supabase.schema.raw(`
        CREATE TABLE subjects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50) NOT NULL UNIQUE,
          course_type VARCHAR(50) NOT NULL,
          credits INTEGER NOT NULL,
          subject_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('✓ Created subjects table');
    } catch (error) {
      console.error('Error creating table:', error);
      return;
    }

    // Create an index on the code column
    try {
      await supabase.schema.raw('CREATE INDEX idx_subjects_code ON subjects(code);');
      console.log('✓ Created index on code column');
    } catch (error) {
      console.log('Note: Could not create index:', error.message);
    }

    // Insert a test record
    const testData = {
      name: 'Test Subject',
      code: 'TEST101',
      course_type: 'degree',
      credits: 3,
      subject_type: 'central'
    };

    const { data, error } = await supabase
      .from('subjects')
      .insert([testData])
      .select();

    if (error) {
      console.error('Error inserting test data:', error);
    } else {
      console.log('✓ Inserted test record:', data[0]);
    }

    console.log('\nVerifying table structure...');
    const { data: columns, error: columnsError } = await supabase.schema.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'subjects'
      ORDER BY ordinal_position;
    `);

    if (columnsError) {
      console.error('Error verifying table structure:', columnsError);
    } else {
      console.log('Table columns:', columns);
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupTable(); 