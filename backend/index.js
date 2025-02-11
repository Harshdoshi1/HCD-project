<<<<<<< HEAD
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Let's start the project");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
=======
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/auth_routes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
>>>>>>> ccc19ce8b349fcded2340686a68d563fe6b325ba
