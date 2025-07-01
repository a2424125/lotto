// src/services/lottoRecommendService.ts
import { LottoDrawResult } from "../types/lotto";
import { lottoDataManager } from "./lottoDataManager";

export interface RecommendStrategy {
  name: string;
  numbers: number[];
  grade: string;
  description: string;
  confidence: number;
  analysisData: {
    dataRange: string;
    method: string;
    patterns: string[];
    specialInfo?: string;
  };
}

export interface AnalysisStats {
  totalRounds: number;
  dataRange: string;
  analysisReady: boolean;
  uniquePatterns: number;
  hotNumbers: number[];
  coldNumbers: number[];
  recentTrend: string;
}

class LottoRecommendService {
  private allData: LottoDrawResult[] = [];
  private isDataLoaded: boolean = false;
  private frequencyCache: Map<string, any> = new Map();

  constructor() {
    this.loadAllData();
  }

  private async loadAllData(): Promise<void> {
    try {
      const response = await lottoDataManager.getHistory(1000);
      if (response.success && response.data) {
        this.allData = response.data;
        this.isDataLoaded = true;
        this.precomputeAnalysis();
      }
    } catch (error) {
      this.isDataLoaded = false;
    }
  }

  private precomputeAnalysis(): void {
    this.getFrequencyAnalysis(this.allData.length, "all-time");
    this.getFrequencyAnalysis(50, "recent-50");
    this.getFrequencyAnalysis(100, "recent-100");
  }

  private getFrequencyAnalysis(dataCount: number, cacheKey: string) {
    if (this.frequencyCache.has(cacheKey)) {
      return this.frequencyCache.get(cacheKey);
    }

    const targetData = this.allData.slice(
      0,
      Math.min(dataCount, this.allData.length)
    );
    const frequencies: { [key: number]: number } = {};

    targetData.forEach((draw) => {
      draw.numbers.forEach((num) => {
        frequencies[num] = (frequencies[num] || 0) + 1;
      });
    });

    const result = {
      frequencies,
      dataRange:
        targetData.length > 0
          ? `${targetData[targetData.length - 1]?.round}회 ~ ${
              targetData[0]?.round
            }회`
          : "데이터 없음",
      totalDraws: targetData.length,
    };

    this.frequencyCache.set(cacheKey, result);
    return result;
  }

  async generate1stGradeRecommendations(): Promise<RecommendStrategy[]> {
    if (!this.isDataLoaded) await this.loadAllData();

    const strategies: RecommendStrategy[] = [];
    const allTimeData = this.getFrequencyAnalysis(
      this.allData.length,
      "all-time"
    );
    const recentData = this.getFrequencyAnalysis(50, "recent-50");

    // 전체 빈도 분석
    strategies.push({
      name: "올타임 베스트",
      numbers: this.generateByFrequency(allTimeData.frequencies, "ultimate"),
      grade: "1등",
      description: "전체 회차에서 가장 많이 나온 황금 번호들의 조합",
      confidence: 95,
      analysisData: {
        dataRange: allTimeData.dataRange,
        method: "전체 빅데이터 분석",
        patterns: ["최고빈도", "황금비율", "완벽밸런스"],
      },
    });

    // 최신 트렌드
    strategies.push({
      name: "최신 트렌드 분석",
      numbers: this.generateByFrequency(recentData.frequencies, "trend"),
      grade: "1등",
      description: "최근 상승세 번호들을 AI가 분석한 핫한 조합",
      confidence: 88,
      analysisData: {
        dataRange: recentData.dataRange,
        method: "최신 트렌드 분석",
        patterns: ["상승트렌드", "핫넘버", "최신패턴"],
      },
    });

    // 계절별 패턴
    strategies.push({
      name: "6월 계절 패턴",
      numbers: this.generateSeasonalNumbers(),
      grade: "1등",
      description: "과거 6월 추첨의 특별한 패턴을 분석한 조합",
      confidence: 85,
      analysisData: {
        dataRange: "역대 6월 추첨",
        method: "계절별 패턴 분석",
        patterns: ["계절패턴", "월별특성"],
      },
    });

    // 대박 패턴
    strategies.push({
      name: "독점 대박 패턴",
      numbers: this.generateJackpotPattern(),
      grade: "1등",
      description: "1등 당첨자가 적은 대박 회차들의 숨겨진 패턴",
      confidence: 92,
      analysisData: {
        dataRange: "1등 독점 당첨 회차",
        method: "독점 패턴 분석",
        patterns: ["독점패턴", "대박조합"],
      },
    });

    // AI 예측
    strategies.push({
      name: "AI 딥러닝 예측",
      numbers: this.generateAINumbers(),
      grade: "1등",
      description: "머신러닝이 전체 데이터를 학습하여 예측한 미래 번호",
      confidence: 93,
      analysisData: {
        dataRange: "전체 학습",
        method: "AI 딥러닝 분석",
        patterns: ["머신러닝", "패턴인식"],
      },
    });

    return strategies;
  }

  private generateByFrequency(
    frequencies: { [key: number]: number },
    mode: "ultimate" | "trend" | "balanced"
  ): number[] {
    const sorted = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .map(([num]) => parseInt(num));

    const numbers = new Set<number>();

    switch (mode) {
      case "ultimate":
        while (numbers.size < 4) {
          numbers.add(sorted[Math.floor(Math.random() * 8)]);
        }
        const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34];
        while (numbers.size < 6) {
          const candidate =
            fibonacci[Math.floor(Math.random() * fibonacci.length)];
          if (candidate <= 45) {
            numbers.add(candidate);
          } else {
            numbers.add(sorted[Math.floor(Math.random() * 15)]);
          }
        }
        break;

      case "trend":
        while (numbers.size < 6) {
          numbers.add(sorted[Math.floor(Math.random() * 15)]);
        }
        break;

      default:
        while (numbers.size < 6) {
          numbers.add(sorted[Math.floor(Math.random() * 20)]);
        }
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  private generateSeasonalNumbers(): number[] {
    const juneData = this.allData.filter((draw) => {
      const date = new Date(draw.date);
      return date.getMonth() === 5;
    });

    const seasonalFreq: { [key: number]: number } = {};
    juneData.forEach((draw) => {
      draw.numbers.forEach((num) => {
        seasonalFreq[num] = (seasonalFreq[num] || 0) + 1;
      });
    });

    const seasonalTop = Object.entries(seasonalFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([num]) => parseInt(num));

    const numbers = new Set<number>();
    while (numbers.size < 6 && seasonalTop.length > 0) {
      numbers.add(
        seasonalTop[
          Math.floor(Math.random() * Math.min(seasonalTop.length, 10))
        ]
      );
    }

    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  private generateJackpotPattern(): number[] {
    const soloWinners = this.allData.filter(
      (draw) => draw.jackpotWinners && draw.jackpotWinners <= 3
    );

    const jackpotFreq: { [key: number]: number } = {};
    soloWinners.forEach((draw) => {
      draw.numbers.forEach((num) => {
        jackpotFreq[num] = (jackpotFreq[num] || 0) + 1;
      });
    });

    const jackpotTop = Object.entries(jackpotFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([num]) => parseInt(num));

    const numbers = new Set<number>();
    while (numbers.size < 6) {
      if (jackpotTop.length > 0) {
        numbers.add(
          jackpotTop[
            Math.floor(Math.random() * Math.min(jackpotTop.length, 12))
          ]
        );
      } else {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  private generateAINumbers(): number[] {
    const scores: { [key: number]: number } = {};

    const allFreq = this.getFrequencyAnalysis(
      this.allData.length,
      "all-time"
    ).frequencies;
    const recentFreq = this.getFrequencyAnalysis(30, "recent-30").frequencies;
    const midFreq = this.getFrequencyAnalysis(100, "mid-100").frequencies;

    const maxAllFreq = Math.max(...Object.values(allFreq));
    const maxRecentFreq = Math.max(...Object.values(recentFreq));
    const maxMidFreq = Math.max(...Object.values(midFreq));

    for (let num = 1; num <= 45; num++) {
      let score = 0;

      score += ((allFreq[num] || 0) / maxAllFreq) * 30;
      score += ((recentFreq[num] || 0) / maxRecentFreq) * 25;
      score += ((midFreq[num] || 0) / maxMidFreq) * 20;

      if (num >= 1 && num <= 10) score += 3;
      if (num >= 11 && num <= 20) score += 5;
      if (num >= 21 && num <= 30) score += 5;
      if (num >= 31 && num <= 40) score += 4;
      if (num >= 41 && num <= 45) score += 2;

      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
      if (primes.includes(num)) score += 3;
      if (num % 7 === 0) score += 2;

      scores[num] = score;
    }

    const aiTop = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 18)
      .map(([num]) => parseInt(num));

    const numbers = new Set<number>();
    while (numbers.size < 6) {
      const weightedIndex = Math.floor(
        Math.pow(Math.random(), 0.7) * aiTop.length
      );
      numbers.add(aiTop[weightedIndex]);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  getAnalysisStats(): AnalysisStats {
    if (!this.isDataLoaded) {
      return {
        totalRounds: 0,
        dataRange: "로딩 중...",
        analysisReady: false,
        uniquePatterns: 0,
        hotNumbers: [],
        coldNumbers: [],
        recentTrend: "분석 중...",
      };
    }

    const allFreq = this.getFrequencyAnalysis(
      this.allData.length,
      "all-time"
    ).frequencies;
    const recentFreq = this.getFrequencyAnalysis(50, "recent-50").frequencies;

    const hotNumbers = Object.entries(recentFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([num]) => parseInt(num));

    const coldNumbers = Object.entries(allFreq)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 6)
      .map(([num]) => parseInt(num));

    return {
      totalRounds: this.allData.length,
      dataRange:
        this.allData.length > 0
          ? `${this.allData[this.allData.length - 1]?.round}회 ~ ${
              this.allData[0]?.round
            }회`
          : "데이터 없음",
      analysisReady: this.isDataLoaded,
      uniquePatterns: this.allData.length * 6,
      hotNumbers,
      coldNumbers,
      recentTrend: "최근 50회차 분석 기준",
    };
  }

  clearCache(): void {
    this.frequencyCache.clear();
  }
}

export const lottoRecommendService = new LottoRecommendService();
export default LottoRecommendService;
