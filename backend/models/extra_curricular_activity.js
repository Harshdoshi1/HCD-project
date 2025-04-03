const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Student = require("./students");
const Semester = require("./semester");

const ExtraCurricularActivity = sequelize.define(
    "ExtraCurricularActivity",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        enrollmentNumber: {
            type: DataTypes.STRING,
            allowNull: false
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
    },
    {
        tableName: "extra_curricular_activities",
        timestamps: true,
    }
);

// Associations
ExtraCurricularActivity.belongsTo(Student, {
    foreignKey: "enrollmentNumber",
    targetKey: "enrollmentNumber",
    constraints: false // Disable foreign key constraint
});
ExtraCurricularActivity.belongsTo(Semester, { foreignKey: "semesterId" });

module.exports = ExtraCurricularActivity;
