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

    const processedStudents = [];
    const errors = [];

    for (const participant of participants) {
      try {
        const { enrollmentNumber, participationType } = participant;
        console.log('Processing enrollment:', enrollmentNumber, 'Type:', participationType);

        // Find the student's batch using their enrollment number
        const student = await Student.findOne({
          where: { enrollmentNumber }
        });

        if (!student) {
          console.warn(`Student with enrollment number ${enrollmentNumber} not found.`);
          errors.push({ enrollmentNumber, error: 'Student not found' });
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
          errors.push({ enrollmentNumber, error: 'Batch not found' });
          continue;
        }

        const currentSemester = batch.currentSemester;
        console.log('Current semester:', currentSemester);

        let studentPoints = await StudentPoints.findOne({
          where: { enrollmentNumber, semester: currentSemester }
        });

        if (!studentPoints) {
          studentPoints = await StudentPoints.create({
            enrollmentNumber,
            semester: currentSemester,
            eventId: eventId.toString(),
            totalCocurricular: eventType === 'co-curricular' ? points : 0,
            totalExtracurricular: eventType === 'extra-curricular' ? points : 0,
            participationTypeId: participationType
          });
          console.log('Created new student points record');
        } else {
          const existingEventIds = studentPoints.eventId ? studentPoints.eventId.split(',') : [];
          if (!existingEventIds.includes(eventId.toString())) {
            existingEventIds.push(eventId.toString());
          }

          studentPoints.eventId = existingEventIds.join(',');
          studentPoints.participationTypeId = participationType;

          if (eventType === 'co-curricular') {
            studentPoints.totalCocurricular += points;
          } else if (eventType === 'extra-curricular') {
            studentPoints.totalExtracurricular += points;
          }

          await studentPoints.save();
          console.log('Updated existing student points record');
        }

        processedStudents.push({
          enrollmentNumber,
          currentSemester,
          participationType,
          points: {
            cocurricular: studentPoints.totalCocurricular,
            extracurricular: studentPoints.totalExtracurricular
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
    const participationTypes = await ParticipationType.findAll({});
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

const fetchEventsbyEnrollandSemester = async (req, res) => {
  try {
    const { enrollmentNumber, semester } = req.body;

    if (!enrollmentNumber || !semester) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["enrollmentNumber", "semester"]
      });
    }

    const activities = await StudentPoints.findAll({
      where: { enrollmentNumber, semester },
      attributes: ['eventId', 'totalCocurricular', 'totalExtracurricular']
    });

    if (activities.length === 0) {
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

    const activities = await StudentPoints.findAll({
      where: { enrollmentNumber },
      attributes: ['eventId']
    });

    if (activities.length === 0) {
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

    const events = await EventMaster.findAll({
      where: {
        eventId: eventIdArray
      }
    });

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

    const events = await EventMaster.findAll({
      where: {
        eventId: eventIdArray,
        eventType: eventType
      }
    });

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
