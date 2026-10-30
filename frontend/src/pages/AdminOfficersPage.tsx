import React, { useEffect, useState } from 'react';
import { Users, Search, UserCheck, Briefcase, Building2, Phone, Mail } from 'lucide-react';
import { apiClient } from '../api/client';
import { Officer } from '../types';

export const AdminOfficersPage: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.getOfficers().then(setOfficers);
  }, []);

  const filtered = officers.filter(
    (o) =>
      o.officer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.officer_designation.toLowerCase().includes(search.toLowerCase()) ||
      o.normalized_category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#102E50]">Municipal Officer Directory</h2>
          <p className="text-xs text-slate-500">
            Real engineering and sanitary staff extracted from BBMP grievance records with workload metrics.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search officer or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#087F8C]"
          />
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((off, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#102E50]">
                  {off.officer_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#102E50]">{off.officer_name}</h4>
                  <span className="inline-block text-[10px] font-semibold text-[#087F8C] bg-teal-50 px-2 py-0.5 rounded">
                    {off.officer_designation}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Department</span>
                  <span className="font-semibold text-slate-800">{off.normalized_category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Total Cases Handled</span>
                  <span className="font-bold text-[#102E50]">{off.cases_handled} active</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                Active on Duty
              </span>
              <button
                onClick={() => alert(`Direct dispatch link created for ${off.officer_name}`)}
                className="text-xs font-semibold text-[#087F8C] hover:underline"
              >
                Assign Workload &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
