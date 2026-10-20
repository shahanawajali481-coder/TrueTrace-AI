import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-navy-700/80 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-violet flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-primary/20">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sign In to TrueTrace AI</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your secure identity risk evaluations and scan history.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-navy-800 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-primary font-semibold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
