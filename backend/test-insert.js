const { supabase } = require("./config/supabaseClient");

async function testInsert() {
  try {
    console.log('Testing subject insertion...\n');

    const testSubject = {
      name: 'Test Subject',
      code: 'TEST101',
      course_type: 'degree',
      credits: 3,
      subject_type: 'central'
    };

    console.log('Attempting to insert:', testSubject);

    const { data, error } = await supabase
      .from('subjects')
      .insert([testSubject])
      .select();

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Inserted record:', data[0]);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testInsert(); 