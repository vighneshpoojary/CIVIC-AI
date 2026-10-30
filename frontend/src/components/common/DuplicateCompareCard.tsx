import React from 'react';
import { Copy, MapPin, Percent, ExternalLink } from 'lucide-react';
import { DuplicateMatch } from '../../types';

export const DuplicateCompareCard: React.FC<{
  match: DuplicateMatch;
  onViewDetails?: (refId: string) => void;
}> = ({ match, onViewDetails }) => {
  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 hover:bg-amber-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-1 bg-amber-100 text-amber-800 rounded">
            <Copy className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-xs font-bold text-slate-800">
            {match.reference_id}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            <Percent className="w-3 h-3 mr-0.5" />
            {Math.round(match.similarity_score * 100)}% Match
          </span>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(match.reference_id)}
              className="text-xs text-[#087F8C] hover:underline flex items-center"
            >
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-xs font-semibold text-slate-700 line-clamp-1">
        {match.title}
      </p>
      <div className="mt-2 flex items-center text-[11px] text-slate-500">
        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
        <span>Approx. {match.distance_meters}m away</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-600 bg-white/70 p-1.5 rounded border border-amber-100 italic">
        {match.match_rationale}
      </p>
    </div>
  );
};
