// src/services/lottoCrawler.ts
// 안전하고 책임감 있는 로또 크롤링 서비스

import { LottoDrawResult, LottoAPIResponse } from '../types/lotto';

interface CrawlerOptions {
  requestDelay: number;      // 요청 간격 (밀리초)
  maxRetries: number;        // 최대 재시도 횟수
  timeout: number;           // 타임아웃 (밀리초)
  userAgent: string;         // User-Agent
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
      requestDelay: 5000,    // 5초 간격
      maxRetries: 3,         // 최대 3회 재시도
      timeout: 10000,        // 10초 타임아웃
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...options
    };
  }

  // 메인 크롤링 함수 - 특정 회차 당첨번호 가져오기
  async getDrawResult(round?: number): Promise<LottoAPIResponse> {
    try {
      // 최신 회차를 먼저 확인
      if (!round) {
        const latestRound = await this.getLatestRoundNumber();
        round = latestRound;
      }

      // 캐시 확인
      const cached = this.getCachedResult(round);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Cached data'
        };
      }

      // Rate limiting 체크
      await this.enforceRateLimit();

      // 실제 크롤링
      const result = await this.crawlWithRetry(round);
      
      if (result) {
        // 캐시에 저장 (1시간 유효)
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
      
      // 폴백 데이터 반환
      const fallbackData = this.getFallbackData(round || 1177);
      return {
        success: false,
        data: fallbackData,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: 'Fallback data used due to crawling failure'
      };
    }
  }

  // 재시도 로직이 포함된 크롤링
  private async crawlWithRetry(round: number): Promise<LottoDrawResult | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        console.log(`크롤링 시도 ${attempt}/${this.options.maxRetries} - 회차: ${round}`);
        
        const result = await this.performCrawl(round);
        if (result) {
          console.log(`크롤링 성공 - 회차: ${round}`);
          return result;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`크롤링 시도 ${attempt} 실패:`, lastError.message);

        // 지수 백오프 (1초, 2초, 4초)
        if (attempt < this.options.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`${delay}ms 후 재시도...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('모든 재시도 실패');
  }

  // 실제 크롤링 수행
  private async performCrawl(round: number): Promise<LottoDrawResult | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      // 동행복권 API 엔드포인트 (비공식)
      const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.options.userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        if (response.status === 429) {
          this.isRateLimited = true;
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 응답 데이터 검증 및 파싱
      if (this.isValidLottoData(data)) {
        return this.parseDrawResult(data);
      } else {
        throw new Error('Invalid data format');
      }

    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 최신 회차 번호 확인
  private async getLatestRoundNumber(): Promise<number> {
    try {
      // 현재 날짜 기준으로 추정
      const now = new Date();
      const startDate = new Date('2002-12-07'); // 로또 시작일
      const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return Math.min(weeksDiff + 1, 1177); // 현재 회차로 제한
    } catch (error) {
      return 1177; // 기본값
    }
  }

  // 응답 데이터 검증
  private isValidLottoData(data: any): boolean {
    return data && 
           data.drwNo && 
           data.drwtNo1 && data.drwtNo2 && data.drwtNo3 && 
           data.drwtNo4 && data.drwtNo5 && data.drwtNo6 && 
           data.bnusNo &&
           data.drwNoDate;
  }

  // 응답 데이터 파싱
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

  // Rate limiting 적용
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

  // 캐시 관리
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

  // 폴백 데이터
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

  // 유틸리티 함수
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 캐시 정리
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [round, cache] of this.cache.entries()) {
      if (now > cache.expiry) {
        this.cache.delete(round);
      }
    }
  }

  // 서비스 상태 확인
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
