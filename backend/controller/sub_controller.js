const { supabase } = require("../config/supabaseClient");

// Add Subject
const addSubject = async (req, res) => {
  try {
    console.log("\n=== Adding New Subject ===");
    console.log("1. Received request body:", req.body);
    const { id, subjectName, semesterId, batchId } = req.body;

    // Log the extracted values
    console.log("2. Extracted values:", {
      id,
      subjectName,
      semesterId,
      batchId,
    });

    // Validate required fields
    if (!id || !subjectName || !semesterId || !batchId) {
      console.log("3. Validation failed - Missing required fields");
      return res.status(400).json({
        error: "All fields are required",
        details: {
          id: !id ? "Subject code is required" : null,
          subjectName: !subjectName ? "Subject name is required" : null,
          semesterId: !semesterId ? "Semester ID is required" : null,
          batchId: !batchId ? "Batch ID is required" : null,
        },
      });
    }

    // Check if subject code already exists
    console.log(`4. Checking if subject code ${id} exists`);
    const { data: existingSubject, error: checkError } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (checkError) {
      console.log("5. Error checking existing subject:", checkError);
      if (checkError.code === "PGRST116") {
        console.log("   Not found - proceeding with insert");
      } else {
        return res.status(500).json({
          error: "Error checking existing subject",
          details: checkError.message,
        });
      }
    }

    if (existingSubject) {
      console.log("5. Subject code already exists:", id);
      return res
        .status(400)
        .json({ error: `Subject with code ${id} already exists` });
    }

    // Prepare the subject data
    const subjectData = {
      id,
      subjectName,
      semesterId: parseInt(semesterId),
      batchId: parseInt(batchId),
    };

    console.log("6. Attempting to insert subject:", subjectData);

    // Insert new subject
    const { data, error } = await supabase
      .from("subjects")
      .insert([subjectData])
      .select();

    if (error) {
      console.log("7. Error inserting subject:", error);
      return res.status(500).json({
        error: "Error inserting subject",
        details: error.message,
        code: error.code,
      });
    }

    console.log("7. Subject added successfully:", data[0]);
    res.status(201).json({
      message: "Subject added successfully",
      subject: data[0],
    });
  } catch (error) {
    console.error("Error in addSubject:", error);
    res.status(500).json({
      error: "Error adding subject",
      details: error.message,
    });
  }
};

// Get Subjects
const getSubjects = async (req, res) => {
  try {
    console.log("\n=== Getting Subjects ===");
    const { batchId, semesterId } = req.query;
    console.log("1. Query params:", { batchId, semesterId });

    let query = supabase.from("subjects").select("*");

    if (batchId) {
      query = query.eq("batchId", parseInt(batchId));
    }
    if (semesterId) {
      query = query.eq("semesterId", parseInt(semesterId));
    }

    const { data: subjects, error } = await query;

    if (error) {
      console.log("2. Error fetching subjects:", error);
      throw error;
    }

    console.log(`2. Found ${subjects?.length || 0} subjects`);
    res.json(subjects);
  } catch (error) {
    console.error("Error in getSubjects:", error);
    res.status(500).json({
      error: "Failed to fetch subjects",
      details: error.message,
    });
  }
};

module.exports = {
  addSubject,
  getSubjects,
};
