import { Campaign, CampaignStatus, DailyPerformance } from './types';

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c-101',
    name: 'Lead Gen - Cold Traffic - Broad',
    status: CampaignStatus.ACTIVE,
    budget: 45000,
    spend: 48737,
    impressions: 2609,
    reach: 1981,
    clicks: 256,
    ctr: 9.8,
    cpc: 190,
    visits: 33,
    leads: 3,
    cpl: 16245,
    revenue: 145000,
    roas: 2.97
  },
  {
    id: 'c-102',
    name: 'Retargeting - Visitas Web 30D',
    status: CampaignStatus.ACTIVE,
    budget: 35000,
    spend: 32683,
    impressions: 1595,
    reach: 1402,
    clicks: 27,
    ctr: 1.7,
    cpc: 1210,
    visits: 34,
    leads: 0,
    cpl: 0,
    revenue: 45000,
    roas: 1.37
  },
  {
    id: 'c-103',
    name: 'Lookalike 3% - Leads',
    status: CampaignStatus.LEARNING,
    budget: 40000,
    spend: 48932,
    impressions: 1827,
    reach: 1519,
    clicks: 27,
    ctr: 1.5,
    cpc: 1812,
    visits: 12,
    leads: 4,
    cpl: 12233,
    revenue: 180000,
    roas: 3.67
  }
];

// Data transcribed from the provided image + Simulated Revenue for ROAS
export const HISTORICAL_DATA: DailyPerformance[] = [
  { date: '2025-12-01', spend: 34697, impressions: 2000, reach: 1732, cpm: 17348.50, clicks: 12, ctr: 0.6, cpc: 2891.42, visits: 17, lpcRate: 141.7, leads: 0, lpRate: 0.0, cpl: 0, revenue: 52000, roas: 1.5 },
  { date: '2025-12-02', spend: 35845, impressions: 1195, reach: 1072, cpm: 29995.82, clicks: 53, ctr: 4.4, cpc: 676.32, visits: 39, lpcRate: 73.6, leads: 3, lpRate: 7.7, cpl: 11948.33, revenue: 125000, roas: 3.48 },
  { date: '2025-12-03', spend: 36120, impressions: 1175, reach: 909, cpm: 30740.43, clicks: 48, ctr: 4.1, cpc: 752.50, visits: 52, lpcRate: 108.3, leads: 2, lpRate: 3.8, cpl: 18060.00, revenue: 98000, roas: 2.71 },
  { date: '2025-12-04', spend: 32683, impressions: 1595, reach: 1402, cpm: 20490.91, clicks: 27, ctr: 1.7, cpc: 1210.48, visits: 34, lpcRate: 125.9, leads: 0, lpRate: 0.0, cpl: 0, revenue: 45000, roas: 1.37 },
  { date: '2025-12-05', spend: 29436, impressions: 1726, reach: 1510, cpm: 17054.46, clicks: 15, ctr: 0.9, cpc: 1962.40, visits: 22, lpcRate: 146.7, leads: 3, lpRate: 13.6, cpl: 9812.00, revenue: 110000, roas: 3.73 },
  { date: '2025-12-06', spend: 34702, impressions: 1766, reach: 1470, cpm: 19650.06, clicks: 35, ctr: 2.0, cpc: 991.49, visits: 36, lpcRate: 102.9, leads: 2, lpRate: 5.6, cpl: 17351.00, revenue: 85000, roas: 2.44 },
  { date: '2025-12-07', spend: 36578, impressions: 3037, reach: 2530, cpm: 12044.12, clicks: 28, ctr: 0.9, cpc: 1306.36, visits: 30, lpcRate: 107.1, leads: 3, lpRate: 10.0, cpl: 12192.67, revenue: 130000, roas: 3.55 },
  { date: '2025-12-08', spend: 38002, impressions: 3739, reach: 3035, cpm: 10163.68, clicks: 36, ctr: 1.0, cpc: 1055.61, visits: 36, lpcRate: 100.0, leads: 2, lpRate: 5.6, cpl: 19001.00, revenue: 90000, roas: 2.36 },
  { date: '2025-12-09', spend: 47875, impressions: 3102, reach: 2813, cpm: 15433.59, clicks: 28, ctr: 0.9, cpc: 1709.82, visits: 49, lpcRate: 175.0, leads: 3, lpRate: 6.1, cpl: 15958.33, revenue: 160000, roas: 3.34 },
  { date: '2025-12-10', spend: 31095, impressions: 3182, reach: 2815, cpm: 9772.16, clicks: 86, ctr: 2.7, cpc: 361.57, visits: 36, lpcRate: 41.9, leads: 3, lpRate: 8.3, cpl: 10365.00, revenue: 115000, roas: 3.69 },
  { date: '2025-12-11', spend: 26774, impressions: 2386, reach: 2073, cpm: 11221.29, clicks: 168, ctr: 7.0, cpc: 159.37, visits: 25, lpcRate: 14.9, leads: 1, lpRate: 4.0, cpl: 26774.00, revenue: 60000, roas: 2.24 },
  { date: '2025-12-12', spend: 48737, impressions: 2609, reach: 1981, cpm: 18680.34, clicks: 256, ctr: 9.8, cpc: 190.38, visits: 33, lpcRate: 12.9, leads: 3, lpRate: 9.1, cpl: 16245.67, revenue: 145000, roas: 2.97 },
  { date: '2025-12-13', spend: 45647, impressions: 2501, reach: 1981, cpm: 18251.50, clicks: 66, ctr: 2.6, cpc: 691.62, visits: 18, lpcRate: 27.3, leads: 2, lpRate: 11.1, cpl: 22823.50, revenue: 100000, roas: 2.19 },
  { date: '2025-12-14', spend: 50060, impressions: 1931, reach: 1469, cpm: 25924.39, clicks: 146, ctr: 7.6, cpc: 342.88, visits: 12, lpcRate: 8.2, leads: 0, lpRate: 0.0, cpl: 0, revenue: 25000, roas: 0.49 },
  { date: '2025-12-15', spend: 41438, impressions: 1517, reach: 1249, cpm: 27315.75, clicks: 43, ctr: 2.8, cpc: 963.67, visits: 21, lpcRate: 48.8, leads: 3, lpRate: 14.3, cpl: 13812.67, revenue: 135000, roas: 3.25 },
  { date: '2025-12-16', spend: 48932, impressions: 1827, reach: 1519, cpm: 26782.70, clicks: 27, ctr: 1.5, cpc: 1812.30, visits: 12, lpcRate: 44.4, leads: 4, lpRate: 33.3, cpl: 12233.00, revenue: 180000, roas: 3.67 },
  { date: '2025-12-17', spend: 43028, impressions: 1611, reach: 1284, cpm: 26708.88, clicks: 36, ctr: 2.2, cpc: 1195.22, visits: 19, lpcRate: 52.8, leads: 1, lpRate: 5.3, cpl: 43028.00, revenue: 55000, roas: 1.27 },
];