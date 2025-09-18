// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//     process.env.DB_NAME || 'hcd',
//     process.env.DB_USER || 'root',
//     process.env.DB_PASSWORD || '',
//     {
//         host: process.env.DB_HOST || 'localhost',
//         port: process.env.DB_PORT || 3306,
//         dialect: 'mysql',
//         logging: false
//     }
// );

// sequelize.authenticate()
//     .then(() => console.log('MySQL Connected via Sequelize'))
//     .catch(err => console.error('MySQL Connection Failed:', err));


// module.exports = sequelize;


const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
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
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
      },
    },
  }
);

const connectDB = async (retries = 5, delay = 5000) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log(
        `✅ Connected to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}`
      );
      return;
    } catch (err) {
      console.error(
        `❌ MySQL connection failed (retries left: ${retries - 1})`
      );
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
