const EventMaster = require('../models/EventMaster');
const StudentPoints = require('../models/StudentPoints');
const Batch = require('../models/batch');
const Student = require('../models/students');
const ParticipationType = require('../models/participationTypes');

// Create new event
const createEvent = async (req, res) => {
  try {
    const { eventId, eventName, eventType, eventCategory, points, duration, eventDate } = req.body;
    console.log("Testing ", eventId, eventName, eventType, eventCategory, points, duration, eventDate);
    const event = await EventMaster.create({
      eventId,
      eventName,
      eventType,
      eventCategory,
      points: parseInt(points),
      duration: duration ? parseInt(duration) : null,
      date: eventDate // Changed from eventDate to date to match the model
    });

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
    const events = await EventMaster.findAll();

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
    const { eventName, participants: jsonData } = req.body;
    console.log('Request body:', req.body);

    // Input validation
    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Event name is required and must be a string'
      });
    }

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participants data must be a non-empty array'
      });
    }

    console.log('Processing event:', eventName);
    console.log('Number of participants:', jsonData.length);
    console.log('Sample participants:', jsonData.slice(0, 3));

    // Fetch event details from EventMaster table
    const event = await EventMaster.findOne({
      where: { eventName: eventName.trim() }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event with name '${eventName}' not found`
      });
    }

    console.log('Found event:', event.eventName, 'ID:', event.eventId);

    const { eventId, eventType, points } = event;

    // const result = [];

    const processedStudents = [];
    const errors = [];

    for (const enrollment of jsonData) {
      try {
        console.log('Processing enrollment:', enrollment);

        // Find the student's batch using their enrollment number
        const student = await Student.findOne({
          where: { enrollmentNumber: enrollment }
        });

        if (!student) {
          console.warn(`Student with enrollment number ${enrollment} not found.`);
          errors.push({ enrollmentNumber: enrollment, error: 'Student not found' });
          continue;
        }

        const batchId = student.batchId;
        console.log('Found student with batchId:', batchId);

        // Find the current semester of the batch
        const batch = await Batch.findOne({
          where: { id: batchId }
        });

        if (!batch) {
          console.warn(`Batch with ID ${batchId} not found.`);
          errors.push({ enrollmentNumber: enrollment, error: 'Batch not found' });
          continue;
        }

        const currentSemester = batch.currentSemester;
        console.log('Current semester:', currentSemester);

        let studentPoints = await StudentPoints.findOne({
          where: { enrollmentNumber: enrollment, semester: currentSemester }
        });

        if (!studentPoints) {
          studentPoints = await StudentPoints.create({
            enrollmentNumber: enrollment,
            semester: currentSemester,
            eventId: eventId.toString(),
            totalCocurricular: eventType === 'co-curricular' ? points : 0,
            totalExtracurricular: eventType === 'extra-curricular' ? points : 0
          });
          console.log('Created new student points record');
        } else {
          const existingEventIds = studentPoints.eventId ? studentPoints.eventId.split(',') : [];
          if (!existingEventIds.includes(eventId.toString())) {
            existingEventIds.push(eventId.toString());
          }

          studentPoints.eventId = existingEventIds.join(',');

          if (eventType === 'co-curricular') {
            studentPoints.totalCocurricular += points;
          } else if (eventType === 'extra-curricular') {
            studentPoints.totalExtracurricular += points;
          }

          await studentPoints.save();
          console.log('Updated existing student points record');
        }

        processedStudents.push({
          enrollmentNumber: enrollment,
          currentSemester,
          points: {
            cocurricular: studentPoints.totalCocurricular,
            extracurricular: studentPoints.totalExtracurricular
          }
        });
      } catch (error) {
        console.error(`Error processing enrollment ${enrollment}:`, error);
        errors.push({ enrollmentNumber: enrollment, error: error.message });
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
          total: jsonData.length,
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
    const events = await EventMaster.findAll({
      where: { eventType: 'co-curricular' },
      attributes: ['eventName'] // Only select the eventName attribute
    });
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
    const events = await EventMaster.findAll({
      where: { eventType: 'extra-curricular' },
      attributes: ['eventName'] // Only select the eventName attribute
    });
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
    const participationTypes = await ParticipationType.findAll({
      attributes: ['types'] // Only select the 'type' attribute
    });
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

    // Find the event in the EventMaster table
    const event = await EventMaster.findOne({
      where: { eventName: eventName.trim() }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event with name '${eventName}' not found`
      });
    }

    const { eventId, eventType, points } = event;

    // Check if a record already exists in StudentPoints for the given enrollmentNumber and semester
    let studentPoints = await StudentPoints.findOne({
      where: { enrollmentNumber, semester }
    });

    if (!studentPoints) {
      // Create a new record if it doesn't exist
      studentPoints = await StudentPoints.create({
        enrollmentNumber,
        semester,
        eventId: eventId.toString(),
        totalCocurricular: eventType === 'co-curricular' ? points : 0,
        totalExtracurricular: eventType === 'extra-curricular' ? points : 0,
        participationTypeId
      });
      console.log('Created new student points record');
    } else {
      // Update the existing record
      const existingEventIds = studentPoints.eventId ? studentPoints.eventId.split(',') : [];
      if (!existingEventIds.includes(eventId.toString())) {
        existingEventIds.push(eventId.toString());
      }

      studentPoints.eventId = existingEventIds.join(',');

      if (eventType === 'co-curricular') {
        studentPoints.totalCocurricular += points;
      } else if (eventType === 'extra-curricular') {
        studentPoints.totalExtracurricular += points;
      }

      studentPoints.participationTypeId = participationTypeId;

      await studentPoints.save();
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
module.exports = {
  createEvent,
  insertFetchedStudents,
  getAllEventnames,
  getAllCoCurricularEventsNames,
  getAllExtraCurricularEventsNames,
  getAllParticipationTypes,
  insertIntoStudentPoints
};
