const TABLE_NAME = 'event_master';

const EventMaster = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        event_name: {
            type: 'text',
            required: true
        },
        event_date: {
            type: 'timestamp',
            required: true
        },
        event_type: {
            type: 'text',
            required: true,
            enum: ['co-curricular', 'extra-curricular']
        },
        event_category: {
            type: 'text',
            required: false
        },
        points: {
            type: 'integer',
            required: true
        },
        duration: {
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

module.exports = EventMaster;