import React, { useEffect, useState } from 'react';
import { Flame, Sliders, ShieldAlert, MapPin, Building2, AlertTriangle, ArrowRight } from 'lucide-react';
import { CivicMap } from '../components/map/CivicMap';
import { apiClient } from '../api/client';
import { Complaint, Hotspot } from '../types';
import { PriorityBadge } from '../components/common/StatusBadge';

export const AdminHotspotMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Clustering tuning parameters
  const [epsMeters, setEpsMeters] = useState(500);
  const [minSamples, setMinSamples] = useState(3);

  useEffect(() => {
    apiClient.getComplaints({ limit: 300 }).then(setComplaints);
    apiClient.getHotspots().then((hs) => {
      setHotspots(hs);
      if (hs.length > 0) setSelectedHotspot(hs[0]);
    });
  }, [epsMeters, minSamples]);

  return (
    <div className="space-y-6">
      {/* Header & Algorithm Settings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Spatial Intelligence & Recurrence Engine</span>
          </div>
          <h2 className="text-xl font-bold text-[#102E50]">Geographic Hotspot Analysis (DBSCAN)</h2>
          <p className="text-xs text-slate-500">
            Automated spatial density detection revealing chronic infrastructure failures and citizen report clusters.
          </p>
        </div>

        {/* Algorithm Tuning Controls */}
        <div className="flex items-center space-x-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">Radius (&epsilon;):</span>
            <span className="font-mono font-bold text-[#087F8C]">{epsMeters}m</span>
          </div>
          <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-4">
            <span className="font-semibold text-slate-600">Min Samples:</span>
            <span className="font-mono font-bold text-[#087F8C]">{minSamples} reports</span>
          </div>
        </div>
      </div>

      {/* Main Map + Cluster Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map View */}
        <div className="lg:col-span-2">
          <CivicMap
            complaints={complaints}
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            height="580px"
            showHotspotRings={true}
          />
        </div>

        {/* Selected Hotspot Intelligence Drawer */}
        <div className="space-y-4">
          {selectedHotspot ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {selectedHotspot.hotspot_id}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  selectedHotspot.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedHotspot.severity} Density
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Ward Area</span>
                <h3 className="text-base font-bold text-[#102E50] mt-0.5">{selectedHotspot.ward}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Coordinates: [{selectedHotspot.center_latitude}, {selectedHotspot.center_longitude}]
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Complaints</span>
                  <p className="text-lg font-bold text-[#102E50]">{selectedHotspot.complaint_count}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">High / Critical</span>
                  <p className="text-lg font-bold text-red-600">{selectedHotspot.critical_count}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Dominant Infrastructure Issue</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedHotspot.dominant_category}</p>
              </div>

              {/* AI Recommended Administrative Action */}
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[#087F8C] flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#087F8C]" />
                  Recommended Action Brief
                </span>
                <p className="text-[11px] leading-relaxed">
                  Recurring reports indicate chronic road and drainage degradation in this sector. Recommend dispatching the Chief Engineer for a coordinated ward-level site audit rather than treating complaints as isolated incidents.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
                  Member Complaints in Cluster
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHotspot.sample_complaints.map((ref) => (
                    <span key={ref} className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
              Select a hotspot circle on the map to inspect cluster metrics.
            </div>
          )}

          {/* All Detected Clusters List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#102E50] uppercase tracking-wider mb-2">
              Detected Spatial Clusters ({hotspots.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {hotspots.map((h) => (
                <div
                  key={h.hotspot_id}
                  onClick={() => setSelectedHotspot(h)}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedHotspot?.hotspot_id === h.hotspot_id
                      ? 'bg-teal-50 border border-teal-200 text-[#087F8C] font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <span className="font-mono text-[11px]">{h.hotspot_id} ({h.ward})</span>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                    {h.complaint_count} reports
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
