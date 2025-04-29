const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserPassword() {
  try {
    const email = 'harsh.faculty@marwadiuniversity.edu.in';
    const password = '12345';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    const { data, error } = await supabase
      .from('Users')
      .update({ password: hashedPassword })
      .eq('email', email)
      .select();

    if (error) {
      console.error('Error updating user:', error);
      return;
    }

    console.log('User updated successfully:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserPassword(); 