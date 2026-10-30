import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('citizen@civicai.org');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminMode) {
      navigate('/admin/overview');
    } else {
      navigate('/submit');
    }
  };

  const handleToggleMode = (admin: boolean) => {
    setIsAdminMode(admin);
    if (admin) {
      setEmail('admin.blr@civicai.org');
      setPassword('adminPass2026!');
    } else {
      setEmail('citizen@civicai.org');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-[#102E50] text-teal-300 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#102E50]">
            Sign in to Civic<span className="text-[#087F8C]">AI</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAdminMode ? 'Official Municipal Administration Gateway' : 'Citizen Grievance & Tracking Portal'}
          </p>
        </div>

        {/* Portal Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleToggleMode(false)}
            className={`py-2 rounded-lg transition-all ${
              !isAdminMode ? 'bg-white text-[#102E50] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Citizen Portal
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode(true)}
            className={`py-2 rounded-lg transition-all ${
              isAdminMode ? 'bg-[#102E50] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Admin / Officer
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#087F8C]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <a href="#" className="text-[11px] text-[#087F8C] hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#087F8C]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#087F8C] hover:bg-[#06636D] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center"
          >
            <span>Sign In to {isAdminMode ? 'Control Center' : 'Citizen Dashboard'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>

        {/* Demo Fast Login Banner */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
          <p className="font-semibold text-slate-700">Demo Fast Credentials Loaded</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Click Sign In directly to proceed.</p>
        </div>

        {isAdminMode && (
          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin privileges are strictly verified by backend role auth.</span>
          </div>
        )}
      </div>
    </div>
  );
};
