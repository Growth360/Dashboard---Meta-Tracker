import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Settings, Search, Menu, LogOut, DollarSign, MousePointer, Target, TrendingUp, FileText, Users, Calendar, Eye, Activity, PieChart, BarChart3, UploadCloud, ClipboardList, ArrowRight } from 'lucide-react';
import { INITIAL_CAMPAIGNS, HISTORICAL_DATA } from './constants';
import { Campaign, CampaignStatus, DailyPerformance, AiAnalysisResult } from './types';
import { StatCard } from './components/StatCard';
import { CampaignTable } from './components/CampaignTable';
import { DailyReportTable } from './components/DailyReportTable';
import { PerformanceChart } from './components/PerformanceChart';
import { AiAdvisor } from './components/AiAdvisor';
import { DataImporter } from './components/DataImporter';
import { SchedulingEntry } from './components/SchedulingEntry';
import { AiSummaryCard } from './components/AiSummaryCard';
import { analyzeCampaigns } from './services/geminiService';
import { fetchSheetData } from './services/dataService';

const TABS = [
  { id: 'general', label: '1) Rendimiento General' },
  { id: 'efficiency', label: '2) Eficiencia del Anuncio' },
  { id: 'creative', label: '3) Creatividad / Video' },
  { id: 'segmentation', label: '4) Segmentación y Alcance' },
  { id: 'trends', label: '5) Tendencias' },
];

const App: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [historicalData, setHistoricalData] = useState<DailyPerformance[]>(HISTORICAL_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'campaigns' | 'daily' | 'scheduling'>('campaigns');
  const [activeTab, setActiveTab] = useState('general');
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<Date | undefined>(undefined);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Fetch Data on Load
  useEffect(() => {
    const loadSheetData = async () => {
      try {
        const data = await fetchSheetData();
        if (data && data.length > 0) {
          setHistoricalData(data);
          // Optional: Update campaign simulated revenue based on fresh data if needed, 
          // or just leave historical data as the single source of truth for the dashboard charts.
        }
      } catch (error) {
        console.error("Error cargando datos de Google Sheets:", error);
      }
    };
    loadSheetData();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return historicalData.filter(item => {
      // Basic string date comparison 'YYYY-MM-DD' works correctly for ISO dates
      const itemDate = item.date; 

      const date = new Date(item.date);
      // Fallback for invalid date parsing if needed, though simple string compare is usually safer for pure dates
      if (isNaN(date.getTime())) return true;

      const day = date.getDate();
      const month = date.getMonth(); // 0-indexed, 11 is Dec
      const year = date.getFullYear();

      switch (dateFilter) {
        case 'ALL': 
          return true;
        case 'CUSTOM':
          if (customStartDate && itemDate < customStartDate) return false;
          if (customEndDate && itemDate > customEndDate) return false;
          return true;
        case 'DEC_2025':
          return year === 2025 && month === 11;
        case 'NOV_2025':
          return year === 2025 && month === 10;
        case 'W1_DEC':
          return year === 2025 && month === 11 && day >= 1 && day <= 7;
        case 'W2_DEC':
          return year === 2025 && month === 11 && day >= 8 && day <= 14;
        case 'W3_DEC':
          return year === 2025 && month === 11 && day >= 15 && day <= 21;
        default:
          return true;
      }
    });
  }, [dateFilter, historicalData, customStartDate, customEndDate]);

  // Derived Metrics from Filtered Data
  const totalSpend = useMemo(() => filteredData.reduce((acc, d) => acc + d.spend, 0), [filteredData]);
  const totalLeads = useMemo(() => filteredData.reduce((acc, d) => acc + d.leads, 0), [filteredData]);
  const totalVisits = useMemo(() => filteredData.reduce((acc, d) => acc + d.visits, 0), [filteredData]);
  const totalRevenue = useMemo(() => filteredData.reduce((acc, d) => acc + (d.revenue || 0), 0), [filteredData]);
  const totalImpressions = useMemo(() => filteredData.reduce((acc, d) => acc + d.impressions, 0), [filteredData]);
  const totalReach = useMemo(() => filteredData.reduce((acc, d) => acc + d.reach, 0), [filteredData]);
  const totalClicks = useMemo(() => filteredData.reduce((acc, d) => acc + d.clicks, 0), [filteredData]);
  
  const overallCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const lpConversionRate = totalVisits > 0 ? (totalLeads / totalVisits) * 100 : 0;
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  
  // Efficiency Metrics
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;

  // Handlers
  const handleToggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === CampaignStatus.PAUSED ? CampaignStatus.ACTIVE : CampaignStatus.PAUSED
        };
      }
      return c;
    }));
  };

  const handleUpdateBudget = (id: string, newBudget: number) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, budget: newBudget };
      }
      return c;
    }));
  };

  const handleImportData = (newData: DailyPerformance[]) => {
    setHistoricalData(newData);
    // Reset filter to ALL to ensure user sees the new data
    setDateFilter('ALL');
  };

  const handleSaveScheduling = (date: string, manualData: Partial<DailyPerformance>) => {
    setHistoricalData(prevData => {
      const existingIndex = prevData.findIndex(d => d.date === date);
      let newData = [...prevData];
      let currentEntry: DailyPerformance;

      // 1. Merge existing Meta data with new Manual data
      if (existingIndex >= 0) {
        currentEntry = { ...newData[existingIndex], ...manualData };
      } else {
        // Initialize with default 0s if it's a new day
        currentEntry = {
          date: date,
          spend: 0, impressions: 0, reach: 0, cpm: 0, clicks: 0, ctr: 0, cpc: 0,
          visits: 0, lpcRate: 0, leads: 0, lpRate: 0, cpl: 0, revenue: 0,
          ...manualData
        } as DailyPerformance;
      }

      // --- ADVANCED FORMULA ENGINE (REPLICATING EXCEL) ---
      const spend = currentEntry.spend || 0;
      const leads = currentEntry.leads || 0;
      const visits = currentEntry.visits || 0;
      
      // Agendas
      const agendasTotal = (currentEntry.agendasAut || 0) + (currentEntry.agendasSet || 0);
      currentEntry.agendasTotal = agendasTotal;

      // Qualify
      // If agCualificado is not entered, assume 0.
      const agCualificado = currentEntry.agCualificado || 0;
      currentEntry.cplCualificado = agCualificado > 0 ? spend / agCualificado : 0; // Col S: CPL_Cualificado

      // Assistance
      const asistencias = currentEntry.asistencias || 0;
      currentEntry.asisRate = agendasTotal > 0 ? (asistencias / agendasTotal) * 100 : 0; // Col Y: Asis %
      currentEntry.asisCash = asistencias > 0 ? spend / asistencias : 0; // Col Z: ASIS-$

      // Closings & Sales
      const cierres = currentEntry.cierres || 0;
      const ventas = currentEntry.ventas || 0;
      currentEntry.ccRate = asistencias > 0 ? (cierres / asistencias) * 100 : 0; // Col AB: CC%
      currentEntry.lcRate = leads > 0 ? (cierres / leads) * 100 : 0; // Col AC: LC%
      currentEntry.cpa = ventas > 0 ? spend / ventas : 0; // Col AF: CPA

      // Financials
      // Sync Facturado/Revenue
      const revenue = currentEntry.facturado || currentEntry.revenue || 0;
      currentEntry.revenue = revenue;
      currentEntry.facturado = revenue;

      const beneficio = revenue - spend;
      currentEntry.beneficio = beneficio; // Col AG: Beneficio
      currentEntry.bfacturado = beneficio; // Col AH: Bfacturado (appears identical in sheet)

      // ROI / ROAS
      // Col AI "ROI" in sheet is actually ROAS (Revenue / Spend) based on values (e.g. 127.44)
      currentEntry.roas = spend > 0 ? revenue / spend : 0; // Col AI: ROI (Sheet Name) -> ROAS (Concept)
      
      // Col AJ "R-ROI" in sheet is Real ROI ((Revenue - Spend) / Spend)
      // Represented as percentage (e.g. 12643% or -100%)
      currentEntry.roi = spend > 0 ? (beneficio / spend) * 100 : 0; // Col AJ: R-ROI
      
      // Col AK "C-ROI" - Coefficient? Leaving as simple ratio for now
      currentEntry.cRoi = spend > 0 ? (beneficio / spend) : 0;

      // Update Array
      if (existingIndex >= 0) {
        newData[existingIndex] = currentEntry;
      } else {
        newData.push(currentEntry);
        newData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      return newData;
    });

    alert("Datos guardados. Todas las fórmulas (ROI, CPA, ASIS-$) han sido recalculadas.");
    setViewMode('daily');
  };

  const handleRunAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      // Analyze ONLY the currently filtered data to be relevant to what the user sees
      const result = await analyzeCampaigns(campaigns, filteredData);
      setAiAnalysis(result);
      setAnalysisTimestamp(new Date());
    } catch (e) {
      console.error("Error running analysis", e);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <AiSummaryCard 
              summary={aiAnalysis?.summary}
              isLoading={isAiAnalyzing}
              onAnalyze={handleRunAnalysis}
              lastUpdated={analysisTimestamp}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              <StatCard title="ROAS" value={`${overallRoas.toFixed(2)}x`} trend={dateFilter === 'ALL' ? 2.4 : undefined} icon={<DollarSign size={20} />} />
              <StatCard title="Inversión" value={`$${totalSpend.toLocaleString()}`} trend={dateFilter === 'ALL' ? 5.2 : undefined} icon={<DollarSign size={20} />} />
              <StatCard title="Leads Totales" value={totalLeads.toString()} trend={dateFilter === 'ALL' ? 12.4 : undefined} icon={<Users size={20} />} />
              <StatCard title="Costo por Lead" value={`$${overallCpl.toFixed(0)}`} trend={dateFilter === 'ALL' ? -8.1 : undefined} inverseTrend icon={<Target size={20} />} />
              <StatCard title="Tasa Conv. LP" value={`${lpConversionRate.toFixed(2)}%`} trend={dateFilter === 'ALL' ? 1.2 : undefined} icon={<MousePointer size={20} />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <PerformanceChart data={filteredData} />
              </div>
              <div className="bg-indigo-900 rounded-xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Estado de Leads</h3>
                  <p className="text-indigo-200 text-sm mb-6">Visualizando {filteredData.length} días de datos. Optimiza tu CPL analizando los picos de costos semanales.</p>
                  <button onClick={() => setViewMode('daily')} className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors w-max">Ver Tabla Detallada</button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-700 rounded-full opacity-50 blur-2xl"></div>
              </div>
            </div>
            <div className="mb-8">
              {viewMode === 'campaigns' ? (
                 <CampaignTable campaigns={campaigns} onToggleStatus={handleToggleStatus} onUpdateBudget={handleUpdateBudget} />
              ) : viewMode === 'scheduling' ? (
                 <SchedulingEntry onSave={handleSaveScheduling} existingData={historicalData} />
              ) : (
                 <DailyReportTable data={filteredData} />
              )}
            </div>
          </>
        );
      
      case 'efficiency':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="CTR Promedio" value={`${avgCtr.toFixed(2)}%`} icon={<MousePointer size={20} />} trend={1.5} />
              <StatCard title="CPC Promedio" value={`$${avgCpc.toFixed(2)}`} icon={<DollarSign size={20} />} trend={-2.3} inverseTrend />
              <StatCard title="CPM Promedio" value={`$${avgCpm.toFixed(2)}`} icon={<Activity size={20} />} trend={0.5} inverseTrend />
              <StatCard title="Ratio Click-to-Lead" value={`${(totalLeads > 0 ? (totalLeads / totalClicks * 100) : 0).toFixed(2)}%`} icon={<Target size={20} />} trend={3.1} />
            </div>
            <div className="grid grid-cols-1 gap-8 mb-8">
               <PerformanceChart 
                data={filteredData} 
                title="Eficiencia: CTR vs CPC" 
                subtitle="Relación entre calidad del anuncio y costo del click"
                metrics={[
                  { key: 'ctr', name: 'CTR (%)', color: '#8b5cf6', yAxisId: 'left', suffix: '%' },
                  { key: 'cpc', name: 'CPC ($)', color: '#f59e0b', yAxisId: 'right', prefix: '$' }
                ]}
              />
            </div>
          </>
        );

      case 'creative':
        return (
          <>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Impresiones Totales" value={totalImpressions.toLocaleString()} icon={<Eye size={20} />} />
              <StatCard title="Clicks Totales" value={totalClicks.toLocaleString()} icon={<MousePointer size={20} />} />
              <StatCard title="Visitas a Página" value={totalVisits.toLocaleString()} icon={<Activity size={20} />} />
            </div>
            <div className="grid grid-cols-1 gap-8 mb-8">
               <PerformanceChart 
                data={filteredData} 
                title="Engagement Creativo" 
                subtitle="Impresiones vs Clicks"
                metrics={[
                  { key: 'impressions', name: 'Impresiones', color: '#ec4899', yAxisId: 'left' },
                  { key: 'clicks', name: 'Clicks', color: '#6366f1', yAxisId: 'right' }
                ]}
              />
            </div>
          </>
        );

      case 'segmentation':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Alcance Total" value={totalReach.toLocaleString()} icon={<Users size={20} />} />
              <StatCard title="Frecuencia" value={avgFrequency.toFixed(2)} icon={<Activity size={20} />} />
              <StatCard title="CPM" value={`$${avgCpm.toFixed(2)}`} icon={<DollarSign size={20} />} />
            </div>
            <div className="grid grid-cols-1 gap-8 mb-8">
               <PerformanceChart 
                data={filteredData} 
                title="Alcance vs Frecuencia" 
                subtitle="Cómo la saturación de audiencia afecta los costos"
                metrics={[
                  { key: 'reach', name: 'Alcance', color: '#06b6d4', yAxisId: 'left' },
                  { key: 'cpm', name: 'CPM ($)', color: '#ef4444', yAxisId: 'right', prefix: '$' }
                ]}
              />
            </div>
          </>
        );

      case 'trends':
        return (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatCard title="ROAS Acumulado" value={`${overallRoas.toFixed(2)}x`} icon={<TrendingUp size={20} />} />
              <StatCard title="CPL Acumulado" value={`$${overallCpl.toFixed(0)}`} icon={<Target size={20} />} />
            </div>
            <div className="grid grid-cols-1 gap-8 mb-8">
               <PerformanceChart 
                data={filteredData} 
                title="Tendencia de Rentabilidad" 
                subtitle="ROAS vs Costo por Lead a lo largo del tiempo"
                metrics={[
                  { key: 'roas', name: 'ROAS', color: '#10b981', yAxisId: 'left' },
                  { key: 'cpl', name: 'CPL ($)', color: '#6366f1', yAxisId: 'right', prefix: '$' }
                ]}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 rounded-lg p-2 text-white">
            <LayoutDashboard size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">AdsManager</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setViewMode('campaigns')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${viewMode === 'campaigns' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button onClick={() => setViewMode('scheduling')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${viewMode === 'scheduling' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ClipboardList size={20} />
            Agendamiento
          </button>
          <button onClick={() => setViewMode('daily')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${viewMode === 'daily' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <FileText size={20} />
            Reporte Diario
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <Settings size={20} />
            Configuración
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
            <LogOut size={18} />
            Cerrar Sesión
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
                {viewMode === 'campaigns' ? 'Visión General' : viewMode === 'scheduling' ? 'Carga Manual' : 'Reporte Diario'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsImporterOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
              >
                <UploadCloud size={18} />
                Importar Datos
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 transition-all shadow-sm"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 flex-1 overflow-x-hidden">
          
          {/* Top Date Range Filter - Only show in Dashboard */}
          {viewMode === 'campaigns' && (
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
              <div>
                 <h2 className="text-2xl font-bold text-slate-800">Rendimiento</h2>
                 <p className="text-slate-500 text-sm">Analiza el desempeño de tus campañas por periodo.</p>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                   {/* Mobile Import Button */}
                   <button 
                      onClick={() => setIsImporterOpen(true)}
                      className="sm:hidden flex items-center justify-center p-2 bg-indigo-50 text-indigo-700 rounded-lg"
                    >
                      <UploadCloud size={20} />
                    </button>
  
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm h-10">
                    <div className="px-3 text-slate-500 border-r border-slate-200">
                      <Calendar size={18} />
                    </div>
                    <select 
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-transparent text-slate-700 text-sm font-medium focus:ring-0 border-none outline-none pl-3 pr-8 py-1.5 cursor-pointer"
                    >
                      <option value="ALL">Todo el Histórico</option>
                      <option value="CUSTOM">Rango Personalizado</option>
                      <optgroup label="Mensual">
                        <option value="DEC_2025">Diciembre 2025</option>
                        <option value="NOV_2025">Noviembre 2025</option>
                      </optgroup>
                      <optgroup label="Semanal (Dic 2025)">
                        <option value="W1_DEC">Semana 1 (1-7)</option>
                        <option value="W2_DEC">Semana 2 (8-14)</option>
                        <option value="W3_DEC">Semana 3 (15-21)</option>
                      </optgroup>
                    </select>
                  </div>

                  {dateFilter === 'CUSTOM' && (
                    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1 shadow-sm h-10 animate-in fade-in zoom-in-95 duration-200">
                      <input 
                        type="date" 
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="border-none outline-none text-sm text-slate-700 font-medium px-2 py-1 bg-transparent [color-scheme:light] cursor-pointer"
                      />
                      <ArrowRight size={14} className="text-slate-400" />
                      <input 
                        type="date" 
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="border-none outline-none text-sm text-slate-700 font-medium px-2 py-1 bg-transparent [color-scheme:light] cursor-pointer"
                      />
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Navigation Tabs - Only in Dashboard */}
          {viewMode === 'campaigns' && (
            <div className="flex overflow-x-auto border-b border-slate-200 mb-8 scrollbar-hide">
               {TABS.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                     activeTab === tab.id 
                      ? 'border-indigo-600 text-indigo-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                   }`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="animate-in fade-in duration-300">
             {viewMode === 'scheduling' ? (
                <SchedulingEntry onSave={handleSaveScheduling} existingData={historicalData} />
             ) : viewMode === 'daily' ? (
                <DailyReportTable data={filteredData} />
             ) : (
                renderTabContent()
             )}
          </div>

        </main>
      </div>

      {/* Components */}
      <AiAdvisor 
        campaigns={campaigns} 
        dailyData={filteredData} 
        analysisResult={aiAnalysis}
        isAnalyzing={isAiAnalyzing}
        onRunAnalysis={handleRunAnalysis}
      />
      <DataImporter isOpen={isImporterOpen} onClose={() => setIsImporterOpen(false)} onImport={handleImportData} />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white z-40 p-4 md:hidden shadow-xl transition-transform">
           <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-blue-600 rounded-lg p-2 text-white">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">AdsManager</span>
          </div>
          <nav className="space-y-2">
            <button onClick={() => {setViewMode('campaigns'); setIsSidebarOpen(false)}} className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium">Dashboard</button>
            <button onClick={() => {setViewMode('scheduling'); setIsSidebarOpen(false)}} className="w-full text-left px-4 py-3 text-slate-600">Agendamiento</button>
            <button onClick={() => {setViewMode('daily'); setIsSidebarOpen(false)}} className="w-full text-left px-4 py-3 text-slate-600">Reporte Diario</button>
          </nav>
        </aside>
      )}

    </div>
  );
};

export default App;