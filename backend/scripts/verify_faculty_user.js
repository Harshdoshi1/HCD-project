require("dotenv").config();
const { supabase } = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

async function verifyAndUpdateFacultyUser() {
  try {
    const email = "harsh.faculty@marwadiuniversity.edu.in";

    // First, check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return;
    }

    if (!existingUser) {
      console.error(
        "User not found in database. Please add the user first in Supabase."
      );
      return;
    }

    console.log("User found in database:", existingUser);

    // Check if password needs to be hashed
    if (!existingUser.password.startsWith("$2")) {
      console.log("Password needs to be hashed. Updating...");
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        existingUser.password,
        saltRounds
      );

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          password: hashedPassword,
        })
        .eq("email", email)
        .select();

      if (updateError) {
        console.error("Error updating user:", updateError);
        return;
      }

      console.log("User password hashed successfully:", updatedUser);
    } else {
      console.log(
        "User data is correct and password is already hashed:",
        existingUser
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

verifyAndUpdateFacultyUser();
