const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Batch = sequelize.define('Batch', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    batchName: { type: DataTypes.STRING, unique: true, allowNull: false }
}, { timestamps: false });

module.exports = Batch;
