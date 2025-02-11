import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import '../pages/css/Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/loginUser', {
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/home');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="w-full px-8 py-6 flex justify-center items-center bg-opacity-20 backdrop-blur-md z-10 border-b border-opacity-30">
        <div className="text-4xl font-bold text-gray-700 tracking-wide hover-text-primary transition-colors">
          The Ictians
        </div>
      </nav>

      <div className="flex-grow flex justify-center items-center">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <p className="mb-6 opacity-80 text-center">Sign in to access your dashboard</p>
          
          {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="MU Email"
              required
            />
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <div className="text-right">
              <a href="#" className="text-sm hover-underline">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full rounded-20px" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>

      <footer className="w-full px-8 py-4 bg-opacity-20 backdrop-blur-md border-t border-opacity-30 text-gray-700 text-center">
        <p className="text-sm font-medium">
          Created with by 
          <span className="mx-1 font-semibold hover-text-primary transition-colors">Harsh Doshi</span> |
          <span className="mx-1 font-semibold hover-text-primary transition-colors">Krish Mamtora</span> |
          <span className="mx-1 font-semibold hover-text-primary transition-colors">Rishit Rathod</span>
        </p>
      </footer>
    </div>
  );
};

export default Login;