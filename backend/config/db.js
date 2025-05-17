const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Test the connection
const testConnection = async () => {
    try {
        // Try to access the users table as a basic connection test
        const { error } = await supabase.from('users').select('count').single();
        if (error && error.code !== 'PGRST116') { // Ignore 'no rows returned' error
            throw error;
        }
        console.log('Supabase Connected Successfully');
        return true;
    } catch (error) {
        console.error('Supabase Connection Failed:', error.message);
        return false;
    }
};

module.exports = { supabase, testConnection };
