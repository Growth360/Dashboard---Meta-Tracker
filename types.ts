
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  LEARNING = 'LEARNING',
  ERROR = 'ERROR'
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  visits: number;
  leads: number;
  cpl: number;
  roas: number;
  revenue: number;
}

export interface DailyPerformance {
  date: string;
  // Meta Metrics
  spend: number; // Inversión
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
  cpc: number;
  
  // Funnel - Web
  visits: number;
  lpcRate: number; // %LPC
  leads: number;
  lpRate: number; // LP%
  cpl: number;

  // Funnel - CRM / Agendas
  agendasAut?: number;
  agendasSet?: number;
  agendasTotal?: number;
  agCualificado?: number; // AG_Cualificado
  cplCualificado?: number; // CPL_Cualificado
  vcrRate?: number; // VCR-%
  vcrCash?: number; // VCR-$
  
  // Funnel - Calls / Assistance
  llamadas?: number;
  asistencias?: number;
  cancelaciones?: number;
  asisRate?: number; // Asis %
  asisCash?: number; // ASIS-$
  
  // Funnel - Sales
  cierres?: number;
  ccRate?: number; // CC% (Cierres / Asistencias?)
  lcRate?: number; // LC% (Lead to Close?)
  ventas?: number; // Unidades vendidas? o igual a cierres?
  
  // Financials
  revenue: number; // Facturado
  facturado?: number; // Alias for revenue for explicit mapping
  cpa?: number;
  beneficio?: number;
  bfacturado?: number; // Bfacturado
  
  // ROI Metrics
  roas?: number;
  roi?: number;
  rRoi?: number; // R-ROI
  cRoi?: number; // C-ROI
}

export interface AiAnalysisResult {
  summary: string;
  metricHighlights: {
    roas: string;
    cpl: string;
    overallTrend: 'POSITIVE' | 'NEGATIVE' | 'STABLE';
  };
  recommendations: Array<{
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    actionType: 'SCALE' | 'KILL' | 'OPTIMIZE';
    relatedCampaignIds?: string[];
  }>;
}
