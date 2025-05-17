const { supabase } = require('../config/db');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate role
        const validRoles = {
            'HOD': 'HOD',
            'hod': 'HOD',
            'FACULTY': 'faculty',
            'faculty': 'faculty',
            'STUDENT': 'student',
            'student': 'student'
        };
        
        if (!validRoles[role]) {
            return res.status(400).json({
                message: 'Invalid role',
                error: `Role must be one of: HOD, faculty, student`
            });
        }
        
        const normalizedRole = validRoles[role];

        // Check if user already exists in database
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Try to sign in first to check if user exists in auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        let authUser;

        if (signInError) {
            if (signInError.message === 'Invalid login credentials') {
                // User doesn't exist or wrong password, try to create new user
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            role: validRoles[role]
                        }
                    }
                });

                if (authError) {
                    if (authError.message === 'User already registered') {
                        // User exists but password was wrong, return error
                        return res.status(400).json({
                            message: 'Registration failed',
                            error: 'Email already registered. Please use a different email.'
                        });
                    }
                    console.error('Auth error:', authError);
                    return res.status(400).json({
                        message: 'Registration failed',
                        error: authError.message
                    });
                }

                if (!authData?.user) {
                    return res.status(400).json({
                        message: 'Registration failed',
                        error: 'User creation failed'
                    });
                }

                authUser = authData.user;
            } else {
                // Unexpected error
                console.error('Sign in error:', signInError);
                return res.status(500).json({
                    message: 'Registration failed',
                    error: signInError.message
                });
            }
        } else {
            // User exists and password is correct
            authUser = signInData.user;
        }

        // Create user record in users table
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .insert({
                auth_id: authUser.id,
                name,
                email,
                role: validRoles[role]
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // If database insert fails, we should clean up the auth user
            await supabase.auth.admin.deleteUser(authUser.id);
            return res.status(500).json({
                message: 'Registration failed',
                error: dbError.message
            });
        }

        // Note: We'll handle email confirmation through Supabase's email confirmation flow

        res.status(201).json({
            message: 'User registered successfully',
            user: userData
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                error: 'Missing required fields'
            });
        }

        // First try to sign in
        let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        // If there's an error about email not being confirmed
        if (authError && authError.message === 'Email not confirmed') {
            // Get the user from our database
            const { data: dbUser } = await supabase
                .from('users')
                .select('auth_id')
                .eq('email', email)
                .single();

            if (dbUser) {
                // Force confirm the email using admin API
                await supabase.rpc('confirm_user', { user_id: dbUser.auth_id });

                // Try signing in again
                const result = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                authData = result.data;
                authError = result.error;
            }
        }

        if (authError) {
            return res.status(401).json({
                message: 'Invalid email or password',
                error: authError.message
            });
        }

        // Get user data from users table
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authData.user.id)
            .single();

        if (dbError) throw dbError;

        res.status(200).json({
            message: 'Login successful',
            session: authData.session,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,    

};
