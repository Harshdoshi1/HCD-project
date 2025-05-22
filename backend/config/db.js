const { Sequelize } = require('sequelize');
const config = require('./config');
const fs = require('fs');
const path = require('path');

// Use database configuration from config file
const dbName = config.database.name;
const dbUser = config.database.user;
const dbPassword = config.database.password;
const dbHost = config.database.host;
const dbPort = config.database.port || 3306;
const useSSL = config.database.ssl !== false;

// Path to the CA certificate
const caCertPath = path.join(__dirname, '..', 'certs', 'ca.pem');
const hasCACert = fs.existsSync(caCertPath);

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: config.server.env !== 'production',
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // Aiven MySQL requires SSL
        dialectOptions: useSSL ? {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Allow self-signed certificates
                ca: hasCACert ? fs.readFileSync(caCertPath) : undefined
            }
        } : {}
    }
);

sequelize.authenticate()
    .then(() => console.log('MySQL Connected via Sequelize'))
    .catch(err => console.error('MySQL Connection Failed:', err));

module.exports = sequelize;
