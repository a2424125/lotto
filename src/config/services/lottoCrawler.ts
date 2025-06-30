// src/services/lottoCrawler.ts
// CORS 문제 해결된 크롤링 서비스

import { LottoDrawResult, LottoAPIResponse } from '../types/lotto';

interface CrawlerOptions {
  requestDelay: number;
  maxRetries: number;
  timeout: number;
  userAgent: string;
  useProxy: boolean;  // 프록시 사용 여부 추가
}

interface CacheItem {
  data: LottoDrawResult;
  timestamp: number;
  expiry: number;
}

class LottoCrawler {
  private options: CrawlerOptions;
  private cache: Map<number, CacheItem> = new Map();
  private lastRequestTime: number = 0;
  private isRateLimited: boolean = false;

  constructor(options?: Partial<CrawlerOptions>) {
    this.options = {
      requestDelay: 5000,
      maxRetries: 3,
      timeout: 10000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      useProxy: true,  // 기본적으로 프록시 사용
      ...options
    };
  }

  async getDrawResult(round?: number): Promise<LottoAPIResponse> {
    try {
      if (!round) {
        const latestRound = await this.getLatestRoundNumber();
        round = latestRound;
      }

      const cached = this.getCachedResult(round);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Cached data'
        };
      }

      await this.enforceRateLimit();

      // CORS 문제 해결을 위한 다중 방법 시도
      const result = await this.crawlWithMultipleMethods(round);
      
      if (result) {
        this.setCachedResult(round, result, 3600000);
        return {
          success: true,
          data: result
        };
      } else {
        throw new Error('크롤링 실패');
      }

    } catch (error) {
      console.error('크롤링 에러:', error);
      
      const fallbackData = this.getFallbackData(round || 1177);
      return {
        success: false,
        data: fallbackData,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: 'Fallback data used due to crawling failure'
      };
    }
  }

  // 다중 방법으로 크롤링 시도
  private async crawlWithMultipleMethods(round: number): Promise<LottoDrawResult | null> {
    const methods = [
      () => this.performCrawlWithProxy(round),      // 방법 1: 프록시 사용
      () => this.performCrawlDirect(round),         // 방법 2: 직접 요청
      () => this.performCrawlWithCORS(round),       // 방법 3: CORS 우회
    ];

    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`크롤링 방법 ${i + 1} 시도 - 회차: ${round}`);
        const result = await methods[i]();
        if (result) {
          console.log(`크롤링 방법 ${i + 1} 성공 - 회차: ${round}`);
          return result;
        }
      } catch (error) {
        console.warn(`크롤링 방법 ${i + 1} 실패:`, error);
        if (i < methods.length - 1) {
          await this.delay(1000); // 다음 방법 시도 전 1초 대기
        }
      }
    }

    return null;
  }

  // 방법 1: 프록시를 통한 요청
  private async performCrawlWithProxy(round: number): Promise<LottoDrawResult | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      // package.json의 proxy 설정을 사용한 상대 경로
      const url = `/common.do?method=getLottoNumber&drwNo=${round}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (this.isValidLottoData(data)) {
        return this.parseDrawResult(data);
      } else {
        throw new Error('Invalid data format');
      }

    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 방법 2: 직접 요청 (CORS 에러 가능)
  private async performCrawlDirect(round: number): Promise<LottoDrawResult | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.options.userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (this.isValidLottoData(data)) {
        return this.parseDrawResult(data);
      } else {
        throw new Error('Invalid data format');
      }

    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 방법 3: CORS 우회 시도
  private async performCrawlWithCORS(round: number): Promise<LottoDrawResult | null> {
    try {
      // CORS 프록시 서비스를 사용한 우회 (개발 환경에서만)
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
      
      const response = await fetch(proxyUrl + targetUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (this.isValidLottoData(data)) {
        return this.parseDrawResult(data);
      } else {
        throw new Error('Invalid data format');
      }

    } catch (error) {
      throw new Error('CORS proxy failed: ' + error);
    }
  }

  // 기존 메서드들 유지
  private async getLatestRoundNumber(): Promise<number> {
    try {
      const now = new Date();
      const startDate = new Date('2002-12-07');
      const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return Math.min(weeksDiff + 1, 1177);
    } catch (error) {
      return 1177;
    }
  }

  private isValidLottoData(data: any): boolean {
    return data && 
           data.drwNo && 
           data.drwtNo1 && data.drwtNo2 && data.drwtNo3 && 
           data.drwtNo4 && data.drwtNo5 && data.drwtNo6 && 
           data.bnusNo &&
           data.drwNoDate;
  }

  private parseDrawResult(data: any): LottoDrawResult {
    return {
      round: parseInt(data.drwNo),
      date: data.drwNoDate,
      numbers: [
        parseInt(data.drwtNo1),
        parseInt(data.drwtNo2),
        parseInt(data.drwtNo3),
        parseInt(data.drwtNo4),
        parseInt(data.drwtNo5),
        parseInt(data.drwtNo6)
      ].sort((a, b) => a - b),
      bonusNumber: parseInt(data.bnusNo),
      totalSales: data.totSellamnt ? parseInt(data.totSellamnt) : undefined,
      jackpotWinners: data.firstWinamnt ? parseInt(data.firstWinamnt) : undefined,
      jackpotPrize: data.firstPrzwnerCo ? parseInt(data.firstPrzwnerCo) : undefined
    };
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.options.requestDelay) {
      const waitTime = this.options.requestDelay - timeSinceLastRequest;
      console.log(`Rate limiting: ${waitTime}ms 대기 중...`);
      await this.delay(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  private getCachedResult(round: number): LottoDrawResult | null {
    const cached = this.cache.get(round);
    if (cached && Date.now() < cached.expiry) {
      console.log(`캐시에서 데이터 반환 - 회차: ${round}`);
      return cached.data;
    }
    return null;
  }

  private setCachedResult(round: number, data: LottoDrawResult, ttl: number): void {
    this.cache.set(round, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  private getFallbackData(round: number): LottoDrawResult {
    const fallbackResults: { [key: number]: LottoDrawResult } = {
      1177: {
        round: 1177,
        date: '2025-06-21',
        numbers: [3, 7, 15, 16, 19, 43],
        bonusNumber: 21
      },
      1176: {
        round: 1176,
        date: '2025-06-14',
        numbers: [1, 5, 12, 18, 26, 32],
        bonusNumber: 44
      }
    };

    return fallbackResults[round] || fallbackResults[1177];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [round, cache] of this.cache.entries()) {
      if (now > cache.expiry) {
        this.cache.delete(round);
      }
    }
  }

  public getServiceStatus(): { 
    isRateLimited: boolean; 
    cacheSize: number; 
    lastRequestTime: number;
  } {
    return {
      isRateLimited: this.isRateLimited,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime
    };
  }
}

export default LottoCrawler;
