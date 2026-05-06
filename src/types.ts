export interface Vaccine {
  type: string;
  stock: number;
  requirement: number;
}

export interface District {
  id: string;
  name: string;
  population: number;
  casesToday: number;
  growthRate: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: number;
  vaccines: Vaccine[];
}

export interface PredictiveInsights {
  summary: string;
  highRiskDistricts: string[];
  projectedTotalRequirement: number;
  lastUpdated: string;
}
