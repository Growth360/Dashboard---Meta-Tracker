import React, { useState, useRef, useEffect } from 'react';
import { Campaign, AiAnalysisResult, DailyPerformance } from '../types';
import { createAdvisorChat } from '../services/geminiService';
import { Chat } from "@google/genai";
import { Sparkles, X, ChevronRight, Zap, Skull, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight, Minus, Eye, ChevronDown, ChevronUp, Send, MessageSquare } from 'lucide-react';

interface AiAdvisorProps {
  campaigns: Campaign[];
  dailyData?: DailyPerformance[];
  analysisResult: AiAnalysisResult | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ 
  campaigns, 
  dailyData, 
  analysisResult, 
  isAnalyzing, 
  onRunAnalysis 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRecIndex, setExpandedRecIndex] = useState<number | null>(null);
  
  // Chat State
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync Chat with Analysis Result
  useEffect(() => {
    if (analysisResult && !isAnalyzing) {
      // Create new chat session context when analysis updates
      const chat = createAdvisorChat(campaigns, dailyData);
      setChatSession(chat);
      setMessages([{ role: 'model', text: 'He actualizado el análisis con los datos recientes. ¿Qué deseas profundizar?' }]);
      
      // Auto-open if it was the first analysis
      if (!chatSession) {
         setIsOpen(true);
      }
    }
  }, [analysisResult, isAnalyzing]); // Dependencies explicitly allow update when result changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMessage });
      const text = response.text || "Lo siento, no pude procesar esa respuesta.";
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Ocurrió un error al conectar con el asistente." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleRecDetails = (index: number) => {
    if (expandedRecIndex === index) {
      setExpandedRecIndex(null);
    } else {
      setExpandedRecIndex(index);
    }
  };

  const getCampaignById = (id: string) => campaigns.find(c => c.id === id);

  // Floating Button (Collapsed State)
  if (!isOpen) {
    return (
      <button 
        id="ai-advisor-trigger"
        onClick={() => {
            setIsOpen(true);
            if (!analysisResult && !isAnalyzing) {
                onRunAnalysis();
            }
        }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 z-50 group"
      >
        <div className={`relative ${isAnalyzing ? 'animate-spin' : ''}`}>
           <Sparkles size={24} />
           {analysisResult && (
               <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
           )}
        </div>
        <span className="font-medium pr-2 group-hover:block hidden md:block">
            {isAnalyzing ? 'Analizando...' : 'Asistente IA'}
        </span>
      </button>
    );
  }

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionIcon = (type: string) => {
    switch(type) {
      case 'SCALE': return <TrendingUp size={18} className="text-emerald-500" />;
      case 'KILL': return <Skull size={18} className="text-red-500" />;
      case 'OPTIMIZE': return <Zap size={18} className="text-amber-500" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'POSITIVE': return <ArrowUpRight size={16} className="text-emerald-500" />;
      case 'NEGATIVE': return <ArrowDownRight size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-5 bg-indigo-600 text-white flex justify-between items-center shrink-0 shadow-md z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-300" />
          <div>
            <h2 className="text-lg font-bold leading-none">Meta Ads Advisor</h2>
            <p className="text-xs text-indigo-200 mt-1">Análisis de Desempeño & Q/A</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 p-1 rounded-full hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 p-8">
            <Loader2 size={48} className="animate-spin text-indigo-600" />
            <p className="text-lg font-medium text-slate-600">Analizando métricas...</p>
            <p className="text-sm text-center max-w-xs text-slate-500">Evaluando ROAS, CPL y tendencias de conversión para generar recomendaciones.</p>
          </div>
        ) : analysisResult ? (
          <div className="flex flex-col min-h-full">
            
            {/* Analysis Section */}
            <div className="p-6 space-y-6 pb-2">
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ActivityIcon /> Resumen
                </h3>
                <p className="text-slate-700 leading-relaxed text-sm">{analysisResult.summary}</p>
              </div>

              {/* Metric Highlights */}
              {analysisResult.metricHighlights && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ROAS</span>
                    <div className="font-semibold text-slate-800 text-sm mt-1">{analysisResult.metricHighlights.roas}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">CPL</span>
                    <div className="font-semibold text-slate-800 text-sm mt-1">{analysisResult.metricHighlights.cpl}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tendencia</span>
                    <div className="flex items-center gap-1 font-semibold text-slate-800 text-sm mt-1">
                      {getTrendIcon(analysisResult.metricHighlights.overallTrend)}
                      {analysisResult.metricHighlights.overallTrend}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" />
                        Recomendaciones
                    </h3>
                    <button 
                        onClick={onRunAnalysis} 
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        <Loader2 size={10} className={isAnalyzing ? "animate-spin" : "hidden"} /> Re-analizar
                    </button>
                </div>
                
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, idx) => {
                    const hasRelatedCampaigns = rec.relatedCampaignIds && rec.relatedCampaignIds.length > 0;
                    const isExpanded = expandedRecIndex === idx;

                    return (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-indigo-300 transition-colors group">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-indigo-50 transition-colors">
                                {getActionIcon(rec.actionType)}
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm leading-tight">{rec.title}</h4>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ml-2 ${getImpactColor(rec.impact)}`}>
                              {rec.impact}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs mb-3 pl-[34px] leading-relaxed">{rec.description}</p>
                          
                          <div className="pl-[34px] flex items-center justify-between">
                            <button className="text-indigo-600 text-xs font-bold flex items-center hover:underline">
                                Aplicar <ChevronRight size={12} className="ml-0.5" />
                            </button>
                            
                            {hasRelatedCampaigns && (
                              <button 
                                onClick={() => toggleRecDetails(idx)}
                                className="text-slate-500 text-[10px] font-medium flex items-center hover:text-indigo-600 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 transition-colors"
                              >
                                <Eye size={10} className="mr-1.5" />
                                {isExpanded ? 'Ocultar' : 'Ver datos'}
                                {isExpanded ? <ChevronUp size={10} className="ml-1" /> : <ChevronDown size={10} className="ml-1" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Detailed Campaign Metrics */}
                        {hasRelatedCampaigns && isExpanded && (
                          <div className="bg-slate-50 border-t border-slate-100 p-3 pl-[34px]">
                            <div className="space-y-2">
                              {rec.relatedCampaignIds!.map(id => {
                                const campaign = getCampaignById(id);
                                if (!campaign) return null;
                                return (
                                  <div key={id} className="bg-white border border-slate-200 rounded p-2 shadow-sm text-xs">
                                    <div className="font-semibold text-slate-800 mb-1 truncate">{campaign.name}</div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>ROAS: <strong className={campaign.roas > 2 ? "text-emerald-600" : ""}>{campaign.roas}x</strong></span>
                                        <span>CPL: <strong>${campaign.cpl}</strong></span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chat Section Separator */}
            <div className="flex items-center gap-4 py-4 px-6">
                 <div className="h-px bg-slate-300 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={12} />
                    Asistente Q&A
                 </span>
                 <div className="h-px bg-slate-300 flex-1"></div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 px-6 pb-4 space-y-4">
               {messages.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                        }`}
                       >
                           {msg.text}
                       </div>
                   </div>
               ))}
               {isChatLoading && (
                   <div className="flex justify-start">
                       <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                           <Loader2 size={16} className="animate-spin text-indigo-500" />
                       </div>
                   </div>
               )}
               <div ref={messagesEndRef} />
            </div>

          </div>
        ) : (
          <div className="text-center text-slate-500 mt-10 p-6 flex flex-col items-center">
            <Sparkles size={40} className="text-indigo-200 mb-4" />
            <p className="font-medium text-slate-800">No hay análisis activo</p>
            <p className="text-sm mt-2 mb-4">Ejecuta un análisis para ver el resumen y habilitar el chat.</p>
            <button 
                onClick={onRunAnalysis} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
            >
                Iniciar Análisis
            </button>
          </div>
        )}
      </div>

      {/* Footer / Input Area - Only visible when analysis is loaded */}
      {analysisResult && (
          <div className="p-4 bg-white border-t border-slate-200 z-20">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pregunta sobre tus métricas..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                    disabled={isChatLoading}
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isChatLoading}
                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
          </div>
      )}
    </div>
  );
};

const ActivityIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);