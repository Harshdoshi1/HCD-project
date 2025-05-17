const TABLE_NAME = 'subject_wise_grades';

const SubjectWiseGrades = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        student_id: {
            type: 'uuid',
            references: 'students.id',
            required: true
        },
        subject_id: {
            type: 'text',
            references: 'unique_sub_degree.sub_code',
            required: true
        },
        semester: {
            type: 'integer',
            required: true
        },
        grade: {
            type: 'text',
            required: true,
            enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F']
        },
        points: {
            type: 'numeric',
            required: true
        },
        created_at: {
            type: 'timestamp',
            defaultValue: 'now()'
        },
        updated_at: {
            type: 'timestamp',
            defaultValue: 'now()'
        }
    }
};

module.exports = SubjectWiseGrades;
