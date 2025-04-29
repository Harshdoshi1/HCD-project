const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function registerUser() {
  try {
    const name = "Harsh Faculty";
    const email = "harsh.faculty@marwadiuniversity.edu.in";
    const password = "12345";
    const role = "Faculty";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating user:", error);
      return;
    }

    console.log("User created successfully:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

registerUser();
