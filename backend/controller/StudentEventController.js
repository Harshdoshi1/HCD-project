const { supabase } = require('../config/db');

// Create new event
const createEvent = async (req, res) => {
  try {
    const { eventId, eventName, eventType, eventCategory, points, duration, eventDate } = req.body;
    console.log("Testing ", eventId, eventName, eventType, eventCategory, points, duration, eventDate);
    
    // Insert the event into the event_master table using Supabase
    const { data: event, error } = await supabase
      .from('event_master')
      .insert({
        event_id: eventId,
        event_name: eventName,
        event_type: eventType,
        event_category: eventCategory,
        points: parseInt(points),
        duration: duration ? parseInt(duration) : null,
        date: eventDate
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};



const getAllEventnames = async (req, res) => {
  try {
    // Fetch all events from the event_master table using Supabase
    const { data: events, error } = await supabase
      .from('event_master')
      .select('*');

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      data: events
    });
  } catch (error) {
    console.error('Error fetching event names:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event names',
      error: error.message
    });
  }
};

const insertFetchedStudents = async (req, res) => {
  try {
    const { eventName, participants } = req.body;
    console.log('Request body:', req.body);

    // Input validation
    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Event name is required and must be a string'
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participants data must be a non-empty array'
      });
    }

    console.log('Processing event:', eventName);
    console.log('Number of participants:', participants.length);
    console.log('Sample participants:', participants.slice(0, 3));

    // Fetch event details from event_master table using Supabase
    const { data: event, error: eventError } = await supabase
      .from('event_master')
      .select('*')
      .eq('event_name', eventName.trim())
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: `Event with name '${eventName}' not found`
      });
    }

    console.log('Found event:', event.event_name, 'ID:', event.event_id);

    const eventId = event.event_id;
    const eventType = event.event_type;
    const points = event.points;

    const processedStudents = [];
    const errors = [];

    for (const participant of participants) {
      try {
        const { enrollmentNumber, participationType } = participant;
        console.log('Processing enrollment:', enrollmentNumber, 'Type:', participationType);

        // Find the student using their enrollment number
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('enrollment_number', enrollmentNumber)
          .single();

        if (studentError || !student) {
          console.warn(`Student with enrollment number ${enrollmentNumber} not found.`);
          errors.push({ enrollmentNumber, error: 'Student not found' });
          continue;
        }

        const batchId = student.batch_id;
        console.log('Found student with batchId:', batchId);

        // Find the current semester of the batch
        const { data: batch, error: batchError } = await supabase
          .from('batches')
          .select('*')
          .eq('id', batchId)
          .single();

        if (batchError || !batch) {
          console.warn(`Batch with ID ${batchId} not found.`);
          errors.push({ enrollmentNumber, error: 'Batch not found' });
          continue;
        }

        const currentSemester = batch.current_semester;
        console.log('Current semester:', currentSemester);

        // Check if student points record exists
        const { data: existingPoints, error: pointsError } = await supabase
          .from('student_points')
          .select('*')
          .eq('enrollment_number', enrollmentNumber)
          .eq('semester', currentSemester)
          .single();

        let studentPoints;

        if (pointsError || !existingPoints) {
          // Create a new record if it doesn't exist
          const { data: newPoints, error: createError } = await supabase
            .from('student_points')
            .insert({
              enrollment_number: enrollmentNumber,
              semester: currentSemester,
              event_id: eventId.toString(),
              total_cocurricular: eventType === 'co-curricular' ? points : 0,
              total_extracurricular: eventType === 'extra-curricular' ? points : 0,
              participation_type_id: participationType
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          studentPoints = newPoints;
          console.log('Created new student points record');
        } else {
          // Update the existing record
          const existingEventIds = existingPoints.event_id ? existingPoints.event_id.split(',') : [];
          if (!existingEventIds.includes(eventId.toString())) {
            existingEventIds.push(eventId.toString());
          }

          const updatedCocurricular = eventType === 'co-curricular' 
            ? (existingPoints.total_cocurricular || 0) + points 
            : (existingPoints.total_cocurricular || 0);
            
          const updatedExtracurricular = eventType === 'extra-curricular' 
            ? (existingPoints.total_extracurricular || 0) + points 
            : (existingPoints.total_extracurricular || 0);

          const { data: updatedPoints, error: updateError } = await supabase
            .from('student_points')
            .update({
              event_id: existingEventIds.join(','),
              total_cocurricular: updatedCocurricular,
              total_extracurricular: updatedExtracurricular,
              participation_type_id: participationType
            })
            .eq('enrollment_number', enrollmentNumber)
            .eq('semester', currentSemester)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          studentPoints = updatedPoints;
          console.log('Updated existing student points record');
        }

        processedStudents.push({
          enrollmentNumber,
          currentSemester,
          participationType,
          points: {
            cocurricular: studentPoints.total_cocurricular,
            extracurricular: studentPoints.total_extracurricular
          }
        });
      } catch (error) {
        console.error(`Error processing enrollment ${participant.enrollmentNumber}:`, error);
        errors.push({ enrollmentNumber: participant.enrollmentNumber, error: error.message });
      }
    }

    // Send the final response with both processed students and errors
    res.status(200).json({
      success: true,
      message: 'Students processed',
      data: {
        processed: processedStudents,
        errors: errors,
        summary: {
          total: participants.length,
          successful: processedStudents.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Error processing students:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing students',
      error: error.message
    });
  }
};

const getAllCoCurricularEventsNames = async (req, res) => {
  try {
    // Fetch co-curricular events from the event_master table using Supabase
    const { data: events, error } = await supabase
      .from('event_master')
      .select('event_name')
      .eq('event_type', 'co-curricular');

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Co-curricular events fetched successfully',
      data: events
    });
  } catch (error) {
    console.error('Error fetching co-curricular events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching co-curricular events',
      error: error.message
    });
  }
};

const getAllExtraCurricularEventsNames = async (req, res) => {
  try {
    // Fetch extra-curricular events from the event_master table using Supabase
    const { data: events, error } = await supabase
      .from('event_master')
      .select('event_name')
      .eq('event_type', 'extra-curricular');

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Extra-curricular events fetched successfully',
      data: events
    });
  } catch (error) {
    console.error('Error fetching extra-curricular events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching extra-curricular events',
      error: error.message
    });
  }
};

const getAllParticipationTypes = async (req, res) => {
  try {
    // Fetch participation types from the participation_types table using Supabase
    const { data: participationTypes, error } = await supabase
      .from('participation_types')
      .select('*');

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Participation types fetched successfully',
      data: participationTypes
    });
  } catch (error) {
    console.error('Error fetching participation types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching participation types',
      error: error.message
    });
  }
};

const insertIntoStudentPoints = async (req, res) => {
  try {
    const { enrollmentNumber, semester, eventName, participationTypeId } = req.body;

    // Validate input
    if (!enrollmentNumber || !semester || !eventName || !participationTypeId) {
      return res.status(400).json({
        success: false,
        message: 'All fields (enrollmentNumber, semester, eventName, participationTypeId) are required'
      });
    }

    // Find the event in the event_master table using Supabase
    const { data: event, error: eventError } = await supabase
      .from('event_master')
      .select('*')
      .eq('event_name', eventName.trim())
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: `Event with name '${eventName}' not found`
      });
    }

    const eventId = event.event_id;
    const eventType = event.event_type;
    const points = event.points;

    // Check if a record already exists in student_points for the given enrollment_number and semester
    const { data: existingPoints, error: pointsError } = await supabase
      .from('student_points')
      .select('*')
      .eq('enrollment_number', enrollmentNumber)
      .eq('semester', semester)
      .single();

    let studentPoints;

    if (pointsError || !existingPoints) {
      // Create a new record if it doesn't exist
      const { data: newPoints, error: createError } = await supabase
        .from('student_points')
        .insert({
          enrollment_number: enrollmentNumber,
          semester,
          event_id: eventId.toString(),
          total_cocurricular: eventType === 'co-curricular' ? points : 0,
          total_extracurricular: eventType === 'extra-curricular' ? points : 0,
          participation_type_id: participationTypeId
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      studentPoints = newPoints;
      console.log('Created new student points record');
    } else {
      // Update the existing record
      const existingEventIds = existingPoints.event_id ? existingPoints.event_id.split(',') : [];
      if (!existingEventIds.includes(eventId.toString())) {
        existingEventIds.push(eventId.toString());
      }

      const updatedCocurricular = eventType === 'co-curricular' 
        ? (existingPoints.total_cocurricular || 0) + points 
        : (existingPoints.total_cocurricular || 0);
        
      const updatedExtracurricular = eventType === 'extra-curricular' 
        ? (existingPoints.total_extracurricular || 0) + points 
        : (existingPoints.total_extracurricular || 0);

      const { data: updatedPoints, error: updateError } = await supabase
        .from('student_points')
        .update({
          event_id: existingEventIds.join(','),
          total_cocurricular: updatedCocurricular,
          total_extracurricular: updatedExtracurricular,
          participation_type_id: participationTypeId
        })
        .eq('enrollment_number', enrollmentNumber)
        .eq('semester', semester)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      studentPoints = updatedPoints;
      console.log('Updated existing student points record');
    }

    res.status(200).json({
      success: true,
      message: 'Student points updated successfully',
      data: studentPoints
    });
  } catch (error) {
    console.error('Error inserting into student points:', error);
    res.status(500).json({
      success: false,
      message: 'Error inserting into student points',
      error: error.message
    });
  }
};

const fetchEventsbyEnrollandSemester = async (req, res) => {
  try {
    const { enrollmentNumber, semester } = req.body;

    if (!enrollmentNumber || !semester) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["enrollmentNumber", "semester"]
      });
    }

    // Fetch activities from student_points table using Supabase
    const { data: activities, error } = await supabase
      .from('student_points')
      .select('event_id, total_cocurricular, total_extracurricular')
      .eq('enrollment_number', enrollmentNumber)
      .eq('semester', semester);

    if (error) {
      throw error;
    }

    if (!activities || activities.length === 0) {
      return res.status(200).json({ message: "No activities found for the given enrollment number and semester" });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching student activities with enrollment and semester:", error);
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
};

const fetchEventsIDsbyEnroll = async (req, res) => {
  try {
    const { enrollmentNumber } = req.body;

    if (!enrollmentNumber) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["enrollmentNumber"]
      });
    }

    // Fetch activities from student_points table using Supabase
    const { data: activities, error } = await supabase
      .from('student_points')
      .select('event_id')
      .eq('enrollment_number', enrollmentNumber);

    if (error) {
      throw error;
    }

    if (!activities || activities.length === 0) {
      return res.status(200).json({ message: "No activities found for the given enrollment number" });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching student activities with enrollment:", error);
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
};
const fetchEventsByIds = async (req, res) => {
  try {
    const { eventIds } = req.body;

    if (!eventIds || typeof eventIds !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Event IDs must be provided as a comma-separated string'
      });
    }

    // Split the comma-separated string into an array
    const eventIdArray = eventIds.split(',').map(id => id.trim());

    // Fetch events from event_master table using Supabase
    const { data: events, error } = await supabase
      .from('event_master')
      .select('*')
      .in('event_id', eventIdArray);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      data: events
    });
  } catch (error) {
    console.error('Error fetching events by IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

const fetchEventsByEventIds = async (req, res) => {
  try {
    const { eventIds, eventType } = req.body;

    if (!eventIds || typeof eventIds !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Event IDs must be provided as a comma-separated string'
      });
    }

    // Split the comma-separated string into an array
    const eventIdArray = eventIds.split(',').map(id => id.trim());

    // Fetch events from event_master table using Supabase
    const { data: events, error } = await supabase
      .from('event_master')
      .select('*')
      .in('event_id', eventIdArray)
      .eq('event_type', eventType);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      data: events
    });
  } catch (error) {
    console.error('Error fetching events by IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};
module.exports = {
  createEvent,
  insertFetchedStudents,
  getAllEventnames,
  getAllCoCurricularEventsNames,
  getAllExtraCurricularEventsNames,
  getAllParticipationTypes,
  insertIntoStudentPoints,
  fetchEventsbyEnrollandSemester,
  fetchEventsIDsbyEnroll,
  fetchEventsByIds,
  fetchEventsByEventIds
};
