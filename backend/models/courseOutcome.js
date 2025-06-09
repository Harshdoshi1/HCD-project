const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assuming your db config is here
const UniqueSubDegree = require('./uniqueSubDegree'); // Assuming your subject model is named 'subject.js'

const CourseOutcome = sequelize.define('CourseOutcome', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    subject_id: {
        type: DataTypes.STRING, // Changed from INTEGER to STRING to match sub_code
        allowNull: false,
        references: {
            model: UniqueSubDegree,
            key: 'sub_code'
        }
    },
    co_code: { // e.g., "CO1", "CO2"
        type: DataTypes.STRING(10),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'course_outcomes', // Explicitly set table name
    timestamps: true, // Sequelize handles createdAt and updatedAt
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    indexes: [
        {
            unique: true,
            fields: ['subject_id', 'co_code']
        }
    ]
});

module.exports = CourseOutcome;
