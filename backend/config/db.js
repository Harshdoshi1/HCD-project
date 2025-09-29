
const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();
const { URL } = require('url'); // Import the URL class

let sslOptions = { require: true };

// If running locally with a CA file, validate SSL
if (process.env.DB_SSL_CA && fs.existsSync(process.env.DB_SSL_CA)) {
  sslOptions.ca = fs.readFileSync(process.env.DB_SSL_CA).toString();
  sslOptions.rejectUnauthorized = true; // validate certificate locally
} else {
  // On Render / cloud: allow self-signed certificate
  sslOptions.rejectUnauthorized = false;
}

// Clean the DATABASE_URL to remove the invalid 'ssl-mode' parameter
let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    if (url.searchParams.has('ssl-mode')) {
      url.searchParams.delete('ssl-mode');
      dbUrl = url.toString();
    }
  } catch (error) {
    console.error('Could not parse DATABASE_URL:', error);
  }
}

const sequelize = new Sequelize(dbUrl, { // Use the cleaned URL
  dialect: 'mysql',
  logging: false,

  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },

  dialectOptions: {
    connectTimeout: 60000,
    ssl: sslOptions,
  },
});

const connectDB = async (retries = 5, delay = 5000) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log(`✅ Connected to MySQL`);
      return;
    } catch (err) {
      console.error(`❌ MySQL connection failed (retries left: ${retries - 1})`);
      console.error('Message:', err.message);

      retries -= 1;
      if (!retries) {
        console.error('🚨 Could not connect to database. Exiting...');
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

connectDB();

module.exports = sequelize;
