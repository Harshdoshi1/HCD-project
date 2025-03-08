const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Batch = sequelize.define('Batch', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    batchName: { type: DataTypes.STRING, unique: true, allowNull: false },
    batchStart: { type: DataTypes.DATE, allowNull: false },
    batchEnd: { type: DataTypes.DATE, allowNull: false },
    courseType: {
        type: DataTypes.ENUM('Degree', 'Diploma'),
        allowNull: false
    }
}, { 
    tableName: 'Batches',
    timestamps: false 
});

module.exports = Batch;
