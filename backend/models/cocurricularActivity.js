


const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Student = require("./students");
const Semester = require("./semester");

const CoCurricularActivity = sequelize.define(
    "CoCurricularActivity",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        enrollmentNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        semesterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Semester,
                key: "id",
            },
        },
        activityName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        achievementLevel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        certificateUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "co_curricular_activities",
        timestamps: true,
    }
);

CoCurricularActivity.belongsTo(Student, {
    foreignKey: "enrollmentNumber",
    targetKey: "enrollmentNumber",
    constraints: false,
});
CoCurricularActivity.belongsTo(Semester, { foreignKey: "semesterId" });

module.exports = CoCurricularActivity;
