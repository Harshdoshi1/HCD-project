const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js'); // Adjust the path as per your project structure

const StudentPoints = sequelize.define('StudentPoints', {
    enrollmentNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    eventId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalCocurricular: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalExtracurricular: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'student_points',
    timestamps: false,
});

module.exports = StudentPoints;