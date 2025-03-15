import React, { useState } from 'react';
import './Login.css';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
            console.log("data",data);
    
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
    
            // Redirect based on role
            console.log("fdfvxvdfdgfd");

            console.log("fdfdfd",data.user.role);
            console.log("fdfvxvdfdgfd");

            if (data.user.role === 'HOD') {
                window.location.href = '/dashboardHOD';
                console.log("fdfvxvdfdgfd");

                console.log("fdfdfd",data.user.role);
                console.log("fdfvxvdfdgfd");
    
            } else if (data.user.role === 'Faculty') {
                window.location.href = '/dashboardFaculty';
                console.log("fdfvxvdfdgfd");

                console.log("fdfdfd",data.user.role);
                console.log("fdfvxvdfdgfd");
    
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
