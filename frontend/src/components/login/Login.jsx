import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

// Fix for Chrome extension error: Cannot read properties of undefined (reading 'lsB_matchId')
// This adds a dummy property to prevent the error
if (typeof window !== 'undefined') {
  // Create a deep object structure to prevent errors
  window.lsB_matchId = window.lsB_matchId || {};
  window.lsB = window.lsB || {};
  window.lsB.matchId = window.lsB.matchId || {};
}

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [pageLoaded, setPageLoaded] = useState(false);

    useEffect(() => {
        try {
            // Check if user is already logged in
            const token = localStorage.getItem('token');
            let user = null;
            
            // Safely parse user JSON
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    user = JSON.parse(userStr);
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
                // Clear corrupted data
                localStorage.removeItem('user');
            }

            if (token && user) {
                // Redirect based on role
                const role = user.role?.toUpperCase();
                if (role === 'HOD') {
                    navigate('/dashboardHOD');
                } else if (role === 'FACULTY') {
                    navigate('/dashboardFaculty');
                }
            }
        } catch (e) {
            console.error('Error in login check:', e);
        } finally {
            // Mark page as loaded regardless of outcome
            setPageLoaded(true);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                data = await response.json();
                console.log("Login response data:", data);
            } catch (jsonError) {
                console.error("Error parsing JSON response:", jsonError);
                throw new Error('Server response error. Please try again.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            if (!data.session?.access_token || !data.user) {
                throw new Error('Invalid server response. Missing authentication data.');
            }

            try {
                // Explicitly remove old local storage items before storing new ones
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('email');

                // Store new values
                localStorage.setItem('token', data.session.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('email', data.user.email);
            } catch (storageError) {
                console.error("Error storing auth data:", storageError);
                throw new Error('Could not store login information. Please try again.');
            }

            // Redirect based on role
            const role = data.user.role.toUpperCase();
            if (role === 'HOD') {
                navigate('/dashboardHOD');
            } else if (role === 'FACULTY') {
                navigate('/dashboardFaculty');
            } else {
                throw new Error('Invalid user role');
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    // Show loading state until page is fully loaded
    if (!pageLoaded) {
        return (
            <div className="login-container">
                <div className="login-box fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PulseLoader color="#4361ee" size={15} />
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="background-effect"></div>

            <div className="login-box fade-in">
                <div className="logo-container">
                    <img
                        src="https://images.unsplash.com/photo-1562774053-701939374585?w=150&h=150&fit=crop"
                        alt="Department Logo"
                        className="department-logo"
                    />
                </div>

                <h1>Faculty Portal Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={error ? 'error' : ''}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={error ? 'error' : ''}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="options-row">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <PulseLoader color="#ffffff" size={8} />
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;