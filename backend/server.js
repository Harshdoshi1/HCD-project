require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDB } = require('./models');

const userRoutes = require('./routes/auth_routes');
const facultyRoutes = require('./routes/faculty_routes');
const componentRoutes = require('./routes/component_routes');
const studentRoutes = require('./routes/student_routes');
const subRoutes = require('./routes/sub_routes');
const studentCoCurricularRoutes = require('./routes/student_cocurricular_routes');
const studentExtracurricularRoutes = require('./routes/student_extracurricular_routes');

const gettedmarksController = require("./controller/gettedmarksController");

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/students/extracurricular', studentExtracurricularRoutes);
app.use('/api/students/cocurricular', studentCoCurricularRoutes);
app.use('/api/subjects', subRoutes);

// Marks routes
app.get("/api/marks/students/:batchId", gettedmarksController.getStudentMarksByBatchAndSubject);
app.post("/api/marks/update/:studentId/:subjectId", gettedmarksController.updateStudentMarks);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Catch-all route
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
