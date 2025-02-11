const sequelize = require('../config/db');
const User = require('./users');
const Batch = require('./batch');
const Semester = require('./semester');
const Faculty = require('./faculty');

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('All tables synchronized.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = { User, Batch, Semester, Faculty, syncDB };
