const TABLE_NAME = 'component_weightage';

const ComponentWeightage = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        subject_id: {
            type: 'text',
            references: 'unique_sub_degree.sub_code',
            required: true
        },
        ese: {
            type: 'integer',
            required: true,
            default: 0
        },
        cse: {
            type: 'integer',
            required: true,
            default: 0
        },
        ia: {
            type: 'integer',
            required: true,
            default: 0
        },
        tw: {
            type: 'integer',
            required: true,
            default: 0
        },
        viva: {
            type: 'integer',
            required: true,
            default: 0
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

module.exports = ComponentWeightage;
