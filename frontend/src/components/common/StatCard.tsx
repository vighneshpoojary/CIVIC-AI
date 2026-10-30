import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: 'navy' | 'teal' | 'amber' | 'red' | 'green';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'navy'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'teal':
        return 'bg-teal-50 text-[#087F8C] border-teal-100';
      case 'amber':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'red':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'green':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'navy':
      default:
        return 'bg-slate-50 text-[#102E50] border-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`p-2.5 rounded-lg border ${getColorClasses()}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-[#102E50]">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </motion.div>
  );
};
