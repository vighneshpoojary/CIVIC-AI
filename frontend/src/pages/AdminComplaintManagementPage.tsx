import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, ArrowUpDown, ChevronRight } from 'lucide-react';
import { apiClient } from '../api/client';
import { Complaint } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';

export const AdminComplaintManagementPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  const categories = [
    'All',
    'Roads and Infrastructure',
    'Waste Management',
    'Streetlights',
    'Drainage and Sewage',
    'Public Safety',
    'Water Supply'
  ];

  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Submitted', 'Awaiting Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

  const fetchComplaints = () => {
    setLoading(true);
    apiClient.getComplaints({
      category: category !== 'All' ? category : undefined,
      priority: priority !== 'All' ? priority : undefined,
      status: status !== 'All' ? status : undefined,
      search: search || undefined,
      limit: 100,
    }).then((res) => {
      setComplaints(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, priority, status]);

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#102E50]">Complaint Management Queue</h2>
          <p className="text-xs text-slate-500">Filter, search, review, and track all municipal grievances across Bengaluru.</p>
        </div>

        <button
          onClick={() => alert('Exporting active queue as CSV report...')}
          className="inline-flex items-center text-xs font-semibold px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          Export CSV Report
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, keyword, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#087F8C]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-[#087F8C]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>Category: {c}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-[#087F8C]"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>Priority: {p}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-[#087F8C]"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>Status: {s}</option>
          ))}
        </select>
      </div>

      {/* Complaint Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Showing {complaints.length} Records</span>
          <span className="text-[11px] text-slate-400">Sorted by Newest</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Ward Area</th>
                <th className="py-3 px-4">AI Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <tr key={c.id || c.reference_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#102E50]">{c.reference_id}</td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-semibold text-slate-800 line-clamp-1">{c.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{c.description}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{c.category}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.ward || 'Bengaluru'}</td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {c.assigned_officer_id || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/review/${c.id}`}
                      className="inline-flex items-center px-2.5 py-1 rounded bg-[#087F8C]/10 text-[#087F8C] hover:bg-[#087F8C] hover:text-white font-semibold text-xs transition-colors"
                    >
                      Review
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
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
