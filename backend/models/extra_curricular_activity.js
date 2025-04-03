const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Student = require("./students");
const Batch = require("./batch");
const Semester = require("./semester");

const ExtraCurricularActivity = sequelize.define(
    "ExtraCurricularActivity",
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
                model: Student,
                key: "id",
            },
        },
        batchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Batch,
                key: "id",
            },
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
        certificateUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "extra_curricular_activities",
        timestamps: true,
    }
);

// Associations
ExtraCurricularActivity.belongsTo(Student, { foreignKey: "studentId" });
ExtraCurricularActivity.belongsTo(Batch, { foreignKey: "batchId" });
ExtraCurricularActivity.belongsTo(Semester, { foreignKey: "semesterId" });

module.exports = ExtraCurricularActivity;
