export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DecisionStatus = 'LOW_RISK' | 'NEEDS_REVIEW' | 'HIGH_RISK' | 'POLICY_VIOLATION';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PreScanFinding {
  id: string;
  category: string;
  policy: string;
  policy_rule?: string;
  severity: FindingSeverity;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp?: string;
  start_timestamp?: string;
  endTimestamp?: string;
  end_timestamp?: string;
  quote?: string;
  evidence_quote?: string;
  title?: string;
  visualContext?: string;
  reasoning: string;
  explanation?: string;
  recommendation: string;
  recommended_action?: string;
}

export interface PreScanCategoryAudit {
  risk_level: RiskLevel;
  score: number;
  findings_count: number;
  summary: string;
}

export interface PreScanOverallRisk {
  risk_level: RiskLevel;
  decision: DecisionStatus;
  safety_score: number;
  monetization_impact: 'FULLY_MONETIZABLE' | 'LIMITED_MONETIZATION' | 'NOT_MONETIZABLE' | 'DEMONETIZATION_RISK';
  summary: string;
}

export interface PreScanV1ReportData {
  preScanVersion: string;
  metadata: {
    scanId: string;
    title: string;
    category?: string;
    language?: string;
    sourceType?: string;
    analyzedAt: string;
    inferredGenre?: string;
    durationSeconds?: number;
  };
  overall: PreScanOverallRisk;
  overall_risk: PreScanOverallRisk;
  categories: {
    communityGuidelines: PreScanCategoryAudit;
    advertiserSuitability: PreScanCategoryAudit;
    copyrightSignals: PreScanCategoryAudit;
    metadataIntegrity: PreScanCategoryAudit;
    community_guidelines?: PreScanCategoryAudit;
    advertiser_suitability?: PreScanCategoryAudit;
    copyright_signals?: PreScanCategoryAudit;
    metadata_integrity?: PreScanCategoryAudit;
  };
  findings: PreScanFinding[];
  positiveObservations?: string[];
  creatorActionPlan?: string[];
  recommendedActions: string[];
  limitations?: string[];
  disclaimer: string;
}
