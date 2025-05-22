require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5001,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Frontend URL
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  // Database configuration
  database: {
    host: (process.env.NODE_ENV === 'production' && process.env.PROD_DB_HOST) ? 
      process.env.PROD_DB_HOST : process.env.DB_HOST || 'localhost',
    user: (process.env.NODE_ENV === 'production' && process.env.PROD_DB_USER) ? 
      process.env.PROD_DB_USER : process.env.DB_USER || 'root',
    password: (process.env.NODE_ENV === 'production' && process.env.PROD_DB_PASSWORD) ? 
      process.env.PROD_DB_PASSWORD : process.env.DB_PASSWORD || '',
    name: (process.env.NODE_ENV === 'production' && process.env.PROD_DB_NAME) ? 
      process.env.PROD_DB_NAME : process.env.DB_NAME || 'hcd',
  },
  
  // Email configuration
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  }
};

module.exports = config;
