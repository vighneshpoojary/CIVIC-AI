import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Flame,
  BarChart3,
  Users,
  Database,
  Settings,
  ShieldCheck,
  ArrowLeft,
  FileCheck2
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const AdminSidebar: React.FC<SidebarProps> = () => {
  const menuItems = [
    { label: 'Overview Dashboard', path: '/admin/overview', icon: LayoutDashboard },
    { label: 'Complaint Queue', path: '/admin/complaints', icon: ClipboardList },
    { label: 'Geographic Hotspots', path: '/admin/hotspots', icon: Flame },
    { label: 'Analytics & Trends', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Officer Directory', path: '/admin/officers', icon: Users },
    { label: 'Dataset Management', path: '/admin/datasets', icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#102E50] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-[#0B1F36]">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#087F8C] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block leading-none">
              Civic<span className="text-[#087F8C]">AI</span> Admin
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Control Center
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Management
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'text-white bg-[#087F8C] shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Return to Public Portal */}
      <div className="p-3 border-t border-slate-700/60">
        <Link
          to="/"
          className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </Link>
      </div>
    </aside>
  );
};
