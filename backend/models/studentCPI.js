const { supabase } = require('../config/db');

const TABLE_NAME = 'student_cpi';

const StudentCPI = {
    // Table name constant
    tableName: TABLE_NAME,

    // Database operations
    async create(data) {
        const { data: result, error } = await supabase
            .from(TABLE_NAME)
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return result;
    },

    async findAll(options = {}) {
        let query = supabase.from(TABLE_NAME).select(`
            *,
            batch:batches(*),
            semester:semesters(*)
        `);

        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async findOne(options = {}) {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                batch:batches(*),
                semester:semesters(*)
            `)
            .match(options.where || {})
            .single();

        if (error) throw error;
        return data;
    },

    async update(where, updates) {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updates)
            .match(where)
            .select();

        if (error) throw error;
        return data;
    },

    async delete(where) {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .match(where);

        if (error) throw error;
        return true;
    }
};

module.exports = StudentCPI;