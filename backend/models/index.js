const { supabase, testConnection } = require('../config/db');

// Table names in your Supabase database
const TABLES = {
    USERS: 'users',
    BATCH: 'batch',
    SEMESTER: 'semester',
    FACULTY: 'faculty',
    SUBJECT: 'subjects',
    UNIQUE_SUB_DEGREE: 'unique_sub_degree',
    UNIQUE_SUB_DIPLOMA: 'unique_sub_diploma',
    ASSIGN_SUBJECT: 'assign_subject',
    COMPONENT_WEIGHTAGE: 'component_weightage',
    COMPONENT_MARKS: 'component_marks',
    STUDENT: 'students',
    GETTED_MARKS: 'getted_marks',
    SUBJECT_WISE_GRADES: 'subject_wise_grades',
    PARTICIPATION_TYPE: 'participation_types',
    EVENT_MASTER: 'event_master'
};

// Database operations for each table
const db = {
    users: {
        getAll: async () => {
            const { data, error } = await supabase.from(TABLES.USERS).select('*');
            if (error) throw error;
            return data;
        },
        getById: async (id) => {
            const { data, error } = await supabase.from(TABLES.USERS).select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        }
        // Add more operations as needed
    },
    // Add similar operations for other tables as needed
};

// Health check function
const checkDBConnection = async () => {
    try {
        const { data, error } = await supabase.from(TABLES.USERS).select('count').single();
        if (error) throw error;
        console.log('Supabase connection verified successfully');
        return true;
    } catch (error) {
        console.error('Supabase connection check failed:', error.message);
        return false;
    }
};

module.exports = {
    db,
    TABLES,
    checkDBConnection: testConnection,  // Use the testConnection function from db.js
    supabase
};
