const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentBloomsDistribution = sequelize.define('StudentBloomsDistribution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subjectId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    semesterNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bloomsTaxonomyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    distributedMarks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    totalPossibleMarks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    calculatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'student_blooms_distribution',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'idx_student_subject_sem_blooms',
            fields: ['studentId', 'subjectId', 'semesterNumber', 'bloomsTaxonomyId']
        },
        {
            name: 'idx_student_semester',
            fields: ['studentId', 'semesterNumber']
        },
        {
            name: 'idx_subject_semester',
            fields: ['subjectId', 'semesterNumber']
        }
    ]
});

module.exports = StudentBloomsDistribution;
