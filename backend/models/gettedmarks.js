
const TABLE_NAME = 'getted_marks';

const GettedMarks = {
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
        faculty_id: {
            type: 'uuid',
            references: 'users.id',
            required: true
        },
        subject_id: {
            type: 'text',
            references: 'unique_sub_degree.sub_code',
            required: true
        },
        ese: {
            type: 'integer',
            default: 0
        },
        cse: {
            type: 'integer',
            default: 0
        },
        ia: {
            type: 'integer',
            default: 0
        },
        tw: {
            type: 'integer',
            default: 0
        },
        viva: {
            type: 'integer',
            default: 0
        },
        faculty_response: {
            type: 'text',
            required: false
        },
        faculty_rating: {
            type: 'integer',
            min: 0,
            max: 10,
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

module.exports = GettedMarks;
