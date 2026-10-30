import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertCircle, FileText, Layers, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import { DatasetItem } from '../types';

export const AdminDatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);

  useEffect(() => {
    apiClient.getDatasets().then(setDatasets);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#102E50]">Dataset Management & Provenance</h2>
          <p className="text-xs text-slate-500">
            Audit catalog of municipal and public datasets powering CivicAI models and benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Strict Provenance Separation: Verified</span>
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#087F8C] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {ds.id.toUpperCase()}
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {ds.validation_status}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#102E50] mt-3">{ds.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Source: {ds.source}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Row Count</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{ds.record_count.toLocaleString()} rows</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Coverage</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">{ds.geographic_coverage}</p>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Data Type & Provenance:</span>
                <p className="font-medium mt-0.5 text-slate-700">{ds.data_type}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">File: {ds.file_name}</span>
              <span className="text-[#087F8C] font-semibold">{ds.processing_status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
