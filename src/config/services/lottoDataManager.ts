// src/services/lottoDataManager.ts
// 로또 데이터 통합 관리 서비스

import LottoCrawler from './lottoCrawler';
import { LottoDrawResult, LottoAPIResponse, LottoHistoryAPIResponse } from '../types/lotto';

class LottoDataManager {
  private crawler: LottoCrawler;
  private updateInterval: number = 30 * 60 * 1000; // 30분마다 업데이트
  private lastUpdateTime: number = 0;
  private isUpdating: boolean = false;

  constructor() {
    this.crawler = new LottoCrawler({
      requestDelay: 5000,  // 5초 간격
      maxRetries: 3,       // 최대 3회 재시도
      timeout: 15000       // 15초 타임아웃
    });

    // 페이지 로드 시 한 번 업데이트
    this.initializeData();
    
    // 주기적 업데이트 설정
    this.scheduleUpdates();
  }

  // 초기 데이터 로드
  private async initializeData(): Promise<void> {
    console.log('로또 데이터 초기화 시작...');
    try {
      await this.updateLatestData();
      console.log('로또 데이터 초기화 완료');
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    }
  }

  // 최신 당첨번호 가져오기
  async getLatestResult(): Promise<LottoAPIResponse> {
    // 최근 업데이트가 30분 이내면 캐시된 데이터 사용
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateInterval && !this.isUpdating) {
      console.log('캐시된 최신 데이터 사용');
    } else {
      await this.updateLatestData();
    }

    return await this.crawler.getDrawResult();
  }

  // 특정 회차 당첨번호 가져오기
  async getResultByRound(round: number): Promise<LottoAPIResponse> {
    return await this.crawler.getDrawResult(round);
  }

  // 과거 당첨번호 목록 가져오기 (배치 처리)
  async getHistory(count: number = 10): Promise<LottoHistoryAPIResponse> {
    try {
      console.log(`과거 ${count}회차 데이터 가져오기 시작...`);
      
      const results: LottoDrawResult[] = [];
      const latestResult = await this.getLatestResult();
      
      if (latestResult.success && latestResult.data) {
        const latestRound = latestResult.data.round;
        
        // 배치 처리로 과거 데이터 수집 (병렬 처리 제한)
        const batchSize = 3; // 동시에 3개씩만 요청
        for (let i = 0; i < count; i += batchSize) {
          const batch: Promise<LottoAPIResponse>[] = [];
          
          for (let j = 0; j < batchSize && i + j < count; j++) {
            const round = latestRound - (i + j);
            batch.push(this.getResultByRound(round));
          }

          // 배치 실행
          const batchResults = await Promise.allSettled(batch);
          
          for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value.success && result.value.data) {
              results.push(result.value.data);
            }
          }

          // 배치 간 딜레이 (서버 부하 방지)
          if (i + batchSize < count) {
            console.log(`배치 완료, 3초 대기 중... (${i + batchSize}/${count})`);
            await this.delay(3000);
          }
        }

        // 회차순으로 정렬
        results.sort((a, b) => b.round - a.round);

        return {
          success: true,
          data: results,
          message: `${results.length}개 회차 데이터 수집 완료`
        };
      }

      throw new Error('최신 데이터를 가져올 수 없음');

    } catch (error) {
      console.error('과거 데이터 수집 실패:', error);
      
      // 폴백: 하드코딩된 데이터 반환
      return {
        success: false,
        data: this.getFallbackHistoryData(count),
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '폴백 데이터 사용'
      };
    }
  }

  // 다음 회차 정보 계산
  async getNextDrawInfo(): Promise<{
    round: number;
    date: string;
    estimatedJackpot: number;
    daysUntilDraw: number;
  }> {
    try {
      const latestResult = await this.getLatestResult();
      
      if (latestResult.success && latestResult.data) {
        const nextRound = latestResult.data.round + 1;
        const nextDate = this.getNextSaturday();
        const daysUntil = this.getDaysUntilNextSaturday();
        
        return {
          round: nextRound,
          date: nextDate,
          estimatedJackpot: 3500000000, // 35억 (추정)
          daysUntilDraw: daysUntil
        };
      }
    } catch (error) {
      console.error('다음 회차 정보 계산 실패:', error);
    }

    // 폴백
    return {
      round: 1178,
      date: '2025-06-28',
      estimatedJackpot: 3500000000,
      daysUntilDraw: this.getDaysUntilNextSaturday()
    };
  }

  // 수동 데이터 업데이트 (관리자용)
  async forceUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('수동 데이터 업데이트 시작...');
      this.lastUpdateTime = 0; // 캐시 무효화
      await this.updateLatestData();
      
      return {
        success: true,
        message: '데이터 업데이트 완료'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '업데이트 실패'
      };
    }
  }

  // 서비스 상태 정보
  getServiceStatus(): {
    lastUpdateTime: Date;
    isUpdating: boolean;
    crawlerStatus: any;
    nextUpdateIn: number;
  } {
    const crawlerStatus = this.crawler.getServiceStatus();
    const nextUpdateIn = Math.max(0, this.updateInterval - (Date.now() - this.lastUpdateTime));

    return {
      lastUpdateTime: new Date(this.lastUpdateTime),
      isUpdating: this.isUpdating,
      crawlerStatus,
      nextUpdateIn: Math.floor(nextUpdateIn / 1000) // 초 단위
    };
  }

  // Private 메서드들
  private async updateLatestData(): Promise<void> {
    if (this.isUpdating) {
      console.log('이미 업데이트 중...');
      return;
    }

    this.isUpdating = true;
    try {
      console.log('최신 데이터 업데이트 중...');
      await this.crawler.getDrawResult(); // 최신 데이터 가져오기
      this.lastUpdateTime = Date.now();
      console.log('최신 데이터 업데이트 완료');
    } finally {
      this.isUpdating = false;
    }
  }

  private scheduleUpdates(): void {
    // 30분마다 자동 업데이트
    setInterval(async () => {
      if (!this.isUpdating) {
        try {
          await this.updateLatestData();
        } catch (error) {
          console.error('주기적 업데이트 실패:', error);
        }
      }
    }, this.updateInterval);

    // 캐시 정리 (1시간마다)
    setInterval(() => {
      this.crawler.clearExpiredCache();
    }, 60 * 60 * 1000);
  }

  private getNextSaturday(): string {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay()) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    
    return nextSaturday.toISOString().split('T')[0];
  }

  private getDaysUntilNextSaturday(): number {
    const now = new Date();
    return (6 - now.getDay()) % 7 || 7;
  }

  private getFallbackHistoryData(count: number): LottoDrawResult[] {
    const fallbackData: LottoDrawResult[] = [
      {
        round: 1177,
        date: '2025-06-21',
        numbers: [3, 7, 15, 16, 19, 43],
        bonusNumber: 21
      },
      {
        round: 1176,
        date: '2025-06-14',
        numbers: [1, 5, 12, 18, 26, 32],
        bonusNumber: 44
      },
      {
        round: 1175,
        date: '2025-06-07',
        numbers: [3, 7, 15, 22, 28, 35],
        bonusNumber: 41
      },
      {
        round: 1174,
        date: '2025-05-31',
        numbers: [2, 9, 14, 21, 27, 33],
        bonusNumber: 45
      },
      {
        round: 1173,
        date: '2025-05-24',
        numbers: [4, 11, 17, 24, 31, 38],
        bonusNumber: 42
      }
    ];

    return fallbackData.slice(0, count);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 정리 함수 (컴포넌트 언마운트 시 호출)
  public cleanup(): void {
    // 진행 중인 요청들 정리
    console.log('LottoDataManager 정리 중...');
  }
}

// 싱글톤 인스턴스
export const lottoDataManager = new LottoDataManager();
export default LottoDataManager;
