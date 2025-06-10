const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    className: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numberOfStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: 'Classes'
});

module.exports = Class; 