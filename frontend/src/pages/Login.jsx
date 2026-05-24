import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import { Heart, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Welcome back to LifeFlow!', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-hospital-gray-abyss flex items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-hospital-red flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="font-extrabold text-lg text-hospital-gray-deep dark:text-white">LifeFlow</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-hospital-gray-deep rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-hospital-red/5 rounded-full blur-xl" />
        
        <div className="space-y-2 text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight dark:text-white">Welcome Back</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Log in to manage donations, requests, or stock levels</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-hospital-red font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
