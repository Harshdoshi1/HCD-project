const sequelize = require('./db');
const defineAssociations = require('../models/associations');
const Semester = require('../models/semester');
const Subject = require('../models/subject');
const Class = require('../models/class');
const Batch = require('../models/batch');

const initializeDatabase = async () => {
    try {
        // First, force sync to reset all tables
        await sequelize.sync({ force: true });
        console.log('Database tables reset successfully');

        // Define associations after tables are created
        defineAssociations();
        console.log('Associations defined successfully');

        // Sync again to apply associations
        await sequelize.sync({ alter: true });
        console.log('Database synchronized with associations');
    } catch (error) {
        console.error('Error synchronizing database:', error);
        throw error;
    }
};

module.exports = initializeDatabase; 