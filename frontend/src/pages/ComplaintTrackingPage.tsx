import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  MapPin,
  Calendar,
  Sparkles,
  Star
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Complaint } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';

export const ComplaintTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [refId, setRefId] = useState(searchParams.get('ref') || 'BLR-2024-00001');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const fetchTracking = async (idToSearch: string) => {
    if (!idToSearch) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await apiClient.getComplaintByRef(idToSearch);
      setComplaint(res);
    } catch (e) {
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialRef = searchParams.get('ref');
    if (initialRef) {
      setRefId(initialRef);
      fetchTracking(initialRef);
    } else {
      fetchTracking('BLR-2024-00001');
    }
  }, [searchParams]);

  const stages = [
    'Submitted',
    'AI Reviewed',
    'Awaiting Review',
    'Assigned',
    'In Progress',
    'Resolved'
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx : 2; // Default to awaiting review
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#102E50]">Track Complaint Status</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter your unique complaint reference ID to view real-time municipal updates.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchTracking(refId);
          }}
          className="mt-6 flex items-center bg-white p-1.5 rounded-xl border border-slate-300 shadow-sm focus-within:border-[#087F8C]"
        >
          <Search className="w-5 h-5 text-slate-400 ml-2.5" />
          <input
            type="text"
            placeholder="e.g. BLR-2024-00001"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#087F8C] hover:bg-[#06636D] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {complaint ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-[#102E50] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm bg-white/10 px-2.5 py-0.5 rounded font-bold">
                  {complaint.reference_id}
                </span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <h2 className="text-lg font-bold mt-2">{complaint.title}</h2>
              <div className="flex items-center space-x-4 text-xs text-slate-300 mt-1">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-teal-400" />
                  {complaint.address}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-teal-400" />
                  {new Date(complaint.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Current Status</span>
              <div className="mt-1">
                <StatusBadge status={complaint.status} />
              </div>
            </div>
          </div>

          {/* Stepped Progress Bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Status Progression Timeline
            </h4>
            <div className="relative flex items-center justify-between max-w-2xl mx-auto">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
              {stages.map((stage, idx) => {
                const currentIdx = getStageIndex(complaint.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={stage} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#087F8C] text-white ring-4 ring-teal-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent ? 'text-[#087F8C] font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Description</span>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {complaint.description}
                </p>
              </div>

              {/* Status History Timeline */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Activity Log</span>
                <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-3">
                  {(complaint.timeline || [
                    { status: complaint.status, changed_by: 'BBMP Engineering', timestamp: complaint.updated_at, public_note: 'Assessment registered and assigned for departmental action.' }
                  ]).map((t, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700">{t.status}</span>
                        <span className="text-[10px] text-slate-400">&bull; {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{t.public_note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Officer & Routing Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-[#102E50] border-b pb-2">Responsible Division</h4>
              
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                <div className="flex items-center space-x-1.5 mt-0.5 font-medium text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{complaint.assigned_department_id || 'Roads and Infrastructure'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Officer</span>
                <div className="flex items-center space-x-1.5 mt-0.5 font-medium text-slate-800">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{complaint.assigned_officer_id || 'Ward Junior Engineer (JE)'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ward Centroid</span>
                <span className="font-mono text-slate-700 block mt-0.5">
                  {complaint.ward || 'Bengaluru Central'} [{complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}]
                </span>
              </div>

              {/* Citizen Feedback Form if Resolved */}
              {complaint.status === 'Resolved' && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">Citizen Feedback</span>
                  {feedbackSent ? (
                    <p className="text-xs text-emerald-600 font-medium">Thank you for rating municipal resolution!</p>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-4 h-4 ${feedbackRating >= star ? 'fill-current' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setFeedbackSent(true)}
                        className="w-full py-1.5 bg-[#087F8C] text-white rounded text-[11px] font-semibold"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : searched ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No complaint record found matching reference ID: <strong className="text-slate-700">{refId}</strong>.
          <p className="text-xs text-slate-400 mt-1">Please double-check the ID from your submission receipt.</p>
        </div>
      ) : null}
    </div>
  );
};
