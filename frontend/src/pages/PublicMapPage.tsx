import React, { useEffect, useState } from 'react';
import { Filter, Flame, Layers, Search, Eye, MapPin } from 'lucide-react';
import { CivicMap } from '../components/map/CivicMap';
import { apiClient } from '../api/client';
import { Complaint, Hotspot } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';

export const PublicMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Filters
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [showHotspots, setShowHotspots] = useState(true);

  const categories = [
    'All',
    'Roads and Infrastructure',
    'Waste Management',
    'Streetlights',
    'Drainage and Sewage',
    'Public Safety',
    'Water Supply'
  ];

  const statuses = ['All', 'Submitted', 'Awaiting Review', 'In Progress', 'Resolved'];

  useEffect(() => {
    apiClient.getComplaints({
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      search: search || undefined,
      limit: 100
    }).then(setComplaints);

    apiClient.getHotspots().then(setHotspots);
  }, [category, status, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102E50]">Bengaluru Public Civic Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Privacy-sanitized public complaint distribution and DBSCAN recurring hotspot clusters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <select
            aria-label="Filter civic complaints by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#087F8C]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            aria-label="Filter civic complaints by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#087F8C]"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>

          {/* Hotspot Toggle */}
          <button
            aria-label="Toggle spatial hotspot rings overlay on map"
            aria-pressed={showHotspots}
            onClick={() => setShowHotspots(!showHotspots)}
            className={`inline-flex items-center text-xs font-semibold px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-[#087F8C] ${
              showHotspots
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 mr-1 text-amber-600" aria-hidden="true" />
            Hotspot Rings: {showHotspots ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Map + Selected Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CivicMap
            complaints={complaints}
            hotspots={hotspots}
            height="560px"
            showHotspotRings={showHotspots}
            onSelectComplaint={setSelectedComplaint}
          />
        </div>

        {/* Selected Complaint / Feed Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col h-[560px] overflow-hidden">
          <h3 className="text-sm font-bold text-[#102E50] pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>{selectedComplaint ? 'Selected Grievance' : 'Public Feed (Bengaluru)'}</span>
            <span className="text-[11px] font-normal text-slate-400">{complaints.length} issues in view</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
            {selectedComplaint ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700">{selectedComplaint.reference_id}</span>
                  <PriorityBadge priority={selectedComplaint.priority} />
                </div>
                <h4 className="text-sm font-bold text-[#102E50]">{selectedComplaint.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedComplaint.description}</p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <p><strong>Ward:</strong> {selectedComplaint.ward}</p>
                  <p><strong>Address:</strong> {selectedComplaint.address}</p>
                  <div className="pt-1">
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="w-full py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Back to All Feed
                </button>
              </div>
            ) : (
              complaints.slice(0, 15).map((c) => (
                <div
                  key={c.id || c.reference_id}
                  onClick={() => setSelectedComplaint(c)}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/40 hover:border-teal-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-600">{c.reference_id}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h4 className="text-xs font-semibold text-[#102E50] mt-1 line-clamp-1">{c.title}</h4>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{c.ward || 'Bengaluru'}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
