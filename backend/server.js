require('dotenv').config();
const express = require('express');
const { syncDB } = require('./models');
// const userRoutes = require('./routes/userRoutes');
// const batchRoutes = require('./routes/batchRoutes');
// const semesterRoutes = require('./routes/semesterRoutes');
// const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes = require('./routes/auth_routes');
const app = express();

// Middleware.js
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/batches', userRoutes);
app.use('/api/semesters', userRoutes);
app.use('/api/faculties', userRoutes);

// Sync Database and Start Server
const PORT = process.env.PORT || 5000;
syncDB().then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
