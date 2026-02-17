
export interface ProductionRecord {
  name: string;
  value: number;
}

export interface MonthlyData {
  id: string; // e.g., "2023-10"
  monthName: string; // e.g., "October 2023"
  records: ProductionRecord[];
  createdAt: number;
}

export interface Stats {
  total: number;
  average: number;
  max: number;
  min: number;
  count: number;
  topPerformer: string;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  trendAnalysis: string;
}
