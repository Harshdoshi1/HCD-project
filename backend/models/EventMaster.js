const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const EventMaster = sequelize.define('EventMaster', {
    eventId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    eventName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventType: {
        type: DataTypes.ENUM('co-curricular', 'extra-curricular'),
        allowNull: false,
    },
    eventCategory: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // Optional field
        allowNull: true,
    },
}, {
    tableName: 'EventMaster',
    timestamps: false,
});

module.exports = EventMaster;