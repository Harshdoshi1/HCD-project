const { supabase } = require('../config/db');

exports.getStudentMarksByBatchAndSubject = async (req, res) => {
    try {
        const { batchId } = req.params;
        console.log("Received check:", batchId);

        const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .eq('batch_id', batchId);

        if (error) throw error;

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "No students found for this batch" });
        }

        console.log('Students:', students);

        res.status(200).json(students.map(student => student.toJSON()));
    } catch (error) {
        console.error("Error fetching student marks:", error);
        res.status(500).json({ message: "Error fetching student marks", error: error.stack });
    }
};
exports.getStudentsByBatchAndSemester = async (req, res) => {
    try {
        const { batchId, semesterId } = req.params;
        console.log("Received check:", batchId, semesterId);

        const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .eq('batch_id', batchId)
            .eq('currnet_semester', semesterId);

        if (error) throw error;

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "No students found for this batch and semester" });
        }

        console.log('Students:', students);

        res.status(200).json(students.map(student => student.toJSON()));
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error: error.stack });
    }
};
exports.getStudentMarksByBatchAndSubject1 = async (req, res) => {
    try {
        const { batchId } = req.params;
        console.log("Received check:", batchId);

        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('batch_name', batchId)
            .single();

        if (batchError) throw batchError;
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // console.log('Batch:', batch);

        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('batch_id', batch.id);

        if (studentsError) throw studentsError;

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "No students found for this batch" });
        }

        console.log('Students:', students);

        res.status(200).json(students.map(student => student.toJSON()));
    } catch (error) {
        console.error("Error fetching student marks:", error);
        res.status(500).json({ message: "Error fetching student marks", error: error.stack });
    }
};

exports.updateStudentMarks = async (req, res) => {
    try {
        const { studentId, subjectId } = req.params;
        const { ese, cse, ia, tw, viva, facultyId, response } = req.body;

        console.log('Updating marks for student:', studentId, 'and subject:', subjectId);

        // Ensure subject exists
        const { data: subjectExists, error: subjectError } = await supabase
            .from('unique_sub_degrees')
            .select('sub_code')
            .eq('sub_code', subjectId)
            .single();

        if (subjectError) throw subjectError;

        if (!subjectExists) {
            return res.status(400).json({ error: `Subject ID ${subjectId} does not exist.` });
        }

        // Try to get existing marks
        const { data: existingMarks, error: getError } = await supabase
            .from('getted_marks')
            .select('*')
            .eq('student_id', studentId)
            .eq('subject_id', subjectId)
            .single();

        if (getError && getError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw getError;
        }

        if (existingMarks) {
            // Update existing marks
            const { data: marks, error: updateError } = await supabase
                .from('getted_marks')
                .update({
                    faculty_id: facultyId,
                    ...(ese !== undefined && { ese }),
                    ...(cse !== undefined && { cse }),
                    ...(ia !== undefined && { ia }),
                    ...(tw !== undefined && { tw }),
                    ...(viva !== undefined && { viva }),
                    ...(response !== undefined && { faculty_response: response })
                })
                .eq('student_id', studentId)
                .eq('subject_id', subjectId)
                .select()
                .single();

            if (updateError) throw updateError;
            return marks;
        } else {
            // Create new marks
            const { data: marks, error: insertError } = await supabase
                .from('getted_marks')
                .insert({
                    student_id: studentId,
                    subject_id: subjectId,
                    faculty_id: facultyId,
                    ese: ese || 0,
                    cse: cse || 0,
                    ia: ia || 0,
                    tw: tw || 0,
                    viva: viva || 0,
                    faculty_response: response || ''
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return marks;
        }

        res.status(200).json({ message: 'Marks updated successfully', data: marks });

    } catch (error) {
        console.error("Error updating student marks:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

exports.getSubjectNamefromCode = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const { data: subject, error } = await supabase
            .from('unique_sub_degrees')
            .select('sub_name')
            .eq('sub_code', subjectCode)
            .single();

        if (error) throw error;
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json({ subjectName: subject.sub_name });
    } catch (error) {
        console.error("Error fetching subject name:", error);
        res.status(500).json({ message: "Error fetching subject name", error: error.stack });
    }
};

exports.getBatchIdfromName = async (req, res) => {
    try {
        const { batchName } = req.params;
        
        if (!batchName) {
            return res.status(400).json({ error: "Batch name is required" });
        }

        const { data: batch, error } = await supabase
            .from('batches')
            .select('id')
            .eq('batch_name', batchName)
            .single();

        if (error) throw error;

        if (!batch) {
            return res.status(404).json({ error: `Batch with name ${batchName} not found` });
        }

        res.status(200).json({ batchId: batch.id });
    } catch (error) {
        console.error("Error fetching batch ID:", error);
        res.status(500).json({ message: "Error fetching batch ID", error: error.stack });
    }
};

exports.getSubjectByBatchAndSemester = async (req, res) => {
    try {
        const { batchId, semesterId, facultyName } = req.params;

        if (!facultyName) {
            return res.status(400).json({ error: "Faculty name is required" });
        }

        const { data: assignedSubjects, error } = await supabase
            .from('assign_subjects')
            .select('subject_code')
            .eq('batch_id', batchId)
            .eq('semester_id', semesterId)
            .eq('faculty_name', facultyName)
            .order('faculty_name', { ascending: true });

        if (error) throw error;

        res.status(200).json(assignedSubjects);
    } catch (error) {
        console.error("Error fetching assigned subjects:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
