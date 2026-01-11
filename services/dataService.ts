import { DailyPerformance } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2V2z8nNkBkJ-vjO-8Qp1LBmrvB40bmfShknEdpnNLTPjB44y80it1x708JJM2D4M9DQnRqXVKDP6i/pub?output=csv';

const parseValue = (val: string) => {
  if (!val) return 0;
  // Remove currency symbols ($), spaces, and other non-numeric chars except . and , and -
  let clean = val.replace(/[^0-9.,-]/g, '').trim();
  
  if (!clean) return 0;

  // Heuristic for Number Format:
  // If both . and , exist:
  if (clean.includes('.') && clean.includes(',')) {
    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    if (lastComma > lastDot) {
        // 1.000,00 format (EU/ES)
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
        // 1,000.00 format (US)
        clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
     // Only comma. Could be 1,000 (1000) or 1,5 (1.5).
     // Assume US format (comma is thousands) if multiple parts or length > 3 after comma?
     // Safest default for CSV from Sheets is often . as decimal.
     // However, let's treat comma as decimal if it looks like a decimal separator (2 digits? 1 digit?)
     // Or replace comma with dot if it's the only separator.
     clean = clean.replace(',', '.');
  } 
  // If only dot: 1.000 -> parseFloat handles it as 1.0 usually. 
  
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Robust CSV Line Splitter to handle quoted newlines
const parseCSVRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell);
      // Only push if row has content
      if (currentRow.some(c => c.trim())) {
         rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some(c => c.trim())) {
        rows.push(currentRow);
    }
  }
  return rows;
};

export const parseCSV = (csvText: string): DailyPerformance[] => {
  const rows = parseCSVRows(csvText);
  if (rows.length < 1) throw new Error("El archivo CSV está vacío.");

  // Intelligent Header Detection
  let headerRowIndex = -1;
  let headers: string[] = [];
  
  // Look for a row that contains our mandatory fields in the first 10 rows
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i].map(c => c.toLowerCase().trim().replace(/[\s_.-]/g, ''));
    const hasDate = row.some(c => c.includes('date') || c.includes('fecha') || c.includes('dia'));
    const hasSpend = row.some(c => c.includes('spend') || c.includes('inversion') || c.includes('gasto') || c.includes('importe'));
    
    if (hasDate && hasSpend) {
      headerRowIndex = i;
      headers = row;
      break;
    }
  }

  if (headerRowIndex === -1) {
     // If not found, log details in error message
     const firstRow = rows[0] ? rows[0].join(', ') : 'Empty';
     throw new Error(`No se detectaron columnas de Fecha e Inversión. Primera fila: ${firstRow}`);
  }

  const findIdx = (keywords: string[]) => {
      const simpleKeywords = keywords.map(k => k.replace(/[\s_.-]/g, ''));
      return headers.findIndex(h => simpleKeywords.some(k => h.includes(k)));
  };

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
    agendasAut: findIdx(['agendasaut', 'aut']),
    agendasSet: findIdx(['agendasset', 'set']),
    agendasTotal: findIdx(['agendastotal', 'total']),
    agCualificado: findIdx(['agcualificado', 'cualificados']),
    cplCualificado: findIdx(['cplcualificado']),
    vcrRate: findIdx(['vcr%']),
    vcrCash: findIdx(['vcr$']),
    llamadas: findIdx(['llamadas']),
    asistencias: findIdx(['asistencias']),
    cancelaciones: findIdx(['cancelaciones']),
    asisRate: findIdx(['asis%', 'asistencia%']),
    asisCash: findIdx(['asis$']),
    cierres: findIdx(['cierres']),
    ccRate: findIdx(['cc%', 'closing']),
    lcRate: findIdx(['lc%']),
    ventas: findIdx(['ventas']),
    facturado: findIdx(['facturado', 'revenue', 'ingresos']),
    cpa: findIdx(['cpa']),
    beneficio: findIdx(['beneficio', 'profit']),
    bfacturado: findIdx(['bfacturado']),
    roi: findIdx(['roi']),
    rRoi: findIdx(['rroi']),
    cRoi: findIdx(['croi']),
  };

  if (map.date === -1 || map.spend === -1) {
      const missing = [];
      if (map.date === -1) missing.push('Fecha');
      if (map.spend === -1) missing.push('Inversión');
      throw new Error(`Faltan columnas obligatorias: ${missing.join(', ')}. Encabezados encontrados: ${headers.join(', ')}`);
  }

  return rows.slice(headerRowIndex + 1).map((row) => {
    // Helper to get raw value by index safely
    const getRaw = (idx: number) => (idx >= 0 && idx < row.length) ? row[idx] : '';
    
    // Parse Date
    let dateStr = getRaw(map.date).replace(/^"|"$/g, '').trim();
    // Normalize dd/mm/yyyy to yyyy-mm-dd
    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
        const parts = dateStr.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        dateStr = `${year}-${month}-${day}`;
    }

    const spend = parseValue(getRaw(map.spend));
    const revenue = parseValue(getRaw(map.facturado));
    const leads = parseValue(getRaw(map.leads));

    const getVal = (idx: number) => idx > -1 ? parseValue(getRaw(idx)) : 0;

    return {
      date: dateStr,
      spend,
      revenue,
      facturado: revenue,
      impressions: getVal(map.impressions),
      reach: getVal(map.reach),
      cpm: getVal(map.cpm),
      clicks: getVal(map.clicks),
      ctr: getVal(map.ctr),
      cpc: getVal(map.cpc),
      visits: getVal(map.visits),
      lpcRate: getVal(map.lpcRate),
      leads,
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
      cpa: getVal(map.cpa),
      beneficio: getVal(map.beneficio),
      bfacturado: getVal(map.bfacturado),
      roi: getVal(map.roi),
      rRoi: getVal(map.rRoi),
      cRoi: getVal(map.cRoi),
      roas: spend > 0 ? revenue / spend : 0
    };
  }).filter(d => d.date && !isNaN(new Date(d.date).getTime())) as DailyPerformance[];
};

export const fetchSheetData = async (): Promise<DailyPerformance[]> => {
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error("Error fetching CSV");
  const text = await response.text();
  return parseCSV(text);
};