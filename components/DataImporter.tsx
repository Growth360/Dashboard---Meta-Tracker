import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Database } from 'lucide-react';
import { DailyPerformance } from '../types';

interface DataImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: DailyPerformance[]) => void;
}

export const DataImporter: React.FC<DataImporterProps> = ({ isOpen, onClose, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [previewData, setPreviewData] = useState<DailyPerformance[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseValue = (val: string) => {
    // Remove currency symbols, commas in numbers (1.000,00 or 1,000.00), percentages, and trim
    if (!val) return 0;
    
    // Clean string: remove $, %, spaces
    let clean = val.replace(/[%\$ ]/g, '').trim();
    
    // Handle European format (1.000,00) vs US format (1,000.00)
    // Simple heuristic: if comma is after dot or only comma exists as separator near end
    if (clean.includes(',') && !clean.includes('.')) {
       // e.g. "1200,50" -> "1200.50"
       clean = clean.replace(',', '.');
    } else if (clean.includes('.') && clean.includes(',')) {
       // e.g. "1.200,50" -> remove dot, replace comma with dot -> "1200.50"
       // or "1,200.50" -> remove comma -> "1200.50"
       if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
          // European: 1.200,50
          clean = clean.replace(/\./g, '').replace(',', '.');
       } else {
          // US: 1,200.50
          clean = clean.replace(/,/g, '');
       }
    }

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const processData = () => {
    try {
      setError(null);
      const rows = inputText.trim().split('\n').map(row => row.split(/\t|,/)); // Split by tab (excel) or comma (csv)
      
      if (rows.length < 2) {
        throw new Error("No se detectaron suficientes filas de datos.");
      }

      const headers = rows[0].map(h => h.toLowerCase().trim().replace(/[\s_.-]/g, ''));
      
      // Helper to find index of column by loose matching keywords
      const findIdx = (keywords: string[]) => {
          const simpleKeywords = keywords.map(k => k.replace(/[\s_.-]/g, ''));
          return headers.findIndex(h => simpleKeywords.some(k => h.includes(k)));
      };

      // Comprehensive Mapping based on User Sheet
      const map = {
        date: findIdx(['date', 'fecha', 'dia']),
        spend: findIdx(['spend', 'inversion', 'gasto', 'importe']),
        impressions: findIdx(['impressions', 'impresiones']),
        reach: findIdx(['reach', 'alcance']),
        cpm: findIdx(['cpm']),
        clicks: findIdx(['clicks', 'clics']),
        ctr: findIdx(['ctr']),
        cpc: findIdx(['cpc']),
        visits: findIdx(['visits', 'visitas']),
        lpcRate: findIdx(['lpc', 'linkclick']),
        leads: findIdx(['leads', 'clientes', 'potenciales']),
        lpRate: findIdx(['lp%', 'lprate']),
        cpl: findIdx(['cpl']),
        
        // CRM / Agendas
        agendasAut: findIdx(['agendasaut', 'aut']),
        agendasSet: findIdx(['agendasset', 'set']),
        agendasTotal: findIdx(['agendastotal', 'totalagendas']),
        agCualificado: findIdx(['agcualificado', 'agcualificado', 'cualificados']),
        cplCualificado: findIdx(['cplcualificado']),
        vcrRate: findIdx(['vcr%']),
        vcrCash: findIdx(['vcr$']),

        // Calls / Assistance
        llamadas: findIdx(['llamadas']),
        asistencias: findIdx(['asistencias']),
        cancelaciones: findIdx(['cancelaciones']),
        asisRate: findIdx(['asis%', 'asistencia%']),
        asisCash: findIdx(['asis$']),

        // Closing / Sales
        cierres: findIdx(['cierres']),
        ccRate: findIdx(['cc%', 'closing']),
        lcRate: findIdx(['lc%']),
        ventas: findIdx(['ventas']),
        facturado: findIdx(['facturado', 'revenue', 'ingresos']), // Revenue
        
        // Financials
        cpa: findIdx(['cpa']),
        beneficio: findIdx(['beneficio', 'profit']),
        bfacturado: findIdx(['bfacturado']),
        
        // ROI
        roi: findIdx(['roi']),
        rRoi: findIdx(['rroi']),
        cRoi: findIdx(['croi']),
      };

      if (map.date === -1 || map.spend === -1) {
        throw new Error("No se encontraron columnas obligatorias (Fecha, Inversión).");
      }

      const parsed: DailyPerformance[] = rows.slice(1).map((row, i) => {
        // Skip empty rows
        if (row.length <= 1) return null;

        const getVal = (idx: number) => idx > -1 && row[idx] ? parseValue(row[idx]) : 0;

        const spend = getVal(map.spend);
        const revenue = getVal(map.facturado);
        
        // Date parsing
        let dateStr = row[map.date];
        // Heuristic for DD/MM/YYYY
        if (dateStr && dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // assume DD/MM/YYYY -> YYYY-MM-DD
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }

        return {
          date: dateStr,
          spend,
          impressions: getVal(map.impressions),
          reach: getVal(map.reach),
          cpm: getVal(map.cpm),
          clicks: getVal(map.clicks),
          ctr: getVal(map.ctr),
          cpc: getVal(map.cpc),
          visits: getVal(map.visits),
          lpcRate: getVal(map.lpcRate),
          leads: getVal(map.leads),
          lpRate: getVal(map.lpRate),
          cpl: getVal(map.cpl),
          
          agendasAut: getVal(map.agendasAut),
          agendasSet: getVal(map.agendasSet),
          agendasTotal: getVal(map.agendasTotal),
          agCualificado: getVal(map.agCualificado),
          cplCualificado: getVal(map.cplCualificado),
          vcrRate: getVal(map.vcrRate),
          vcrCash: getVal(map.vcrCash),
          
          llamadas: getVal(map.llamadas),
          asistencias: getVal(map.asistencias),
          cancelaciones: getVal(map.cancelaciones),
          asisRate: getVal(map.asisRate),
          asisCash: getVal(map.asisCash),
          
          cierres: getVal(map.cierres),
          ccRate: getVal(map.ccRate),
          lcRate: getVal(map.lcRate),
          ventas: getVal(map.ventas),
          facturado: revenue, // Sync
          revenue: revenue,   // Sync
          
          cpa: getVal(map.cpa),
          beneficio: getVal(map.beneficio),
          bfacturado: getVal(map.bfacturado),
          
          roi: getVal(map.roi),
          rRoi: getVal(map.rRoi),
          cRoi: getVal(map.cRoi),
          
          // Calculated fallback if missing
          roas: spend > 0 ? revenue / spend : 0
        };
      }).filter(Boolean) as DailyPerformance[];

      if (parsed.length === 0) throw new Error("No se pudieron procesar filas válidas.");
      
      setPreviewData(parsed);

    } catch (e: any) {
      setError(e.message || "Error al procesar los datos.");
    }
  };

  const handleImport = () => {
    onImport(previewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Importar Datos Completos</h3>
              <p className="text-sm text-slate-500">Soporta métricas de Meta, Agendas, Cierres y Facturación.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!previewData.length ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                 <AlertCircle size={20} className="shrink-0" />
                 <div>
                    <p className="font-bold mb-1">Instrucciones:</p>
                    <p>Copia TODA la tabla desde tu hoja de cálculo (incluyendo los encabezados como "Inversión", "Agendas AUT", "Facturado", etc.) y pégala abajo.</p>
                    <p className="mt-1 opacity-80">El sistema mapeará automáticamente las columnas a las métricas correspondientes.</p>
                 </div>
              </div>
              <textarea
                className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs whitespace-pre"
                placeholder={`Fecha\tInversión\tImpresiones\tLeads\tAgendas AUT\tFacturado\n01/12/2025\t$34.697\t2.000\t0\t1\t$0\n...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                onClick={processData}
                disabled={!inputText}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
              >
                <FileText size={18} /> Procesar Datos
              </button>
              {error && (
                <div className="text-red-600 text-sm font-medium flex items-center gap-2 bg-red-50 p-3 rounded">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700">Vista Previa ({previewData.length} filas)</h4>
                  <button onClick={() => setPreviewData([])} className="text-sm text-slate-500 hover:text-red-500 underline">Limpiar</button>
               </div>
               <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto overflow-x-auto">
                 <table className="divide-y divide-slate-200 text-xs whitespace-nowrap">
                   <thead className="bg-slate-50 sticky top-0 z-10">
                     <tr>
                       <th className="px-3 py-2 text-left bg-slate-50 sticky left-0 z-20 border-r">Fecha</th>
                       <th className="px-3 py-2 text-right">Inversión</th>
                       <th className="px-3 py-2 text-right">Leads</th>
                       <th className="px-3 py-2 text-right text-indigo-600">Ag. Total</th>
                       <th className="px-3 py-2 text-right">Cierres</th>
                       <th className="px-3 py-2 text-right text-emerald-600">Facturado</th>
                       <th className="px-3 py-2 text-right">ROI</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-slate-200">
                     {previewData.slice(0, 50).map((row, i) => (
                       <tr key={i}>
                         <td className="px-3 py-2 sticky left-0 bg-white border-r font-medium">{row.date}</td>
                         <td className="px-3 py-2 text-right">${row.spend.toLocaleString()}</td>
                         <td className="px-3 py-2 text-right">{row.leads}</td>
                         <td className="px-3 py-2 text-right font-medium text-indigo-600">{row.agendasTotal}</td>
                         <td className="px-3 py-2 text-right">{row.cierres}</td>
                         <td className="px-3 py-2 text-right font-medium text-emerald-600">${row.revenue.toLocaleString()}</td>
                         <td className="px-3 py-2 text-right">{row.roi?.toFixed(2)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleImport}
            disabled={previewData.length === 0}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Check size={18} /> Confirmar Importación
          </button>
        </div>
      </div>
    </div>
  );
};