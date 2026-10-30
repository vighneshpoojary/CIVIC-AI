import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  UserCheck,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Complaint, AIAssessment, DuplicateMatch, Officer } from '../types';
import { AIAssessmentCard } from '../components/common/AIAssessmentCard';
import { DuplicateCompareCard } from '../components/common/DuplicateCompareCard';
import { PriorityBadge, StatusBadge } from '../components/common/StatusBadge';

export const AdminReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  // Administrative Action Form
  const [assignedDept, setAssignedDept] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [approvedPriority, setApprovedPriority] = useState('Medium');
  const [internalNote, setInternalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      apiClient.getComplaintById(id),
      apiClient.getOfficers(),
    ]).then(([c, offs]) => {
      if (c) {
        setComplaint(c);
        setApprovedPriority(c.priority);
        setAssignedDept(c.assigned_department_id || 'Roads and Infrastructure');
        setAssignedOfficer(c.assigned_officer_id || '');

        // Fetch AI analysis & duplicate check
        apiClient.analyzeDraft(c.title, c.description, c.category, c.ward || 'Bengaluru')
          .then(setAssessment)
          .catch(console.error);

        apiClient.checkDuplicates(c.title, c.description, c.category, c.latitude, c.longitude)
          .then(res => setDuplicateMatches(res.matches))
          .catch(console.error);
      }
      setOfficers(offs);
      setLoading(false);
    });
  }, [id]);

  const handleSaveAssignment = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await apiClient.assignComplaint(id, {
        assigned_department_id: assignedDept,
        assigned_officer_id: assignedOfficer,
        priority: approvedPriority,
      });
      alert('Assignment saved and status updated to Assigned.');
      navigate('/admin/complaints');
    } catch {
      alert('Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (newStatus: string) => {
    if (!id) return;
    try {
      await apiClient.updateComplaintStatus(id, newStatus, internalNote || `Status set to ${newStatus}`);
      alert(`Status transitioned to ${newStatus}`);
      navigate('/admin/complaints');
    } catch {
      alert('Failed to update status');
    }
  };

  if (loading || !complaint) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading complaint review workspace...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/complaints')}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#102E50]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Complaint Queue
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-slate-500">{complaint.reference_id}</span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Side-by-side: Citizen Report vs AI Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Original Citizen Submission */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#102E50] uppercase tracking-wider">
              Citizen Submission Details
            </h3>
            <PriorityBadge priority={complaint.priority} />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Issue Title</span>
            <h2 className="text-base font-bold text-[#102E50] mt-0.5">{complaint.title}</h2>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Citizen Description</span>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {complaint.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Reported Category</span>
              <p className="font-semibold text-slate-800">{complaint.category}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Ward Name</span>
              <p className="font-semibold text-slate-800">{complaint.ward || 'Bengaluru Central'}</p>
            </div>
          </div>

          <div className="text-xs pt-2">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Reported Location & Landmark</span>
            <p className="text-slate-700 mt-0.5">{complaint.address}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Coordinates: [{complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}]
            </p>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Submitted: {new Date(complaint.created_at).toLocaleString()}</span>
            <span>Source: {complaint.source_name || 'Citizen Portal'}</span>
          </div>
        </div>

        {/* Right: AI Assessment & Duplicates Panel */}
        <div className="space-y-4">
          {assessment ? (
            <AIAssessmentCard assessment={assessment} />
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
              Generating Gemini AI Assessment...
            </div>
          )}

          {/* Duplicate Candidates */}
          {duplicateMatches.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>Nearby Potential Duplicate Complaints Detected</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Found {duplicateMatches.length} existing reports nearby. Human review required before linking or merging.
              </p>
              <div className="space-y-2 mt-2">
                {duplicateMatches.map((m, i) => (
                  <DuplicateCompareCard key={i} match={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Panel: Administrative Action & Assignment */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#102E50] uppercase tracking-wider pb-3 border-b border-slate-100">
          Official Administrative Review & Officer Assignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Responsible Department
            </label>
            <select
              value={assignedDept}
              onChange={(e) => setAssignedDept(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-[#087F8C]"
            >
              <option value="Roads and Infrastructure">Roads and Infrastructure (BBMP)</option>
              <option value="Waste Management">Solid Waste Management (SWM)</option>
              <option value="Streetlights">Electrical Engineering Division</option>
              <option value="Drainage and Sewage">Storm Water Drains (SWD)</option>
              <option value="Water Supply">Water Supply (BWSSB)</option>
              <option value="Public Safety">Public Safety & Encroachment</option>
            </select>
          </div>

          {/* Officer Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Official Officer
            </label>
            <select
              value={assignedOfficer}
              onChange={(e) => setAssignedOfficer(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-[#087F8C]"
            >
              <option value="">-- Select Officer from Directory --</option>
              {officers.map((off, idx) => (
                <option key={idx} value={off.officer_name}>
                  {off.officer_name} ({off.officer_designation} - {off.cases_handled} active)
                </option>
              ))}
            </select>
          </div>

          {/* Approved Priority Override */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Final Official Priority
            </label>
            <select
              value={approvedPriority}
              onChange={(e) => setApprovedPriority(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-[#087F8C]"
            >
              <option value="Critical">Critical (Immediate Danger)</option>
              <option value="High">High (High Public Exposure)</option>
              <option value="Medium">Medium (Standard SLA)</option>
              <option value="Low">Low (Minor / Routine)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Internal Administrative Note (Private from citizen)
          </label>
          <input
            type="text"
            placeholder="e.g. Dispatched junior engineer for site inspection before rain. Expedited road patch tender."
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#087F8C]"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuickStatus('Needs Clarification')}
              className="inline-flex items-center text-xs font-semibold px-3 py-2 border border-amber-300 text-amber-800 bg-amber-50 rounded-lg hover:bg-amber-100"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              Request Clarification
            </button>
            <button
              onClick={() => handleQuickStatus('Rejected')}
              className="inline-flex items-center text-xs font-semibold px-3 py-2 border border-rose-300 text-rose-800 bg-rose-50 rounded-lg hover:bg-rose-100"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject Grievance
            </button>
          </div>

          <button
            disabled={submitting}
            onClick={handleSaveAssignment}
            className="inline-flex items-center text-xs font-bold px-6 py-2.5 bg-[#087F8C] hover:bg-[#06636D] text-white rounded-lg shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {submitting ? 'Saving...' : 'Approve & Assign Department'}
          </button>
        </div>
      </div>
    </div>
  );
};
