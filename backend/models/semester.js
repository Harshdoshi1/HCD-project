const TABLE_NAME = 'semesters';

const Semester = {
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
        semester_number: {
            type: 'integer',
            required: true
        },
        start_date: {
            type: 'date',
            required: true
        },
        end_date: {
            type: 'date',
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

module.exports = Semester;
