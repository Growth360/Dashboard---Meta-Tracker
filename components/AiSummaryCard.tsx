import React from 'react';
import { Sparkles, RefreshCw, ChevronRight, Zap } from 'lucide-react';

interface AiSummaryCardProps {
  summary: string | undefined;
  isLoading: boolean;
  onAnalyze: () => void;
  lastUpdated?: Date;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ summary, isLoading, onAnalyze, lastUpdated }) => {
  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden mb-8 relative group">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

      <div className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shadow-sm border border-indigo-200">
              {isLoading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Resumen Ejecutivo IA
                {summary && !isLoading && (
                   <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                     Actualizado
                   </span>
                )}
              </h3>
              <p className="text-sm text-slate-500">
                {lastUpdated 
                  ? `Último análisis: ${lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                  : "Analiza tus métricas actuales para detectar oportunidades."}
              </p>
            </div>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'
              }
            `}
          >
            {isLoading ? 'Analizando...' : (
              <>
                <Zap size={16} className={summary ? "" : "fill-current"} />
                {summary ? 'Actualizar Análisis' : 'Generar Análisis'}
              </>
            )}
          </button>
        </div>

        <div className="pl-0 sm:pl-[52px]">
          {isLoading ? (
            <div className="space-y-2 max-w-3xl animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
          ) : summary ? (
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
              <p>{summary}</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-600 cursor-pointer hover:underline" onClick={() => document.getElementById('ai-advisor-trigger')?.click()}>
                Ver recomendaciones detalladas y chat <ChevronRight size={12} />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg border border-slate-200 border-dashed p-4 text-center sm:text-left">
              <p className="text-sm text-slate-500">
                No hay análisis activo para el periodo seleccionado. Haz clic en "Generar Análisis" para que la IA evalúe tu ROAS, CPL y embudo de ventas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
