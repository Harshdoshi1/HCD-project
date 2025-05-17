const TABLE_NAME = 'subjects';

const Subject = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        subject_name: {
            type: 'text',
            required: true
        },
        semester_id: {
            type: 'uuid',
            references: 'semesters.id',
            required: true
        },
        batch_id: {
            type: 'uuid',
            references: 'batches.id',
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

module.exports = Subject;
