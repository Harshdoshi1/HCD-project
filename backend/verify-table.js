const { supabase } = require("./config/supabaseClient");

async function verifyTable() {
  try {
    console.log('Verifying subjects table...');

    // Test select
    const { data: subjects, error: selectError } = await supabase
      .from('subjects')
      .select('*');

    if (selectError) {
      console.error('Error selecting from subjects:', selectError);
      return;
    }

    console.log('\nTable contents:', subjects);

    // Test the specific query that was failing
    const { data: testData, error: testError } = await supabase
      .from('subjects')
      .select('code')
      .eq('code', 'TEST101')
      .single();

    if (testError) {
      console.error('\nTest query error:', testError);
    } else {
      console.log('\nTest query successful:', testData);
    }

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyTable(); 