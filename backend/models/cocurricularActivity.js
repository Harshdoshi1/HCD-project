// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// const Student = require("./students");  // Correct reference
// const Batch = require("./batch");      // Correct reference
// const Semester = require("./semester");

// const CoCurricularActivity = sequelize.define(
//     "CoCurricularActivity",
//     {
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//         },
//         studentId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             references: {
//                 model: Student,  // Correct reference
//                 key: "id",
//             },
//         },
//         batchId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             references: {
//                 model: Batch,  // Correct reference
//                 key: "id",
//             },
//         },
//         semesterId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             references: {
//                 model: Semester,  // Correct reference
//                 key: "id",
//             },
//         },
//         activityName: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         achievementLevel: {
//             type: DataTypes.STRING, // e.g., Participation, Winner, Runner-up
//             allowNull: false,
//         },
//         date: {
//             type: DataTypes.DATE,
//             allowNull: false,
//         },
//         description: {
//             type: DataTypes.TEXT,
//             allowNull: true,
//         },
//         score: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             defaultValue: 0,
//         },
//     },
//     { timestamps: false }
// );

// // Associations
// CoCurricularActivity.belongsTo(Student, { foreignKey: "studentId" });
// CoCurricularActivity.belongsTo(Batch, { foreignKey: "batchId" });
// CoCurricularActivity.belongsTo(Semester, { foreignKey: "semesterId" });

// module.exports = CoCurricularActivity;



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
