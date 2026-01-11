import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
  trendLabel?: string;
  inverseTrend?: boolean; // If true, negative trend is good (e.g. CPA)
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon, 
  trendLabel = "vs. periodo anterior",
  inverseTrend = false
}) => {
  const isPositive = trend && trend > 0;
  // If inverseTrend is true (e.g. Cost), a positive number is "bad" (red), negative is "good" (green)
  const isGood = inverseTrend ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          {icon || <Activity size={20} />}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center text-sm">
          <span className={`flex items-center font-medium ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-slate-400 ml-2">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};
