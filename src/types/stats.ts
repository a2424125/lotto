// src/types/stats.ts
// 통계분석 관련 타입 정의

export interface NumberStats {
  number: number;
  frequency: number;
  percentage: number;
  lastAppeared: string;
  gap: number;
  trend: 'hot' | 'cold' | 'normal';
  recentFrequency: number;
  rankChange: number; // 순위 변화
}

export interface ZoneStats {
  zone: string;
  range: string;
  frequency: number;
  percentage: number;
  numbers: number[];
  expectedRatio: number; // 기댓값 대비 비율
  color: string;
}

export interface PatternStats {
  oddEvenRatio: { odd: number; even: number };
  consecutiveNumbers: number;
  sumRange: { min: number; max: number; avg: number; median: number };
  numberGaps: { min: number; max: number; avg: number };
  sumDistribution: { [range: string]: number }; // 합계 구간별 분포
}

export interface TrendStats {
  weeklyTrends: { week: string; frequency: number }[];
  monthlyTrends: { month: string; frequency: number }[];
  seasonalTrends: { season: string; frequency: number }[];
  yearlyTrends: { year: string; frequency: number }[];
}

export interface PrizeStats {
  totalRounds: number;
  totalPrize: number;
  avgPrize: number;
  maxPrize: number;
  minPrize: number;
  medianPrize: number;
  totalWinners: number;
  avgWinners: number;
  prizeDistribution: { range: string; count: number }[];
  winnersDistribution: { count: number; rounds: number }[];
}

export interface AdvancedStats {
  correlation: { [key: string]: number }; // 번호간 상관관계
  clusters: { center: number[]; members: number[] }[]; // 번호 클러스터링
  predictions: { number: number; probability: number }[]; // 예측 확률
  anomalies: { round: number; reason: string }[]; // 이상치 탐지
}

export interface AnalysisRange {
  value: 'all' | '100' | '50' | '30' | '20' | '10';
  label: string;
  description: string;
  dataCount: number;
}

export interface StatsSummary {
  analysisDate: Date;
  dataRange: AnalysisRange;
  totalNumbers: number;
  mostFrequent: number[];
  leastFrequent: number[];
  currentTrend: 'rising' | 'falling' | 'stable';
  confidenceScore: number;
  insights: string[];
}

export interface ExportableStats {
  metadata: {
    exportDate: Date;
    analysisRange: string;
    totalRounds: number;
    version: string;
  };
  numberStats: NumberStats[];
  zoneStats: ZoneStats[];
  patternStats: PatternStats;
  trendStats?: TrendStats;
  prizeStats?: PrizeStats;
  advancedStats?: AdvancedStats;
}

// 분석 모드 타입
export type AnalysisMode = 'frequency' | 'zones' | 'patterns' | 'trends' | 'prizes' | 'advanced';

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// 필터 옵션
export interface StatsFilter {
  dateRange?: { start: Date; end: Date };
  numberRange?: { min: number; max: number };
  excludeNumbers?: number[];
  includeOnly?: number[];
  minFrequency?: number;
  maxFrequency?: number;
}

// 정렬 옵션
export interface SortOption {
  field: keyof NumberStats;
  direction: 'asc' | 'desc';
}

// 비교 분석 타입
export interface ComparisonStats {
  period1: StatsSummary;
  period2: StatsSummary;
  changes: {
    numberRankings: { number: number; change: number }[];
    patternChanges: { pattern: string; change: number }[];
    trendDirection: 'improving' | 'declining' | 'stable';
  };
}

// 알림/인사이트 타입
export interface StatsInsight {
  type: 'hot_number' | 'cold_number' | 'pattern_change' | 'anomaly' | 'prediction';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  data: any;
  actionable: boolean;
  confidence: number;
}

// 성능 메트릭
export interface PerformanceMetrics {
  analysisTime: number; // 분석 소요 시간 (ms)
  dataPoints: number;   // 분석된 데이터 포인트 수
  cacheHits: number;    // 캐시 히트 수
  memoryUsage: number;  // 메모리 사용량 (MB)
}

export default {
  NumberStats,
  ZoneStats,
  PatternStats,
  TrendStats,
  PrizeStats,
  AdvancedStats,
  StatsSummary,
  ExportableStats,
  StatsInsight,
  PerformanceMetrics
};
