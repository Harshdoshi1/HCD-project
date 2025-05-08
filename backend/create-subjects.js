const { supabase } = require("./config/supabaseClient");

async function createSubjectsTable() {
  try {
    console.log('Creating subjects table...');

    // First, try to delete the existing table
    try {
      const { error: dropError } = await supabase.schema.raw(`
        DROP TABLE IF EXISTS subjects;
      `);
      if (dropError) {
        console.error('Error dropping table:', dropError);
      } else {
        console.log('✓ Dropped existing table');
      }
    } catch (error) {
      console.log('Note: Could not drop table:', error.message);
    }

    // Create the table
    try {
      const { error: createError } = await supabase.schema.raw(`
        CREATE TABLE IF NOT EXISTS subjects (
          id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
          name text NOT NULL,
          code text NOT NULL UNIQUE,
          course_type text NOT NULL,
          credits integer NOT NULL,
          subject_type text NOT NULL,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);

      if (createError) {
        console.error('Error creating table:', createError);
        return;
      }
      console.log('✓ Created subjects table');
    } catch (error) {
      console.error('Error creating table:', error);
      return;
    }

    // Insert a test record
    const testSubject = {
      name: 'Test Subject',
      code: 'TEST101',
      course_type: 'degree',
      credits: 3,
      subject_type: 'central'
    };

    const { data, error } = await supabase
      .from('subjects')
      .insert([testSubject])
      .select();

    if (error) {
      console.error('Error inserting test data:', error);
    } else {
      console.log('✓ Inserted test record:', data[0]);
    }

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

createSubjectsTable(); 