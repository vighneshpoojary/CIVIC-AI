import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, MapPin, PlusCircle, UserCircle2, Search } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Public Civic Map', path: '/public-map' },
    { label: 'Track Complaint', path: '/track' },
    { label: 'How It Works', path: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#102E50] flex items-center justify-center text-white shadow-sm group-hover:bg-[#087F8C] transition-colors">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#102E50] block leading-none">
                Civic<span className="text-[#087F8C]">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Bengaluru Civic Action
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-[#087F8C] font-semibold'
                      : 'text-slate-600 hover:text-[#102E50] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/overview"
              className="hidden lg:inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Admin Portal
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-[#102E50] px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <UserCircle2 className="w-4 h-4 mr-1.5 text-slate-500" />
              Sign In
            </Link>

            <Link
              to="/submit"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-[#087F8C] hover:bg-[#06636D] text-white shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report Issue
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
