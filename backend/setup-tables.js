const { supabase } = require("./config/supabaseClient");

async function setupTables() {
  try {
    console.log('Setting up subjects table...');

    // Create subjects table
    const { error: createError } = await supabase
      .from('subjects')
      .insert([
        {
          name: 'Test Subject',
          code: 'TEST101',
          course_type: 'degree',
          credits: 3,
          subject_type: 'central'
        }
      ])
      .select();

    if (createError) {
      if (createError.code === '42P01') {
        console.log('Table does not exist, creating it...');
        const { error: tableError } = await supabase.schema.raw(`
          CREATE TABLE IF NOT EXISTS subjects (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) NOT NULL UNIQUE,
            course_type VARCHAR(50) NOT NULL,
            credits INTEGER NOT NULL,
            subject_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
          );
        `);

        if (tableError) {
          console.error('Error creating table:', tableError);
          return;
        }
        console.log('Subjects table created successfully');
      } else {
        console.error('Error testing table:', createError);
      }
    } else {
      console.log('Subjects table already exists and is working');
    }

  } catch (error) {
    console.error('Error setting up tables:', error);
  }
}

setupTables();
