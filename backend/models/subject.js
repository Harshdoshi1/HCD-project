const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    subjectName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subjectCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    semesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Semesters',
            key: 'id'
        }
    }
}, {
    timestamps: false,
    tableName: 'Subjects'
});

module.exports = Subject; 