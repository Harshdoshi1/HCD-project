const {
  User,
  Faculty,
  Batch,
  Semester,
  Subject,
  UniqueSubDegree,
  UniqueSubDiploma,
  ComponentWeightage,
  ComponentMarks,
  Event,
  StudentEvent,
  ParticipationType,
} = require("../models");

// Create new event
const createEvent = async (req, res) => {
  try {
    const {
      eventId,
      eventName,
      eventType,
      eventCategory,
      points,
      duration,
      eventDate,
    } = req.body;
    console.log(
      "Testing ",
      eventId,
      eventName,
      eventType,
      eventCategory,
      points,
      duration,
      eventDate
    );

    const { data: event, error } = await Event.create({
      eventId,
      eventName,
      eventType,
      eventCategory,
      points: parseInt(points),
      duration: duration ? parseInt(duration) : null,
      date: eventDate,
    });
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

const getAllEventnames = async (req, res) => {
  try {
    const { data: events, error } = await Event.findAll();
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching event names:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event names",
      error: error.message,
    });
  }
};

const insertFetchedStudents = async (req, res) => {
  try {
    const { eventName, participants } = req.body;
    console.log("Request body:", req.body);

    // Input validation
    if (!eventName || typeof eventName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Event name is required and must be a string",
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participants data must be a non-empty array",
      });
    }

    console.log("Processing event:", eventName);
    console.log("Number of participants:", participants.length);
    console.log("Sample participants:", participants.slice(0, 3));

    // Fetch event details
    const { data: event, error: eventError } = await Event.findOne({
      eventName: eventName.trim(),
    });
    if (eventError) throw eventError;

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event with name '${eventName}' not found`,
      });
    }

    console.log("Found event:", event.eventName, "ID:", event.eventId);

    const { eventId, eventType, points } = event;

    const processedStudents = [];
    const errors = [];

    for (const participant of participants) {
      try {
        const { enrollmentNumber, participationType } = participant;
        console.log(
          "Processing enrollment:",
          enrollmentNumber,
          "Type:",
          participationType
        );

        // Find the student
        const { data: student, error: studentError } = await User.findOne({
          enrollmentNumber,
          role: "student",
        });
        if (studentError) throw studentError;

        if (!student) {
          console.warn(
            `Student with enrollment number ${enrollmentNumber} not found.`
          );
          errors.push({ enrollmentNumber, error: "Student not found" });
          continue;
        }

        const batchId = student.batchId;
        console.log("Found student with batchId:", batchId);

        // Find the batch
        const { data: batch, error: batchError } = await Batch.findOne({
          id: batchId,
        });
        if (batchError) throw batchError;

        if (!batch) {
          console.warn(`Batch with ID ${batchId} not found.`);
          errors.push({ enrollmentNumber, error: "Batch not found" });
          continue;
        }

        const currentSemester = batch.currentSemester;
        console.log("Current semester:", currentSemester);

        // Find or create student event record
        const { data: studentEvent, error: studentEventError } =
          await StudentEvent.upsert({
            enrollmentNumber,
            semester: currentSemester,
            eventId,
            participationTypeId: participationType,
            points: points,
            eventType,
          });
        if (studentEventError) throw studentEventError;

        processedStudents.push({
          enrollmentNumber,
          currentSemester,
          participationType,
          points: studentEvent.points,
        });
      } catch (error) {
        console.error(
          `Error processing enrollment ${participant.enrollmentNumber}:`,
          error
        );
        errors.push({
          enrollmentNumber: participant.enrollmentNumber,
          error: error.message,
        });
      }
    }

    // Send the final response
    res.status(200).json({
      success: true,
      message: "Students processed",
      data: {
        processed: processedStudents,
        errors: errors,
        summary: {
          total: participants.length,
          successful: processedStudents.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    console.error("Error processing students:", error);
    res.status(500).json({
      success: false,
      message: "Error processing students",
      error: error.message,
    });
  }
};

const getAllCoCurricularEventsNames = async (req, res) => {
  try {
    const { data: events, error } = await Event.findAll({
      eventType: "co-curricular",
    });
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Co-curricular events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching co-curricular events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching co-curricular events",
      error: error.message,
    });
  }
};

const getAllExtraCurricularEventsNames = async (req, res) => {
  try {
    const { data: events, error } = await Event.findAll({
      eventType: "extra-curricular",
    });
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Extra-curricular events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching extra-curricular events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching extra-curricular events",
      error: error.message,
    });
  }
};

const getAllParticipationTypes = async (req, res) => {
  try {
    const { data: types, error } = await ParticipationType.findAll();
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Participation types fetched successfully",
      data: types,
    });
  } catch (error) {
    console.error("Error fetching participation types:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching participation types",
      error: error.message,
    });
  }
};

const fetchEventsbyEnrollandSemester = async (req, res) => {
  try {
    const { enrollmentNumber, semester } = req.params;

    const { data: events, error } = await StudentEvent.findAll({
      enrollmentNumber,
      semester,
    });
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

const fetchEventsIDsbyEnroll = async (req, res) => {
  try {
    const { enrollmentNumber } = req.params;

    const { data: events, error } = await StudentEvent.findAll({
      enrollmentNumber,
    });
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Event IDs fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching event IDs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event IDs",
      error: error.message,
    });
  }
};

const fetchEventsByIds = async (req, res) => {
  try {
    const { eventIds } = req.body;

    if (!Array.isArray(eventIds)) {
      return res.status(400).json({
        success: false,
        message: "Event IDs must be provided as an array",
      });
    }

    const { data: events, error } = await Event.findAll({
      eventId: eventIds,
    });
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getAllEventnames,
  insertFetchedStudents,
  getAllCoCurricularEventsNames,
  getAllExtraCurricularEventsNames,
  getAllParticipationTypes,
  fetchEventsbyEnrollandSemester,
  fetchEventsIDsbyEnroll,
  fetchEventsByIds,
};
