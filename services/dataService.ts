import { DailyPerformance } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2V2z8nNkBkJ-vjO-8Qp1LBmrvB40bmfShknEdpnNLTPjB44y80it1x708JJM2D4M9DQnRqXVKDP6i/pub?output=csv';

const parseValue = (val: string) => {
  if (!val) return 0;
  const cleanStr = val.trim();

  // Specific handling for Spanish/EU Format detected in Sheet: "$293.489,00"
  // Logic: If there is a comma AFTER a dot, or a comma at the end with >3 digits before it, treat dot as thousand sep.

  // Check for 1.000,00 format
  if (cleanStr.includes('.') && cleanStr.includes(',')) {
    const lastComma = cleanStr.lastIndexOf(',');
    const lastDot = cleanStr.lastIndexOf('.');
    if (lastComma > lastDot) {
      // EU Format detected
      const normalized = cleanStr.replace(/[^\d,-]/g, '').replace(',', '.');
      return parseFloat(normalized) || 0;
    }
  }

  // Fallback generic cleaning (removes currency symbols, keeps . and , and -)
  let clean = val.replace(/[^0-9.,-]/g, '').trim();
  if (!clean) return 0;

  // If only comma (e.g. 50,5 or 1000,00), replace with dot to be safe for parseFloat
  // unless it looks like 1,000 (US thousands). 
  // Heuristic: if comma is followed by exactly 2 digits, likely decimal (currency).
  // If followed by 3 digits, ambiguous (could be 1,000 or 1,123).
  // Given the sheet is Spanish, comma is decimal.
  if (clean.includes(',') && !clean.includes('.')) {
    clean = clean.replace(',', '.');
  } else if (clean.includes(',') && clean.includes('.')) {
    // Handled above, but just in case
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    if (lastComma < lastDot) {
      // US Format: 1,000.00 -> remove comma
      clean = clean.replace(/,/g, '');
    }
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Robust CSV Line Splitter to handle quoted newlines
const parseCSVRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  // Check for BOM
  let start = 0;
  if (text.charCodeAt(0) === 0xFEFF) {
    start = 1;
  }

  let inQuotes = false;

  for (let i = start; i < text.length; i++) {
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

const parseDailyCSV = (rows: string[][]): DailyPerformance[] => {
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
    return [];
  }

  const findIdx = (keywords: string[]) => {
    const simpleKeywords = keywords.map(k => k.replace(/[\s_.-]/g, ''));
    return headers.findIndex(h => simpleKeywords.some(k => h.includes(k)));
  };

  const map = {
    date: findIdx(['date', 'fecha', 'dia']),
    spend: findIdx(['spend', 'inversion', 'gasto', 'importe']),
    leads: findIdx(['leads', 'clientes', 'potenciales']),
    clicks: findIdx(['clicks', 'clics']),
    impressions: findIdx(['impressions', 'impresiones']),
    revenue: findIdx(['facturado', 'revenue', 'ingresos', 'recoleccion', 'ventas']),
    // Add other fields as needed, keeping it simple for robust fix verification
  };

  if (map.date === -1 || map.spend === -1) {
    return [];
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
    const leads = parseValue(getRaw(map.leads));
    // Basic fields for compatibility
    return {
      date: dateStr,
      spend,
      leads,
      clicks: 0, impressions: 0, revenue: 0, roas: 0
    };
  }).filter(d => d.date && !isNaN(new Date(d.date).getTime())) as DailyPerformance[];
}

const parseMonthlyCSV = (rows: string[][]): DailyPerformance[] => {
  // Transposed Strategy: look for Month names in the header row
  // Header row usually around row 1 or 2
  let headerRowIndex = -1;
  let headers: string[] = [];

  const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'september', 'septiembre', 'octubre', 'noviembre', 'deciembre', 'diciembre'];

  // Scan first 10 rows for month headers
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i].map(c => c.toLowerCase().trim());
    // Check if at least 3 months are present to be sure
    const monthsFound = row.filter(c => MONTH_NAMES.includes(c));
    if (monthsFound.length >= 3) {
      headerRowIndex = i;
      headers = row;
      break;
    }
  }

  if (headerRowIndex === -1 || headers.length === 0) return [];

  // Determine Year from Context (e.g. "YTD 2024" or "2026" in header)
  let year = 2025;
  // Look for any 4 digit number starting with 20
  const headerString = headers.join(' ');
  const yearMatch = headerString.match(/20\d{2}/);
  if (yearMatch) {
    year = parseInt(yearMatch[0]);
    console.log(`[CSV] Detected Year: ${year}`);
  }

  // Map Column Index -> Date (YYYY-MM-01)
  const colDateMap: Record<number, string> = {};

  headers.forEach((h, idx) => {
    const mIdx = MONTH_NAMES.findIndex(m => m === h || (m === 'september' && h === 'septiembre') || (m === 'septiembre' && h === 'september') || (m === 'deciembre' && h === 'diciembre'));
    if (mIdx !== -1) {
      // Month found
      let realMonth = -1;
      if (h === 'enero') realMonth = 0;
      else if (h === 'febrero') realMonth = 1;
      else if (h === 'marzo') realMonth = 2;
      else if (h === 'abril') realMonth = 3;
      else if (h === 'mayo') realMonth = 4;
      else if (h === 'junio') realMonth = 5;
      else if (h === 'julio') realMonth = 6;
      else if (h === 'agosto') realMonth = 7;
      else if (h.includes('sep')) realMonth = 8;
      else if (h === 'octubre') realMonth = 9;
      else if (h === 'noviembre') realMonth = 10;
      else if (h.includes('dic') || h.includes('dec')) realMonth = 11;

      if (realMonth !== -1) {
        const monthStr = (realMonth + 1).toString().padStart(2, '0');
        colDateMap[idx] = `${year}-${monthStr}-01`;
      }
    }
  });

  // Initialize objects for each found column
  const dataMap: Record<string, Partial<DailyPerformance>> = {};
  Object.values(colDateMap).forEach(date => {
    dataMap[date] = { date, spend: 0, revenue: 0, leads: 0, clicks: 0, impressions: 0 };
  });

  // Map Metric Names to Fields
  const metricMap: Record<string, keyof DailyPerformance> = {
    'inversión': 'spend',
    'inversion': 'spend',
    'clicks': 'clicks',
    'leads': 'leads',
    'agendas totales': 'agendasTotal',
    'agendas cualificadas': 'agCualificado',
    'asistencias totales': 'asistencias',
    'cierres': 'cierres',
    'ventas': 'ventas', // "$Ventas"
    'recolección': 'revenue', // "$Recolección"
    'ingresos': 'revenue',
    'cpl': 'cpl',
    'cpa': 'cpa',
    'roas': 'roas' // "Efectivo ROAS"
  };

  // Iterate Rows to find Metrics
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];

    // BETTER LABEL DETECTION: Scan first few columns
    let cleanLabel = '';
    // Look up to column 5 just in case
    for (let c = 0; c < Math.min(row.length, 5); c++) {
      const cellText = row[c];
      if (cellText && cellText.trim().length > 1) {
        cleanLabel = cellText.toLowerCase().replace(/[^a-záéíóúñ$() ]/g, '').trim();
        // If we found something substantial that isn't just a number, stop
        if (cleanLabel.length > 2 && isNaN(parseFloat(cleanLabel))) break;
      }
    }

    // Check match
    let matchedKey: keyof DailyPerformance | null = null;

    for (const [key, field] of Object.entries(metricMap)) {
      if (cleanLabel.includes(key)) {
        matchedKey = field;
        break;
      }
    }

    if (matchedKey) {
      console.log(`[CSV] Matched Row: "${cleanLabel}" -> ${matchedKey}`);

      // Distribute values to columns
      row.forEach((cellVal, colIdx) => {
        if (colDateMap[colIdx]) {
          const date = colDateMap[colIdx];
          const numVal = parseValue(cellVal);

          if (matchedKey === 'spend' || matchedKey === 'leads') {
            console.log(`   -> ${date}: Raw="${cellVal}" Parsed=${numVal}`);
          }

          // @ts-ignore
          dataMap[date][matchedKey] = numVal;
        }
      });
    }
  }

  // Handle Revenue/Facturado alias
  Object.values(dataMap).forEach(d => {
    if ((d.revenue === 0 || d.revenue === undefined) && d['ventas']) d.revenue = d['ventas'];
    d.facturado = d.revenue;

    // Recalculate derived if missing
    if ((!d.roas || d.roas === 0) && d.spend && d.revenue && d.spend > 0) d.roas = d.revenue / d.spend;
    if ((!d.cpl || d.cpl === 0) && d.spend && d.leads && d.leads > 0) d.cpl = d.spend / d.leads;
  });

  return Object.values(dataMap) as DailyPerformance[];
};

export const parseCSV = (csvText: string): DailyPerformance[] => {
  const rows = parseCSVRows(csvText);
  if (rows.length < 1) throw new Error("El archivo CSV está vacío.");

  // Try Daily First (Strict check to avoid false positives)
  if (rows[0] && rows[0].join(' ').toLowerCase().includes('date') && rows[0].join(' ').toLowerCase().includes('spend')) {
    const dailyData = parseDailyCSV(rows);
    if (dailyData.length > 0) {
      console.log("Detectado formato Diario Estándar");
      return dailyData;
    }
  }

  // Try Monthly (Fallback/Primary if Daily fails)
  const monthlyData = parseMonthlyCSV(rows);
  if (monthlyData.length > 0) {
    console.log(`Detectado formato Mensual Transpuesto. Filas: ${monthlyData.length}`);
    return monthlyData;
  }

  throw new Error("No se pudo detectar un formato válido (Diario o Mensual).");
};

export const fetchSheetData = async (): Promise<DailyPerformance[]> => {
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error("Error fetching CSV: " + response.statusText);
  const text = await response.text();
  return parseCSV(text);
};