import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Campaign, AiAnalysisResult, DailyPerformance } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCampaigns = async (campaigns: Campaign[], dailyData?: DailyPerformance[]): Promise<AiAnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Actúa como un experto en Meta Ads y Business Intelligence (BI).
    Analiza los datos de campañas y el reporte diario "Full-Funnel" proporcionado.
    
    Tienes acceso a métricas de:
    1. Tráfico (Meta): Impresiones, CTR, CPC.
    2. Conversión Web: Leads, CPL, Landing Page Rate.
    3. CRM / Ventas: Agendas (Aut/Set), Asistencias, Cierres, Facturado (Revenue), CPA y Beneficio.
    
    Tus objetivos:
    1. Analizar la rentabilidad real (ROI/ROAS) más allá del CPL. ¿Leads baratos están generando ventas?
    2. Identificar cuellos de botella en el embudo (ej. Muchos leads -> pocas agendas, o muchas agendas -> pocas asistencias).
    3. Detectar días con "Beneficio" negativo y correlacionarlo con aumentos en CPC o baja conversión.
    4. Dar recomendaciones tácticas precisas (ej. "Mejorar script de ventas porque el cierre es bajo" o "Apagar campañas con CPL alto y 0 agendas").
    
    Datos de Campañas (JSON):
    ${JSON.stringify(campaigns)}

    Datos Diarios (JSON - Muestra reciente):
    ${JSON.stringify(dailyData?.slice(-7))} 

    Responde estrictamente en formato JSON utilizando el esquema especificado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            metricHighlights: {
              type: Type.OBJECT,
              properties: {
                roas: { type: Type.STRING, description: "Breve análisis del estado del ROAS/ROI" },
                cpl: { type: Type.STRING, description: "Breve análisis del estado del CPL" },
                overallTrend: { type: Type.STRING, enum: ["POSITIVE", "NEGATIVE", "STABLE"] }
              },
              required: ["roas", "cpl", "overallTrend"]
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                  actionType: { type: Type.STRING, enum: ["SCALE", "KILL", "OPTIMIZE"] },
                  relatedCampaignIds: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Lista de IDs de campañas relacionadas" 
                  }
                },
                required: ["title", "description", "impact", "actionType"]
              }
            }
          },
          required: ["summary", "metricHighlights", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }
    
    return JSON.parse(text) as AiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing campaigns with Gemini:", error);
    return {
      summary: "No se pudo conectar con el asistente de IA para el análisis detallado.",
      metricHighlights: {
        roas: "N/A",
        cpl: "N/A",
        overallTrend: "STABLE"
      },
      recommendations: []
    };
  }
};

export const createAdvisorChat = (campaigns: Campaign[], dailyData?: DailyPerformance[]): Chat => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    Eres "Meta Ads Advisor", un analista de datos y experto en marketing.
    
    Tienes acceso a un reporte detallado con métricas desde el Click hasta la Venta (Facturado, ROI, Beneficio).
    
    1. CAMPAÑAS ACTIVAS (JSON):
    ${JSON.stringify(campaigns)}

    2. RENDIMIENTO DIARIO COMPLETO (JSON):
    ${JSON.stringify(dailyData?.slice(-14))}

    INSTRUCCIONES:
    - Puedes responder preguntas profundas sobre el embudo de ventas (ej. "¿Cuál es mi tasa de cierre promedio?", "¿Cuánto me cuesta adquirir un cliente real (CPA)?").
    - Si el usuario pregunta por qué no es rentable, analiza la columna "Beneficio" y rastrea el problema hacia atrás (¿Pocas agendas? ¿CPL alto?).
    - Usa formato Markdown.
    - Habla siempre en Español.
  `;

  return ai.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
    }
  });
};