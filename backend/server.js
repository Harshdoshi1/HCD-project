require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDB } = require('./models');

const userRoutes = require('./routes/auth_routes');
const facultyRoutes = require('./routes/faculty_routes');
const componentRoutes = require('./routes/component_routes');
const studentRoutes = require('./routes/student_routes');
const subRoutes = require('./routes/sub_routes');

const gettedmarksController = require("./controller/gettedmarksController");

const app = express();

// ✅ Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Updated to match Vite's default port
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

app.get("/api/marks/students/:batchId", gettedmarksController.getStudentMarksByBatchAndSubject);
app.post("/api/marks/update/:studentId/:subjectId", gettedmarksController.updateStudentMarks);

// ✅ Start Server without DB sync for testing
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
