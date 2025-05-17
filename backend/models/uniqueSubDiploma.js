const TABLE_NAME = 'unique_sub_diploma';

const UniqueSubDiploma = {
    TableStructure: {
        sub_code: {
            type: 'text',
            primaryKey: true
        },
        sub_level: {
            type: 'text',
            required: true
        },
        sub_name: {
            type: 'text',
            required: true
        },
        sub_credit: {
            type: 'integer',
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

module.exports = UniqueSubDiploma;
