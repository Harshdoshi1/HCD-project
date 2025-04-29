const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createOrUpdateUser() {
  try {
    const name = 'Harsh Faculty';
    const email = 'harsh.faculty@marwadiuniversity.edu.in';
    const password = '12345';
    const role = 'Faculty';

    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          name,
          password: hashedPassword,
          role
        })
        .eq('email', email)
        .select();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return;
      }

      console.log('User updated successfully:', updatedUser);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            name,
            email,
            password: hashedPassword,
            role
          }
        ])
        .select();

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }

      console.log('User created successfully:', newUser);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createOrUpdateUser(); 