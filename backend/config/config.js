require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5001,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Frontend URL
  frontend: {
    url: process.env.FRONTEND_URL || 'https://hcd-frontend.onrender.com',
  },
  
  // Database configuration for Aiven MySQL
  database: {
    // Host should include port if needed (host:port)
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    // Additional Aiven MySQL options
    ssl: process.env.DB_SSL !== 'false', // Enable SSL by default
    port: process.env.DB_PORT || 3306,
  },
  
  // Email configuration
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  }
};

module.exports = config;
