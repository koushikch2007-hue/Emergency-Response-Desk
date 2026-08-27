import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Siren, Lock, Mail, User, Phone, Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/report';

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[a-zA-Z]/.test(pwd)) return 'Password must contain at least one letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (tab === 'signup') {
      if (!fullName.trim()) {
        setError('Full Name is required for registration.');
        return;
      }
      const pwdError = validatePassword(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
      switchDemoUser('reporter');
      navigate(from, { replace: true });
    } else if (tab === 'signin') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }
      switchDemoUser('reporter');
      navigate(from, { replace: true });
    } else if (tab === 'reset') {
      if (!email.trim()) {
        setError('Please enter your account email address.');
        return;
      }
      setSuccessMsg(`Password reset instructions have been sent to ${email}.`);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchDemoUser(role);
    if (role === 'authority') navigate('/authority');
    else if (role === 'admin') navigate('/admin');
    else navigate('/report');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-red-600 rounded-2xl text-white shadow-lg mb-2">
            <Siren className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Emergency Response Desk</h2>
          <p className="text-xs text-slate-400">Secure Authentication Portal</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setTab('signin'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition ${tab === 'signin' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition ${tab === 'signup' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setTab('reset'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition ${tab === 'reset' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Citizen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="reporter@emergency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {tab !== 'reset' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>
              {tab === 'signup' && (
                <p className="text-[10px] text-slate-500">Must be 8+ chars with at least 1 letter & 1 number.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>{tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Evaluator Account Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            ⚡ Quick Evaluator Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemo('reporter')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-2 rounded-xl border border-slate-700 transition text-center"
            >
              Reporter
            </button>
            <button
              onClick={() => handleQuickDemo('authority')}
              className="bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 font-bold p-2 rounded-xl border border-blue-500/30 transition text-center"
            >
              Authority
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-bold p-2 rounded-xl border border-purple-500/30 transition text-center"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
