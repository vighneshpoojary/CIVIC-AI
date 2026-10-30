import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '../../types';

export const StatusBadge: React.FC<{ status: ComplaintStatus | string }> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'AI Reviewed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Awaiting Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Assigned':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Needs Clarification':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Reopened':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority | string }> = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {priority}
    </span>
  );
};
