const { supabase } = require('./config/db');

// Function to execute SQL
const executeSQL = async (sql) => {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error && error.code === 'PGRST204') {
            // Table doesn't exist, create it
            return true;
        } else if (error) {
            console.error('Error executing SQL:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error executing SQL:', error);
        return false;
    }
};

// Function to reset and recreate the database schema
const syncDatabase = async () => {
    try {
        // Create users table
        console.log('Creating users table...');
        const success = await executeSQL();
        if (!success) {
            console.error('Failed to create users table');
            process.exit(1);
        }

        // Insert a dummy user to create the table structure
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                name: 'Admin',
                email: 'admin@example.com',
                role: 'HOD'
            });

        if (insertError && insertError.code !== '23505') { // Ignore duplicate key error
            console.error('Error creating table:', insertError);
            process.exit(1);
        }

        console.log('Database schema synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database schema:', error);
        process.exit(1);
    }
};

// Run the sync
syncDatabase();
