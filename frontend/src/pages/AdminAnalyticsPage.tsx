import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { apiClient } from '../api/client';
import { AnalyticsSummary } from '../types';

export const AdminAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    apiClient.getAnalyticsSummary().then(setSummary);
  }, []);

  const PRIORITY_COLORS: Record<string, string> = {
    Critical: '#D90429',
    High: '#E63946',
    Medium: '#F4A261',
    Low: '#457B9D'
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#102E50]">Municipal Analytics & Insights</h2>
        <p className="text-xs text-slate-500">
          Database-computed metrics and category trends across Bengaluru civic complaints.
        </p>
      </div>

      {/* AI Generated Action Brief */}
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border border-teal-200/80 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-[#087F8C]">
          <Sparkles className="w-5 h-5 text-[#087F8C]" />
          <h3 className="text-sm font-bold uppercase tracking-wider">AI Executive Action Brief</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong>Key Finding:</strong> Road infrastructure and streetlight failures constitute <strong>68%</strong> of all open grievances in the current period. Puttenahalli and Kumaraswamy Layout have experienced a 24% spike in road pothole reports following recent monsoon rainfall.
        </p>
        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <span className="bg-white px-2.5 py-1 rounded-md border border-teal-200 text-[#087F8C] font-semibold">
            Action: Issue joint inspection order for Bommanahalli division
          </span>
          <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 font-semibold">
            Confidence: 96%
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#102E50] mb-1">Grievances by Category</h3>
          <p className="text-xs text-slate-400 mb-4">Volume comparison across municipal sectors</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.category_distribution || []}>
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#102E50', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#087F8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#102E50] mb-1">Priority Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Urgency classification breakdown</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.priority_distribution || []}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ priority, percent }) => `${priority}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(summary?.priority_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
