const TABLE_NAME = 'users';

const Users = {
    TableStructure: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true
        },
        auth_id: {
            type: 'text',
            unique: true
        },
        name: {
            type: 'text',
            required: true
        },
        email: {
            type: 'text',
            required: true,
            unique: true,
            format: 'email'
        },

        role: {
            type: 'text',
            required: true,
            enum: ['HOD', 'faculty', 'student']
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

module.exports = Users;
