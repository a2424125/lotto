// src/services/lottoStatsService.ts
// 🔬 고도화된 로또 통계분석 서비스

import { NumberStats, ZoneStats, PatternStats, TrendStats, PrizeStats, StatsSummary, StatsInsight } from '../types/stats';

interface LottoDrawData {
  round: number;
  date: string;
  numbers: number[];
  bonusNumber: number;
  jackpotWinners?: number;
  jackpotPrize?: number;
}

class LottoStatsService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: number = 10 * 60 * 1000; // 10분

  constructor() {
    console.log('📊 로또 통계분석 서비스 초기화');
  }

  // 🔢 고도화된 번호별 빈도 분석
  analyzeNumberFrequency(data: LottoDrawData[], range: string = 'all'): NumberStats[] {
    const cacheKey = `freq_${range}_${data.length}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    console.log(`🔍 번호별 빈도 분석 시작 (${data.length}회차)`);

    const frequency: { [key: number]: number } = {};
    const lastAppeared: { [key: number]: number } = {};
    const recentFrequency: { [key: number]: number } = {};

    // 전체 빈도 및 마지막 출현 계산
    data.forEach((draw, index) => {
      draw.numbers.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        if (lastAppeared[num] === undefined) {
          lastAppeared[num] = index;
        }
      });
    });

    // 최근 20회차 빈도 계산
    const recentData = data.slice(0, Math.min(20, data.length));
    recentData.forEach(draw => {
      draw.numbers.forEach(num => {
        recentFrequency[num] = (recentFrequency[num] || 0) + 1;
      });
    });

    const totalDraws = data.length;
    const results: NumberStats[] = [];

    for (let num = 1; num <= 45; num++) {
      const freq = frequency[num] || 0;
      const recentFreq = recentFrequency[num] || 0;
      const percentage = totalDraws > 0 ? (freq / totalDraws) * 100 : 0;
      const gap = lastAppeared[num] !== undefined ? lastAppeared[num] : totalDraws;
      
      // 트렌드 분석 (고도화)
      let trend: 'hot' | 'cold' | 'normal' = 'normal';
      const expectedRecentFreq = (freq / totalDraws) * recentData.length;
      
      if (recentFreq > expectedRecentFreq * 1.5) trend = 'hot';
      else if (recentFreq < expectedRecentFreq * 0.5) trend = 'cold';

      // 순위 변화 계산 (전체 vs 최근)
      const overallRank = this.getNumberRank(num, frequency);
      const recentRank = this.getNumberRank(num, recentFrequency);
      const rankChange = overallRank - recentRank;

      results.push({
        number: num,
        frequency: freq,
        percentage: Math.round(percentage * 100) / 100,
        lastAppeared: gap === totalDraws ? '없음' : `${gap + 1}회차 전`,
        gap: gap,
        trend: trend,
        recentFrequency: recentFreq,
        rankChange: rankChange
      });
    }

    const sortedResults = results.sort((a, b) => b.frequency - a.frequency);
    this.setCachedData(cacheKey, sortedResults);
    
    console.log('✅ 번호별 빈도 분석 완료');
    return sortedResults;
  }

  // 📊 구간별 분석 (개선된 버전)
  analyzeZones(data: LottoDrawData[]): ZoneStats[] {
    const cacheKey = `zones_${data.length}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    console.log('📊 구간별 분석 시작');

    const zones = [
      { zone: '1구간', range: '1-9', start: 1, end: 9, color: '#eab308', expected: 9/45 },
      { zone: '2구간', range: '10-19', start: 10, end: 19, color: '#3b82f6', expected: 10/45 },
      { zone: '3구간', range: '20-29', start: 20, end: 29, color: '#ef4444', expected: 10/45 },
      { zone: '4구간', range: '30-39', start: 30, end: 39, color: '#6b7280', expected: 10/45 },
      { zone: '5구간', range: '40-45', start: 40, end: 45, color: '#10b981', expected: 6/45 }
    ];

    const results = zones.map(zone => {
      let frequency = 0;
      const numbers: Set<number> = new Set();

      data.forEach(draw => {
        const zoneNumbers = draw.numbers.filter(num => num >= zone.start && num <= zone.end);
        frequency += zoneNumbers.length;
        zoneNumbers.forEach(num => numbers.add(num));
      });

      const totalPossible = data.length * 6;
      const actualPercentage = totalPossible > 0 ? (frequency / totalPossible) * 100 : 0;
      const expectedPercentage = zone.expected * 100;
      const expectedRatio = expectedPercentage > 0 ? actualPercentage / expectedPercentage : 0;

      return {
        zone: zone.zone,
        range: zone.range,
        frequency,
        percentage: Math.round(actualPercentage * 100) / 100,
        numbers: Array.from(numbers).sort((a, b) => a - b),
        expectedRatio: Math.round(expectedRatio * 100) / 100,
        color: zone.color
      };
    });

    this.setCachedData(cacheKey, results);
    console.log('✅ 구간별 분석 완료');
    return results;
  }

  // 🧩 고도화된 패턴 분석
  analyzePatterns(data: LottoDrawData[]): PatternStats {
    const cacheKey = `patterns_${data.length}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    console.log('🧩 패턴 분석 시작');

    let totalOdd = 0, totalEven = 0;
    let totalConsecutive = 0;
    const sums: number[] = [];
    const gaps: number[] = [];
    const sumDistribution: { [range: string]: number } = {};

    // 합계 구간 정의
    const sumRanges = [
      '21-70', '71-100', '101-130', '131-160', '161-190', 
      '191-220', '221-250', '251-279'
    ];
    
    sumRanges.forEach(range => sumDistribution[range] = 0);

    data.forEach(draw => {
      const numbers = draw.numbers.slice().sort((a, b) => a - b);
      
      // 홀짝 분석
      numbers.forEach(num => {
        if (num % 2 === 0) totalEven++;
        else totalOdd++;
      });

      // 연속번호 분석
      let consecutive = 0;
      for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i + 1] - numbers[i] === 1) {
          consecutive++;
        }
      }
      totalConsecutive += consecutive;

      // 합계 분석
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      sums.push(sum);

      // 합계 구간별 분포
      for (const range of sumRanges) {
        const [min, max] = range.split('-').map(Number);
        if (sum >= min && sum <= max) {
          sumDistribution[range]++;
          break;
        }
      }

      // 간격 분석
      for (let i = 0; i < numbers.length - 1; i++) {
        gaps.push(numbers[i + 1] - numbers[i]);
      }
    });

    // 통계 계산
    const sortedSums = sums.slice().sort((a, b) => a - b);
    const median = this.calculateMedian(sortedSums);
    const avgSum = sums.reduce((acc, sum) => acc + sum, 0) / sums.length;
    const avgGap = gaps.reduce((acc, gap) => acc + gap, 0) / gaps.length;

    const result: PatternStats = {
      oddEvenRatio: {
        odd: Math.round((totalOdd / (totalOdd + totalEven)) * 100),
        even: Math.round((totalEven / (totalOdd + totalEven)) * 100)
      },
      consecutiveNumbers: Math.round((totalConsecutive / data.length) * 100) / 100,
      sumRange: {
        min: Math.min(...sums),
        max: Math.max(...sums),
        avg: Math.round(avgSum * 100) / 100,
        median: median
      },
      numberGaps: {
        min: Math.min(...gaps),
        max: Math.max(...gaps),
        avg: Math.round(avgGap * 100) / 100
      },
      sumDistribution
    };

    this.setCachedData(cacheKey, result);
    console.log('✅ 패턴 분석 완료');
    return result;
  }

  // 📈 트렌드 분석
  analyzeTrends(data: LottoDrawData[]): TrendStats {
    console.log('📈 트렌드 분석 시작');

    const monthlyTrends: { [key: string]: number } = {};
    const seasonalTrends = { spring: 0, summer: 0, fall: 0, winter: 0 };
    const yearlyTrends: { [key: string]: number } = {};

    data.forEach(draw => {
      const date = new Date(draw.date);
      const year = date.getFullYear().toString();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthNum = date.getMonth() + 1;

      // 월별 트렌드
      monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;

      // 계절별 트렌드
      if (monthNum >= 3 && monthNum <= 5) seasonalTrends.spring++;
      else if (monthNum >= 6 && monthNum <= 8) seasonalTrends.summer++;
      else if (monthNum >= 9 && monthNum <= 11) seasonalTrends.fall++;
      else seasonalTrends.winter++;

      // 연도별 트렌드
      yearlyTrends[year] = (yearlyTrends[year] || 0) + 1;
    });

    return {
      weeklyTrends: [], // 주별 데이터는 별도 구현 필요
      monthlyTrends: Object.entries(monthlyTrends).map(([month, frequency]) => ({ month, frequency })),
      seasonalTrends: Object.entries(seasonalTrends).map(([season, frequency]) => ({ season, frequency })),
      yearlyTrends: Object.entries(yearlyTrends).map(([year, frequency]) => ({ year, frequency }))
    };
  }

  // 💡 인사이트 생성
  generateInsights(numberStats: NumberStats[], patternStats: PatternStats): StatsInsight[] {
    const insights: StatsInsight[] = [];

    // 핫넘버 인사이트
    const hotNumbers = numberStats.filter(stat => stat.trend === 'hot').slice(0, 3);
    if (hotNumbers.length > 0) {
      insights.push({
        type: 'hot_number',
        title: '🔥 핫넘버 발견!',
        description: `${hotNumbers.map(n => n.number).join(', ')}번이 최근 상승세입니다`,
        severity: 'info',
        data: hotNumbers,
        actionable: true,
        confidence: 85
      });
    }

    // 콜드넘버 인사이트
    const coldNumbers = numberStats.filter(stat => stat.trend === 'cold').slice(0, 3);
    if (coldNumbers.length > 0) {
      insights.push({
        type: 'cold_number',
        title: '🧊 콜드넘버 주의',
        description: `${coldNumbers.map(n => n.number).join(', ')}번이 최근 저조합니다`,
        severity: 'warning',
        data: coldNumbers,
        actionable: true,
        confidence: 75
      });
    }

    // 홀짝 불균형 인사이트
    const oddEvenDiff = Math.abs(patternStats.oddEvenRatio.odd - patternStats.oddEvenRatio.even);
    if (oddEvenDiff > 20) {
      insights.push({
        type: 'pattern_change',
        title: '⚖️ 홀짝 불균형 감지',
        description: `홀수 ${patternStats.oddEvenRatio.odd}% vs 짝수 ${patternStats.oddEvenRatio.even}%`,
        severity: 'warning',
        data: patternStats.oddEvenRatio,
        actionable: true,
        confidence: 80
      });
    }

    return insights;
  }

  // 📊 통계 요약 생성
  generateSummary(data: LottoDrawData[], numberStats: NumberStats[], patternStats: PatternStats): StatsSummary {
    const mostFrequent = numberStats.slice(0, 6).map(stat => stat.number);
    const leastFrequent = numberStats.slice(-6).map(stat => stat.number).reverse();
    
    // 전반적인 트렌드 분석
    const hotCount = numberStats.filter(stat => stat.trend === 'hot').length;
    const coldCount = numberStats.filter(stat => stat.trend === 'cold').length;
    let currentTrend: 'rising' | 'falling' | 'stable' = 'stable';
    
    if (hotCount > coldCount * 2) currentTrend = 'rising';
    else if (coldCount > hotCount * 2) currentTrend = 'falling';

    // 신뢰도 점수 계산
    const confidenceScore = Math.min(95, Math.max(60, 70 + (data.length / 10)));

    // 인사이트 생성
    const insights = this.generateInsights(numberStats, patternStats);

    return {
      analysisDate: new Date(),
      dataRange: {
        value: 'all',
        label: '전체',
        description: `${data.length}회차`,
        dataCount: data.length
      },
      totalNumbers: data.length * 6,
      mostFrequent,
      leastFrequent,
      currentTrend,
      confidenceScore,
      insights: insights.map(insight => insight.description)
    };
  }

  // 🔧 유틸리티 메서드들
  private getNumberRank(number: number, frequency: { [key: number]: number }): number {
    const sorted = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([num]) => parseInt(num));
    return sorted.indexOf(number) + 1;
  }

  private calculateMedian(sortedArray: number[]): number {
    const mid = Math.floor(sortedArray.length / 2);
    return sortedArray.length % 2 === 0
      ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
      : sortedArray[mid];
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`💾 캐시에서 데이터 반환: ${key}`);
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 📤 데이터 내보내기
  exportStats(numberStats: NumberStats[], zoneStats: ZoneStats[], patternStats: PatternStats): string {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalNumbers: numberStats.length
      },
      numberStats,
      zoneStats,
      patternStats
    };

    return JSON.stringify(exportData, null, 2);
  }

  // 🧹 캐시 정리
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 통계 캐시 정리 완료');
  }

  // 📊 성능 메트릭
  getPerformanceMetrics(): any {
    return {
      cacheSize: this.cache.size,
      memoryUsage: this.cache.size * 0.001, // 대략적인 메모리 사용량
      cacheHitRate: 0.85 // 임시값
    };
  }
}

// 싱글톤 인스턴스
export const lottoStatsService = new LottoStatsService();
export default LottoStatsService;
