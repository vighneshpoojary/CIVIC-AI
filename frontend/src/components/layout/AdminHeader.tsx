import React from 'react';
import { Bell, Search, UserCheck } from 'lucide-react';

export const AdminHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-lg font-bold text-[#102E50] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Environment Badge */}
        <span className="hidden sm:inline-flex items-center text-[11px] font-semibold text-[#087F8C] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 animate-pulse" />
          Live Municipal Operations
        </span>

        {/* Alerts Button */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Officer Profile Chip */}
        <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#102E50] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            JD
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">J. Devaraj</p>
            <p className="text-[10px] text-slate-500 leading-none mt-1">Super Admin / BBMP</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102E50] text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-base font-bold text-white tracking-tight">CivicAI</span>
            <p className="text-xs leading-relaxed text-slate-400">
              Smarter Cities. Stronger Communities. An AI-assisted civic complaint management platform empowering citizens and municipal authorities in Bengaluru.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-2 text-[11px]">Workflow Stages</h5>
            <ul className="space-y-1.5">
              <li>1. Capture: Fast Citizen Reporting</li>
              <li>2. Understand: AI Categorization</li>
              <li>3. Reveal: Hotspot Spatial Analysis</li>
              <li>4. Act: Officer Assignment & Tracking</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-2 text-[11px]">Municipal Portals</h5>
            <ul className="space-y-1.5">
              <li><a href="/public-map" className="hover:text-white transition-colors">Bengaluru Public Map</a></li>
              <li><a href="/track" className="hover:text-white transition-colors">Track Complaint Status</a></li>
              <li><a href="/admin/overview" className="hover:text-white transition-colors">Official Admin Portal</a></li>
              <li><a href="/submit" className="hover:text-white transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-2 text-[11px]">Civic Transparency</h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              CivicAI is an independent smart city initiative developed for PromptWars x ASTRA Hackathon. Not an official municipal agency website.
            </p>
            <p className="mt-2 text-[10px] text-slate-500">
              &copy; {new Date().getFullYear()} CivicAI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
