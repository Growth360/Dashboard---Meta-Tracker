import React from 'react';
import { DailyPerformance } from '../types';

interface DailyReportTableProps {
  data: DailyPerformance[];
}

export const DailyReportTable: React.FC<DailyReportTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
        <h3 className="text-lg font-bold text-slate-900">Reporte de Rendimiento Completo</h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Exportar CSV</button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              {/* Fixed Column */}
              <th className="px-3 py-3 text-left font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Fecha</th>
              
              {/* Meta Metrics */}
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Inversión</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Impresiones</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Alcance</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">CPM</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">Clicks</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">CTR</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">CPC</th>
              
              {/* Lead Gen */}
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-indigo-50/50">Visitas</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-indigo-50/50">%LPC</th>
              <th className="px-3 py-3 text-right font-bold text-indigo-700 uppercase tracking-wider whitespace-nowrap bg-indigo-50/50">Leads</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-indigo-50/50">LP%</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-indigo-50/50">CPL</th>
              
              {/* Agendas / Qualify */}
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-purple-50/50">Agendas AUT</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-purple-50/50">Agendas SET</th>
              <th className="px-3 py-3 text-right font-bold text-purple-700 uppercase tracking-wider whitespace-nowrap bg-purple-50/50">Agendas TOTAL</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-purple-50/50">Agenda Cualificados</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-purple-50/50">AG_Cualificado</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-purple-50/50">CPL_Cualificado</th>
              
              {/* Sales / Finance */}
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Llamadas</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Asistencias</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Cancelaciones</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Asis %</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">ASIS-$</th>
              <th className="px-3 py-3 text-right font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Cierres</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">CC%</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">LC%</th>
              <th className="px-3 py-3 text-right font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Ventas</th>
              <th className="px-3 py-3 text-right font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Facturado</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">CPA</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Beneficio</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-emerald-50/50">Bfacturado</th>
              <th className="px-3 py-3 text-right font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap bg-amber-50/50">ROI</th>
              <th className="px-3 py-3 text-right font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap bg-amber-50/50">R-ROI</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-900 sticky left-0 bg-white border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {row.date}
                </td>
                
                {/* Meta */}
                <td className="px-3 py-2 text-right text-slate-600">${row.spend.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-500">{row.impressions.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-500">{row.reach.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-500">${row.cpm.toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-slate-500">{row.clicks}</td>
                <td className="px-3 py-2 text-right text-slate-500">{row.ctr}%</td>
                <td className="px-3 py-2 text-right text-slate-500">${row.cpc.toFixed(2)}</td>

                {/* Lead Gen */}
                <td className="px-3 py-2 text-right text-slate-600 bg-indigo-50/10">{row.visits}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-indigo-50/10">{row.lpcRate}%</td>
                <td className="px-3 py-2 text-right font-bold text-indigo-600 bg-indigo-50/10">{row.leads}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-indigo-50/10">{row.lpRate}%</td>
                <td className="px-3 py-2 text-right font-medium text-slate-700 bg-indigo-50/10">${row.cpl.toFixed(0)}</td>

                {/* Agendas */}
                <td className="px-3 py-2 text-right text-slate-500 bg-purple-50/10">{row.agendasAut || 0}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-purple-50/10">{row.agendasSet || 0}</td>
                <td className="px-3 py-2 text-right font-bold text-purple-600 bg-purple-50/10">{row.agendasTotal || 0}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-purple-50/10">{row.agCualificado || 0}</td>
                {/* AG_Cualificado (Col S) seems to be Cost per Qualified Agenda in visual, but column R is Agenda Cualificados. Let's show Cost if available or just raw? 
                    In screenshot: Col R is "Agenda Cualificados" (Count), Col S is "AG_Cualificado" (Money). 
                    Let's assume S is money.
                */}
                <td className="px-3 py-2 text-right text-slate-500 bg-purple-50/10">${((row.spend / (row.agCualificado || 1)) || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-purple-50/10">${row.cplCualificado?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}</td>

                {/* Sales */}
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">{row.llamadas || 0}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">{row.asistencias || 0}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">{row.cancelaciones || 0}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">{row.asisRate?.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">${row.asisCash?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-600 bg-emerald-50/10">{row.cierres || 0}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">{row.ccRate?.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">{row.lcRate?.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-emerald-700 bg-emerald-50/10">{row.ventas || 0}</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-700 bg-emerald-50/10">${(row.revenue || row.facturado || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-500 bg-emerald-50/10">${row.cpa?.toLocaleString() || '-'}</td>
                <td className={`px-3 py-2 text-right font-medium bg-emerald-50/10 ${(row.beneficio || 0) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>${(row.beneficio || 0).toLocaleString()}</td>
                <td className={`px-3 py-2 text-right font-medium bg-emerald-50/10 ${(row.bfacturado || 0) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>${(row.bfacturado || 0).toLocaleString()}</td>
                
                <td className="px-3 py-2 text-right font-bold text-amber-600 bg-amber-50/10">{row.roas?.toFixed(2) || '-'}</td>
                <td className="px-3 py-2 text-right font-bold text-amber-600 bg-amber-50/10">{row.roi?.toFixed(0) || '-'}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};