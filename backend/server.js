require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDB } = require('./models');

const userRoutes = require('./routes/auth_routes');
const facultyRoutes = require('./routes/faculty_routes');
const componentRoutes = require('./routes/component_routes');
const studentRoutes = require('./routes/student_routes');
const subRoutes = require('./routes/sub_routes');
// const batchRoutes = require('./routes/batchRoutes');
// const semesterRoutes = require('./routes/semesterRoutes');
// const facultyRoutes = require('./routes/facultyRoutes');

const app = express();

// ✅ Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Adjust based on frontend URL
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/students', studentRoutes)
app.use('/api/subjects', subRoutes);
// app.use('/api/semesters', semesterRoutes);
// app.use('/api/faculties', facultyRoutes);

// ✅ Sync Database and Start Server
const PORT = process.env.PORT || 5001;
syncDB().then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}).catch(err => {
    console.error("❌ Database sync error:", err);
});
