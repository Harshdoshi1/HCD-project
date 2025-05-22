const { Sequelize } = require('sequelize');
const config = require('./config');

// Use database configuration from config file
const dbName = config.database.name;
const dbUser = config.database.user;
const dbPassword = config.database.password;
const dbHost = config.database.host;
const isProduction = config.server.env === 'production';

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        host: dbHost,
        dialect: 'mysql',
        logging: false,
        // Add additional production configuration if needed
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // For production SSL connection if required by your host
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false // Allows connections to servers with self-signed certificates
            }
        } : {}
    }
);

sequelize.authenticate()
    .then(() => console.log('MySQL Connected via Sequelize'))
    .catch(err => console.error('MySQL Connection Failed:', err));

module.exports = sequelize;
