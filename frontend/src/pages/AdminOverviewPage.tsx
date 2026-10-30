import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { apiClient } from '../api/client';
import { AnalyticsSummary, Complaint } from '../types';

export const AdminOverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [pendingComplaints, setPendingComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    apiClient.getAnalyticsSummary().then(setSummary);
    apiClient.getComplaints({ status: 'Awaiting Review', limit: 8 }).then(setPendingComplaints);
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Grievances"
          value={summary?.total_complaints || 0}
          icon={<ClipboardList className="w-5 h-5 text-[#102E50]" />}
          subtitle="All active municipal records"
          trend="+12% this week"
          color="navy"
        />
        <StatCard
          title="Awaiting Review"
          value={summary?.awaiting_review || 0}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          subtitle="Pending officer assignment"
          color="amber"
        />
        <StatCard
          title="High / Critical Urgency"
          value={summary?.high_or_critical || 0}
          icon={<AlertOctagon className="w-5 h-5 text-red-600" />}
          subtitle="AI flagged safety risk"
          color="red"
        />
        <StatCard
          title="Resolved Cases"
          value={summary?.resolved || 0}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          subtitle="Verified by citizens"
          trend="89% resolution rate"
          color="green"
        />
      </div>

      {/* Charts & Urgent Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#102E50]">Complaint Category Distribution</h3>
              <p className="text-xs text-slate-500">Live counts across major municipal engineering divisions</p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-semibold text-[#087F8C] hover:underline flex items-center">
              Deep Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.category_distribution || []}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#102E50', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Bar dataKey="count" fill="#087F8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspot Quick Alert Box */}
        <div className="bg-gradient-to-br from-red-50/50 via-white to-amber-50/30 rounded-2xl border border-red-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>DBSCAN Spatial Hotspots</span>
            </div>
            <h3 className="text-lg font-bold text-[#102E50]">High-Density Recurring Zones</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              DBSCAN algorithmic clustering has identified active spatial clusters in Puttenahalli, HSR Layout, and Padmanabha Nagar requiring coordinated road inspection.
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/admin/hotspots"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#102E50] hover:bg-[#1D426D] shadow-sm transition-all"
            >
              Open Hotspot Map & Analysis &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Review Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#102E50]">Priority Complaints Awaiting Assignment</h3>
            <p className="text-xs text-slate-500">Requires administrative verification of AI categorization and officer dispatch</p>
          </div>
          <Link to="/admin/complaints" className="text-xs font-semibold text-[#087F8C] hover:underline">
            View All ({pendingComplaints.length}) &rarr;
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Reference ID</th>
                <th className="py-2.5 px-3">Issue Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingComplaints.map((c) => (
                <tr key={c.id || c.reference_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#102E50]">{c.reference_id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate">{c.title}</td>
                  <td className="py-3 px-3 text-slate-600">{c.category}</td>
                  <td className="py-3 px-3 text-slate-600">{c.ward || 'Bengaluru'}</td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/admin/review/${c.id}`}
                      className="inline-flex items-center text-xs font-semibold text-[#087F8C] hover:underline"
                    >
                      Review & Assign &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
