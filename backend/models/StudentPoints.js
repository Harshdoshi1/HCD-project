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
        get() {
            const rawValue = this.getDataValue('eventId');
            return rawValue ? rawValue.split(',').map(Number) : [];
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('eventId', value.join(','));
            } else {
                throw new Error('eventId must be an array of integers');
            }
        }
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
