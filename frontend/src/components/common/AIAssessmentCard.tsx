import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { AIAssessment } from '../../types';
import { PriorityBadge } from './StatusBadge';

export const AIAssessmentCard: React.FC<{ assessment: AIAssessment }> = ({ assessment }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-xl border border-teal-200/60 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-teal-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#087F8C] text-white rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#102E50]">AI Complaint Intelligence</h4>
            <p className="text-xs text-slate-500">Gemini 2.5 Flash Advisory Engine</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100/80 text-[#087F8C]">
          Confidence: {Math.round(assessment.confidence_score * 100)}%
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 rounded-lg p-3 border border-slate-200/60"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Executive Summary</span>
          <p className="text-sm text-slate-700 mt-1 font-medium leading-relaxed">
            {assessment.summary}
          </p>
        </motion.div>

        {/* Classification & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 rounded-lg p-3 border border-slate-200/60"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recommended Category</span>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#102E50]">{assessment.category}</p>
                <p className="text-xs text-slate-500">{assessment.subcategory}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Dept: {assessment.suggested_department}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/80 rounded-lg p-3 border border-slate-200/60"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assessed Priority</span>
            <div className="mt-1 flex items-center space-x-2">
              <PriorityBadge priority={assessment.priority_recommendation} />
              <span className="text-xs text-slate-500">Explainable scoring</span>
            </div>
            {assessment.risk_factors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {assessment.risk_factors.slice(0, 2).map((rf, idx) => (
                  <span key={idx} className="inline-flex items-center text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                    <ShieldAlert className="w-2.5 h-2.5 mr-1" />
                    {rf}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Explainable Reasoning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white/80 rounded-lg p-3 border border-slate-200/60"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600" />
            Decision Justification & Rationale
          </span>
          <ul className="mt-2 space-y-1.5">
            {assessment.priority_reasoning.map((reason, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start">
                <span className="text-teal-500 font-bold mr-1.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="mt-3 pt-2 border-t border-teal-100/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
          Advisory prediction; subject to administrative verification
        </span>
        <span>CivicAI v1.0</span>
      </div>
    </div>
  );
};
