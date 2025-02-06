import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt', { email, password });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="w-full px-8 py-6 flex justify-center items-center bg-[#8E9196]/20 backdrop-blur-md z-10 border-b border-[#8E9196]/30">
        <div className="text-4xl font-bold text-[#403E43] tracking-wide hover:text-primary transition-colors duration-300">
          The Ictians
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex justify-center items-center">
        <div className="card p-8 shadow-lg rounded-lg bg-white">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <p className="mb-6 opacity-80 text-center">Sign in to access your dashboard</p>
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
              <a href="#" className="text-sm hover:underline">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full rounded-[20px]">
              Sign in
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-8 py-4 bg-[#8E9196]/20 backdrop-blur-md border-t border-[#8E9196]/30 text-[#403E43] text-center">
        <p className="text-sm font-medium">
          Created with ❤️ by 
          <span className="mx-1 font-semibold hover:text-primary transition-colors duration-300">Harsh Doshi</span> |
          <span className="mx-1 font-semibold hover:text-primary transition-colors duration-300">Krish Mamtora</span> |
          <span className="mx-1 font-semibold hover:text-primary transition-colors duration-300">Rishit Rathod</span>
        </p>
      </footer>
    </div>
  );
};

export default Login;
