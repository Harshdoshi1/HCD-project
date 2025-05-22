require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { syncDB } = require('./models');
const setupCors = require('./middleware/cors');

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
const gradesRoutes = require('./routes/grades_routes');
const academicDetailsRoutes = require('./routes/academic_details_routes');
const app = express();
const emailRoutes = require('./routes/email_routes');
// Setup CORS with our custom middleware
setupCors(app);

// Log request information in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/email', emailRoutes);

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
app.use('/api/grades', gradesRoutes);
app.use('/api/academic-details', academicDetailsRoutes);
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
});

// Catch-all route
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Get configuration
const config = require('./config/config');

// Start Server
const PORT = config.server.port;

// Prepare a message about the server environment
const envMessage = config.server.env === 'production'
    ? `Server running in PRODUCTION mode on port ${PORT}`
    : `Server running in DEVELOPMENT mode on port ${PORT}`;

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: config.server.env,
        timestamp: new Date().toISOString()
    });
});

// Special route to help debug database connection issues
app.get('/api/db-status', (req, res) => {
    res.json({
        status: 'Server is running',
        databaseConfig: {
            host: config.database.host,
            database: config.database.name,
            user: config.database.user,
            // Don't include password for security reasons
        },
        frontendUrl: config.frontend.url,
        environment: config.server.env,
        timestamp: new Date().toISOString()
    });
});

// Start the server and handle database connectivity
const startServer = async () => {
    let dbConnected = false;
    
    try {
        // Try to sync database
        dbConnected = await syncDB();
    } catch (error) {
        console.error('Database synchronization error:', error);
        console.log('\n\n==== DATABASE CONNECTION TROUBLESHOOTING ====');
        console.log('1. Make sure your MySQL server is running');
        console.log('   - On macOS: Open System Preferences > MySQL and start the server');
        console.log('   - Or use: mysql.server start');
        console.log('2. Verify your database credentials in .env file');
        console.log('3. Make sure the database exists: CREATE DATABASE hcd;');
        console.log('\nContinuing in API-only mode (database features will not work)\n');
    }
    
    // Start server regardless of database connection status
    app.listen(PORT, () => {
        console.log(envMessage);
        console.log(`Frontend URL: ${config.frontend.url}`);
        console.log(`Backend running at: http://localhost:${PORT}`);
        
        if (!dbConnected) {
            console.log('WARNING: Running in API-only mode. Database is not connected.');
            console.log('Some API endpoints requiring database access will not function.');
            console.log('For a local setup, ensure your MySQL server is running and database exists.');
        } else {
            console.log('Database is connected and synchronized.');
        }
    });
};

startServer().catch(error => {
    console.error('Critical server error:', error);
    process.exit(1);
});