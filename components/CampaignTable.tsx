import React, { useState, useEffect } from 'react';
import { Campaign, CampaignStatus } from '../types';
import { Play, Pause } from 'lucide-react';

interface CampaignTableProps {
  campaigns: Campaign[];
  onToggleStatus: (id: string) => void;
  onUpdateBudget: (id: string, newBudget: number) => void;
}

const BudgetInput: React.FC<{ value: number; onSave: (val: number) => void }> = ({ value, onSave }) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue) && numValue !== value) {
      onSave(numValue);
    } else {
        // Reset if invalid
        if (isNaN(numValue)) setLocalValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative flex items-center">
      <span className="absolute left-2.5 text-slate-400 text-sm pointer-events-none">$</span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-28 pl-5 pr-2 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg outline-none transition-all font-semibold text-slate-700 placeholder-slate-400"
      />
    </div>
  );
};

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, onToggleStatus, onUpdateBudget }) => {
  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.ACTIVE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Activa</span>;
      case CampaignStatus.PAUSED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Pausada</span>;
      case CampaignStatus.LEARNING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Aprendizaje</span>;
      case CampaignStatus.ERROR:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Campañas Activas</h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Ver todas</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Presupuesto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Inversión</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">CTR</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Visitas</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Leads</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">CPL</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button 
                      onClick={() => onToggleStatus(campaign.id)}
                      className={`mr-3 p-1 rounded-full transition-colors ${
                        campaign.status === CampaignStatus.PAUSED 
                          ? 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50' 
                          : 'text-emerald-500 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {campaign.status === CampaignStatus.PAUSED ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    {getStatusBadge(campaign.status)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{campaign.name}</div>
                  <div className="text-xs text-slate-500">ID: {campaign.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BudgetInput 
                    value={campaign.budget} 
                    onSave={(newVal) => onUpdateBudget(campaign.id, newVal)} 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900">
                  ${campaign.spend.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div className="text-sm text-slate-900">{campaign.ctr}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900">
                  {campaign.visits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    {campaign.leads}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                  ${campaign.cpl > 0 ? campaign.cpl.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">Detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};