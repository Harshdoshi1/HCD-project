const TABLE_NAME = 'assign_subjects';

const AssignSubject = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        batch_id: {
            type: 'uuid',
            references: 'batches.id',
            required: true
        },
        semester_id: {
            type: 'uuid',
            references: 'semesters.id',
            required: true
        },
        faculty_id: {
            type: 'uuid',
            references: 'faculty.id',
            required: true
        },
        subject_id: {
            type: 'text',
            references: 'unique_sub_degree.sub_code',
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

module.exports = AssignSubject;
