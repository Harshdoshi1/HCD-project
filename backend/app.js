const express = require('express');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/auth_routes');
const batchRoutes = require('./routes/batch_routes');
const semesterRoutes = require('./routes/semester_routes');
const subjectRoutes = require('./routes/sub_routes');
const classRoutes = require('./routes/classRoutes');
const subjectComponentCoRoutes = require('./routes/subjectComponentCoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subject-component-cos', subjectComponentCoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 