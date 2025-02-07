// import React, { useState } from 'react';
// import './Login.css';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log('Login attempt with:', { email });
//     };

//     return (
//         <div className="login-container">
//             <div className="login-box">
//                 <h1>Welcome Back</h1>
//                 <p className="subtitle">Please enter your details</p>

//                 <form onSubmit={handleSubmit}>
//                     <div className="input-group">
//                         <label htmlFor="email">Email</label>
//                         <input
//                             type="email"
//                             id="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             placeholder="Enter your email"
//                             required
//                         />
//                     </div>

//                     <div className="input-group">
//                         <label htmlFor="password">Password</label>
//                         <input
//                             type="password"
//                             id="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             placeholder="Enter your password"
//                             required
//                         />
//                     </div>

//                     <div className="form-footer">
//                         <button type="button" className="forgot-password">
//                             Forgot password?
//                         </button>
//                     </div>

//                     <button type="submit" className="login-button">
//                         Log in
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;

import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/users/loginUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token and user data in local storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to the dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Welcome Back</h1>
                <p className="subtitle">Please enter your details</p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="form-footer">
                        <button type="button" className="forgot-password">
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Signing in...' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
