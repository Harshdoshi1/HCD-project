const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js'); // Adjust the path as per your project structure

const StudentPoints = sequelize.define('StudentPoints', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    enrollmentNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    eventId: {
        type: DataTypes.TEXT,
        allowNull: false,

    },
    totalCocurricular: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalExtracurricular: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }

}, {
    tableName: 'student_points',
    timestamps: false,
});

module.exports = StudentPoints;
