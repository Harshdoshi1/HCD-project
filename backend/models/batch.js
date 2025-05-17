const TABLE_NAME = 'batches';

const Batch = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        name: {
            type: 'text',
            required: true
        },
        start_year: {
            type: 'integer',
            required: true
        },
        end_year: {
            type: 'integer',
            required: true
        },
        program: {
            type: 'text',
            required: true,
            enum: ['Degree', 'Diploma']
        },
        current_semester: {
            type: 'integer',
            required: false
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

module.exports = Batch;
