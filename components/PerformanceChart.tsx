import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyPerformance } from '../types';

interface MetricConfig {
  key: keyof DailyPerformance;
  name: string;
  color: string;
  yAxisId: 'left' | 'right';
  prefix?: string;
  suffix?: string;
}

interface PerformanceChartProps {
  data: DailyPerformance[];
  title?: string;
  subtitle?: string;
  metrics?: MetricConfig[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  title = "Rendimiento: Inversión vs Leads", 
  subtitle = "Comparativa diaria",
  metrics = [
    { key: 'spend', name: 'Inversión', color: '#6366f1', yAxisId: 'left', prefix: '$' },
    { key: 'leads', name: 'Leads', color: '#10b981', yAxisId: 'right' }
  ]
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {metrics.map((metric, index) => (
              <linearGradient key={metric.key} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis 
            yAxisId="left" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickFormatter={(value) => metrics.find(m => m.yAxisId === 'left')?.prefix === '$' ? `$${value}` : value}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          {metrics.map((metric, index) => (
            <Area 
              key={metric.key}
              yAxisId={metric.yAxisId}
              type="monotone" 
              dataKey={metric.key} 
              name={metric.name} 
              stroke={metric.color} 
              fillOpacity={1} 
              fill={`url(#color${index})`} 
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};