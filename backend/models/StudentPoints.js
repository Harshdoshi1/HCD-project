const TABLE_NAME = 'student_points';

const StudentPoints = {
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
        event_id: {
            type: 'uuid',
            references: 'event_master.id',
            required: true
        },
        points_earned: {
            type: 'integer',
            required: true,
            default: 0
        },
        date_earned: {
            type: 'timestamp',
            required: true,
            defaultValue: 'now()'
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

module.exports = StudentPoints;
