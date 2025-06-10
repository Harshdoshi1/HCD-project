const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Batch = require('./batch');
const Subject = require('./subject');
const Class = require('./class');

const Semester = sequelize.define('Semester', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    batchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Batches',
            key: 'id'
        }
    },
    semesterNumber: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 8 }
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'Semesters'
});

// Define associations
Semester.belongsTo(Batch, {
    foreignKey: 'batchId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Semester.hasMany(Subject, {
    foreignKey: 'semesterId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Semester.hasMany(Class, {
    foreignKey: 'semesterId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = Semester;
