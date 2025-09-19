

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            // If navigated here due to ProtectedRoute, go back to intended page
            const from = location.state && location.state.from ? location.state.from : null;
            if (from) {
                navigate(from, { replace: true });
                return;
            }
            // Otherwise redirect based on role
            if (user.role === 'HOD') {
                navigate('/admin');
            } else if (user.role === 'Faculty') {
                navigate('/dashboardFaculty');
            }
        }
    }, [navigate, location.state]);

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

            const data = await response.json();
            console.log("data", data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Explicitly remove old local storage items before storing new ones
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('email');

            // Store new values
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('email', data.user.email);

            // If user came from a protected page, send them back there first
            const from = location.state && location.state.from ? location.state.from : null;
            if (from) {
                navigate(from, { replace: true });
                return;
            }

            // Otherwise redirect based on role
            if (data.user.role === 'HOD') {
                navigate('/admin');
            } else if (data.user.role === 'Faculty') {
                navigate('/dashboardFaculty');
            } else {
                throw new Error('Invalid user role');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-container">
            <div className="background-effect"></div>

            <div className="login-box fade-in">
                <div className="logo-container">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQQeJ0BClNiKylgvlZo8TDKvc5wnoE-_rhMg&s"
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