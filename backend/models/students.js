const TABLE_NAME = 'students';

const Student = {
    TableStructure: {
        id: {
            type: 'uuid',
            primaryKey: true,
            defaultValue: 'uuid_generate_v4()'
        },
        user_id: {
            type: 'uuid',
            references: 'users.id',
            required: true
        },
        batch_id: {
            type: 'uuid',
            references: 'batches.id',
            required: true
        },
        enrollment_number: {
            type: 'text',
            required: true,
            unique: true
        },
        hardware_points: {
            type: 'integer',
            default: 0
        },
        software_points: {
            type: 'integer',
            default: 0
        },
        current_semester: {
            type: 'integer',
            required: true,
            min: 1,
            max: 8
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

module.exports = Student;