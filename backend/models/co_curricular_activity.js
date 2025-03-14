const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const students = require("./students");  // Correct reference
const batches = require("./batch");      // Correct reference
const semesters = require("./semester"); // Correct reference

const CoCurricularActivity = sequelize.define(
    "CoCurricularActivity",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: students,  // Correct reference
                key: "id",
            },
        },
        batchId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: batches,  // Correct reference
                key: "id",
            },
        },
        semesterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: semesters,  // Correct reference
                key: "id",
            },
        },
        activityName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        achievementLevel: {
            type: DataTypes.STRING, // e.g., Participation, Winner, Runner-up
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    { timestamps: false }
);

// Associations
CoCurricularActivity.belongsTo(students, { foreignKey: "studentId" });
CoCurricularActivity.belongsTo(batches, { foreignKey: "batchId" });
CoCurricularActivity.belongsTo(semesters, { foreignKey: "semesterId" });

module.exports = CoCurricularActivity;
