require("dotenv").config();
const { supabase } = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

async function updateUserPassword() {
  try {
    const email = "harsh.faculty@marwadiuniversity.edu.in";
    const newPassword = "12345";

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in Supabase
    const { data, error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email)
      .select();

    if (error) {
      console.error("Error updating password:", error);
      return;
    }

    console.log("Password updated successfully:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

updateUserPassword();
