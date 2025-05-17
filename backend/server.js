<<<<<<< HEAD
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { supabase } = require("./config/supabaseClient");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDB } = require('./models');

const userRoutes = require('./routes/auth_routes');
const facultyRoutes = require('./routes/faculty_routes');
const componentRoutes = require('./routes/component_marks_routes');
const studentRoutes = require('./routes/student_routes');
const subRoutes = require('./routes/sub_routes');
// const studentCoCurricularRoutes = require('./routes/student_cocurricular_routes');
// const studentExtracurricularRoutes = require('./routes/student_extracurricular_routes');
const batchRoutes = require("./routes/batch_routes");
const gettedmarksController = require("./controller/gettedMarksController");
const students_points_routes = require("./routes/students_points_routes");
const semesterRoutes = require("./routes/semester_routes");
const studentEventRoutes = require("./routes/student_event_routes");
const facultysideRoutes = require("./routes/facultyside_router");
const studentCPIRoutes = require('./routes/studentCPI_routes');
const app = express();

// Enable CORS
app.use(cors({
    // origin: 'http://localhost:5173',
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
<<<<<<< HEAD
const userRoutes = require("./routes/auth_routes");
const facultyRoutes = require("./routes/faculty_routes");
const componentRoutes = require("./routes/component_marks_routes");
const studentRoutes = require("./routes/student_routes");
const subjectRoutes = require("./routes/sub_routes");
const batchRoutes = require("./routes/batch_routes");
const gettedmarksController = require("./controller/gettedMarksController");
const semesterRoutes = require("./routes/semester_routes");
const studentEventRoutes = require("./routes/student_event_routes");
const syncRoutes = require("./routes/sync_routes");

app.use("/api/auth", userRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/events", studentEventRoutes);
app.use("/api/sync", syncRoutes);

// Marks routes
app.get(
  "/api/marks/students/:batchId",
  gettedmarksController.getStudentMarksByBatchAndSubject
);
app.get(
  "/api/marks/students/:batchId/:semesterId",
  gettedmarksController.getStudentsByBatchAndSemester
);
app.get(
  "/api/marks/students1/:batchId",
  gettedmarksController.getStudentMarksByBatchAndSubject1
);
app.post(
  "/api/marks/update/:studentId/:subjectId",
  gettedmarksController.updateStudentMarks
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", details: err.message });
=======
app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/Events', students_points_routes);
// app.use('/api/students/extracurricular', studentExtracurricularRoutes);
// app.use('/api/students/cocurricular', studentCoCurricularRoutes);
app.use('/api/subjects', subRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/events', studentEventRoutes);
app.use('/api/facultyside', facultysideRoutes);
app.use('/api/studentCPI', studentCPIRoutes);
// Marks routes
app.get("/api/marks/students/:batchId", gettedmarksController.getStudentMarksByBatchAndSubject);
app.get("/api/marks/students/:batchId/:semesterId", gettedmarksController.getStudentsByBatchAndSemester);

app.get("/api/marks/students1/:batchId", gettedmarksController.getStudentMarksByBatchAndSubject1);
app.post("/api/marks/update/:studentId/:subjectId", gettedmarksController.updateStudentMarks);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
});

// Catch-all route
app.use((req, res) => {
<<<<<<< HEAD
  res.status(404).json({
    message: "Route not found",
  });
=======
    res.status(404).json({
        message: 'Route not found'
    });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
});

// Start Server
const PORT = process.env.PORT || 5001;

<<<<<<< HEAD
const server = app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please try a different port or kill the process using this port.`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
    }
  });
=======
// Synchronize database before starting the server
syncDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
