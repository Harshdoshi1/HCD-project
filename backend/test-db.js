const { supabase } = require("./config/supabaseClient");

async function testDatabase() {
  try {
    console.log('Testing database connection...');

    // 1. Check if table exists and its structure
    console.log('\n1. Checking table structure:');
    const { data: subjects, error: structureError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('Error checking table structure:', structureError);
      return;
    }

    // 2. Try inserting a test record
    console.log('\n2. Attempting to insert test record:');
    const testData = {
      name: 'Test Subject',
      code: 'TEST101',
      course_type: 'degree',
      credits: 3,
      subject_type: 'central'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('subjects')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('✓ Insert successful');
      console.log('Inserted data:', insertData[0]);
    }

    // 3. Try the exact query that's failing in the controller
    console.log('\n3. Testing the problematic query:');
    const { data: testQuery, error: queryError } = await supabase
      .from('subjects')
      .select('code')
      .eq('code', 'TEST101')
      .single();

    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log('✓ Query successful');
      console.log('Query result:', testQuery);
    }

    // 4. List all records in the table
    console.log('\n4. Current table contents:');
    const { data: allData, error: selectError } = await supabase
      .from('subjects')
      .select('*');

    if (selectError) {
      console.error('Error fetching all records:', selectError);
    } else {
      console.log('All records:', allData);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabase();
