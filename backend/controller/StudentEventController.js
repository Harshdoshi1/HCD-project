const EventMaster = require('../models/EventMaster');
const StudentPoints = require('../models/StudentPoints')
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs').promises;

// Create new event
const createEvent = async (req, res) => {
  try {
    const { eventId, eventName, eventType, eventCategory, points, duration } = req.body;

    const event = await EventMaster.create({
      eventId,
      eventName,
      eventType,
      eventCategory,
      points: parseInt(points),
      duration: duration ? parseInt(duration) : null
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

// Process Excel file and update student points
const processExcel = async (req, res) => {
  try {
    const { eventId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Read Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Get event details
    const event = await EventMaster.findOne({ where: { eventId } });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Process each student in the Excel file
    const processedStudents = [];
    for (const row of data) {
      const { enrollmentNumber, semester } = row;

      // Update or create student points
      const studentPoints = await StudentPoints.findOrCreate({
        where: { enrollmentNumber, semester },
        defaults: {
          enrollmentNumber,
          semester,
          eventId,
          totalCocurricular: 0,
          totalExtracurricular: 0,
          date: new Date()
        }
      });

      // Update points based on event type
      if (event.eventType === 'co-curricular') {
        studentPoints[0].totalCocurricular += event.points;
      } else {
        studentPoints[0].totalExtracurricular += event.points;
      }

      await studentPoints[0].save();
      processedStudents.push({
        enrollmentNumber,
        semester,
        points: event.points,
        eventType: event.eventType
      });
    }

    // Clean up the uploaded file
    await fs.unlink(file.path);

    res.status(200).json({
      success: true,
      message: 'Excel processed successfully',
      data: {
        event,
        processedStudents
      }
    });
  } catch (error) {
    console.error('Error processing Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Excel',
      error: error.message
    });
  }
};

module.exports = {
  createEvent,
  processExcel
}