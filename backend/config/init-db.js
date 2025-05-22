/**
 * Database initialization script
 * 
 * This script connects to MySQL without specifying a database,
 * then creates the required database if it doesn't exist.
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Get database configuration from config
const dbUser = config.database.user;
const dbPassword = config.database.password;
const dbHost = config.database.host;
const dbPort = config.database.port || 3306;
const dbName = config.database.name;
const useSSL = config.database.ssl !== false;

// Path to the CA certificate
const caCertPath = path.join(__dirname, '..', 'certs', 'ca.pem');
const hasCACert = fs.existsSync(caCertPath);

// MySQL connection options - without specifying a database
const connectionOptions = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    // SSL settings
    ssl: useSSL ? {
        rejectUnauthorized: false, // Allow self-signed certificates
        ca: hasCACert ? fs.readFileSync(caCertPath) : undefined
    } : undefined
};

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('Initializing database connection...');
        console.log(`Connecting to MySQL at ${dbHost}:${dbPort} as ${dbUser}`);
        
        // Create a connection without specifying a database
        connection = await mysql.createConnection(connectionOptions);
        
        // Check if the database exists, if not, create it
        console.log(`Checking if database '${dbName}' exists...`);
        const [rows] = await connection.execute(`SHOW DATABASES LIKE '${dbName}'`);
        
        if (rows.length === 0) {
            console.log(`Database '${dbName}' does not exist. Creating it...`);
            await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
        
        // Close the connection
        await connection.end();
        console.log('Database initialization completed successfully.');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
        return false;
    }
}

module.exports = initializeDatabase;
