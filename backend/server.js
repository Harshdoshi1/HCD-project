require('dotenv').config();
const express = require('express');
const { syncDB } = require('./models');
// const userRoutes = require('./routes/userRoutes');
// const batchRoutes = require('./routes/batchRoutes');
// const semesterRoutes = require('./routes/semesterRoutes');
// const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes = require('./routes/auth_routes');

const cors = require('cors');

const app = express();
//5173
// ✅ Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from frontend
    methods: 'GET,POST,PUT,DELETE',
    credentials: true // Allow cookies and authentication headers
}));

// Middleware.js
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/batches', userRoutes);
app.use('/api/semesters', userRoutes);
app.use('/api/faculties', userRoutes);

// Sync Database and Start Server
const PORT = process.env.PORT || 5001;
syncDB().then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
