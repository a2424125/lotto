// src/services/lottoDataManager.ts
// public 폴더의 CSV 파일을 읽는 로또 데이터 매니저

import { LottoDrawResult, LottoAPIResponse, LottoHistoryAPIResponse } from '../types/lotto';

class LottoDataManager {
  private lastUpdateTime: number = Date.now();
  private isUpdating: boolean = false;
  private csvData: LottoDrawResult[] = [];
  private isDataLoaded: boolean = false;

  constructor() {
    console.log('🎯 로또 데이터 매니저 시작 (CSV 파일 직접 읽기)');
    console.log('📂 CSV 파일 위치: public/6_45_Lotto.csv');
    this.initializeData();
  }

  // CSV 파일에서 데이터 로드
  private async initializeData(): Promise<void> {
    console.log('📂 public 폴더에서 CSV 파일 로딩 중...');
    
    try {
      await this.loadCSVData();
      console.log('✅ CSV 데이터 로딩 완료!');
      console.log(`📊 총 ${this.csvData.length}개 회차 데이터 로드됨`);
      
      if (this.csvData.length > 0) {
        const latest = this.csvData[0];
        console.log(`🎲 최신 ${latest.round}회차 당첨번호:`, 
          latest.numbers.join(', '), '+ 보너스', latest.bonusNumber);
        console.log(`📈 데이터 범위: ${this.csvData[this.csvData.length - 1].round}회 ~ ${latest.round}회`);
      }
      
      this.isDataLoaded = true;
    } catch (error) {
      console.error('❌ CSV 데이터 로딩 실패:', error);
      console.warn('💡 해결 방법: public 폴더에 6_45_Lotto.csv 파일을 복사하세요');
      this.isDataLoaded = false;
    }
  }

  // CSV 파일 읽기 및 파싱
  private async loadCSVData(): Promise<void> {
    try {
      // public 폴더의 CSV 파일 읽기
      const response = await fetch('/6_45_Lotto.csv');
      
      if (!response.ok) {
        throw new Error(`CSV 파일을 찾을 수 없습니다: ${response.status}`);
      }
      
      const csvContent = await response.text();
      console.log('📄 CSV 파일 크기:', Math.round(csvContent.length / 1024), 'KB');
      
      // Papaparse 라이브러리로 CSV 파싱
      const Papa = await this.getPapaparse();
      
      const parsed = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim()
      });

      if (parsed.errors.length > 0) {
        console.warn('⚠️ CSV 파싱 경고:', parsed.errors.slice(0, 3)); // 처음 3개만 표시
      }

      console.log('🔧 CSV 파싱 완료 -', parsed.data.length, '행 처리됨');

      // 데이터 변환 및 정렬
      this.csvData = parsed.data
        .filter((row: any) => row.Draw && row.Date && row['Winning Number 1']) // 유효한 행만
        .map((row: any) => this.convertRowToLottoResult(row))
        .filter(result => result.round > 0 && result.numbers.length === 6) // 완전한 데이터만
        .sort((a, b) => b.round - a.round); // 최신순 정렬

      console.log(`✅ ${this.csvData.length}개 회차 유효한 데이터 변환 완료`);

    } catch (error) {
      console.error('❌ CSV 파일 처리 중 오류:', error);
      throw error;
    }
  }

  // Papaparse 라이브러리 동적 로드
  private async getPapaparse(): Promise<any> {
    try {
      // CDN에서 Papaparse 로드
      if (!(window as any).Papa) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
        
        return new Promise((resolve, reject) => {
          script.onload = () => resolve((window as any).Papa);
          script.onerror = () => reject(new Error('Papaparse 로드 실패'));
          document.head.appendChild(script);
        });
      }
      return (window as any).Papa;
    } catch (error) {
      console.error('Papaparse 로드 실패:', error);
      throw error;
    }
  }

  // CSV 행을 LottoDrawResult로 변환
  private convertRowToLottoResult(row: any): LottoDrawResult {
    // 당첨번호 6개 추출 및 정렬
    const numbers = [
      row['Winning Number 1'],
      row['2'],
      row['3'], 
      row['4'],
      row['5'],
      row['6']
    ].filter(num => num && num > 0 && num <= 45)
     .sort((a, b) => a - b);

    // 날짜 형식 정리 (YYYY-MM-DD)
    let formattedDate = row.Date;
    if (formattedDate && !formattedDate.includes('-')) {
      // 다른 형식의 날짜를 YYYY-MM-DD로 변환
      const date = new Date(formattedDate);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }

    return {
      round: parseInt(row.Draw) || 0,
      date: formattedDate || '',
      numbers: numbers,
      bonusNumber: parseInt(row['Bonus Number']) || 0,
      totalSales: row['Division 1 Prize'] && row['Division 1 Winners'] ? 
        row['Division 1 Prize'] * row['Division 1 Winners'] : undefined,
      jackpotWinners: parseInt(row['Division 1 Winners']) || 0,
      jackpotPrize: parseInt(row['Division 1 Prize']) || 0
    };
  }

  // 최신 당첨번호 가져오기
  async getLatestResult(): Promise<LottoAPIResponse> {
    console.log('📡 최신 당첨번호 요청 처리 중...');

    if (!this.isDataLoaded) {
      await this.initializeData();
    }

    if (this.csvData.length > 0) {
      const latestData = this.csvData[0];
      console.log(`✅ ${latestData.round}회차 당첨번호 반환:`, latestData.numbers.join(', '));
      
      return {
        success: true,
        data: latestData,
        message: `${latestData.round}회차 실제 당첨번호 (CSV 데이터 913회차 분량)`
      };
    } else {
      console.warn('⚠️ CSV 데이터가 없어 폴백 데이터 사용');
      return {
        success: false,
        data: this.getFallbackData(),
        error: 'CSV 데이터 로드 실패',
        message: 'public 폴더에 6_45_Lotto.csv 파일을 복사해주세요'
      };
    }
  }

  // 특정 회차 당첨번호 가져오기
  async getResultByRound(round: number): Promise<LottoAPIResponse> {
    console.log(`🎯 ${round}회차 당첨번호 요청`);

    if (!this.isDataLoaded) {
      await this.initializeData();
    }

    const result = this.csvData.find(data => data.round === round);
    
    if (result) {
      console.log(`✅ ${round}회차 데이터 발견:`, result.numbers.join(', '));
      return {
        success: true,
        data: result,
        message: `${round}회차 실제 당첨번호 (CSV 데이터)`
      };
    } else {
      console.warn(`⚠️ ${round}회차 데이터 없음 (CSV 범위: ${this.getDataRange()})`);
      return {
        success: false,
        error: '해당 회차 데이터 없음',
        message: `${round}회차 데이터가 CSV에 없습니다`
      };
    }
  }

  // 과거 당첨번호 목록 가져오기
  async getHistory(count: number = 10): Promise<LottoHistoryAPIResponse> {
    console.log(`📊 과거 ${count}회차 당첨번호 요청`);

    if (!this.isDataLoaded) {
      await this.initializeData();
    }

    const results = this.csvData.slice(0, count);
    
    if (results.length > 0) {
      console.log(`✅ ${results.length}개 회차 CSV 데이터 반환`);
      console.log('📈 최신 3회차:', 
        results.slice(0, 3).map(r => `${r.round}회차: [${r.numbers.join(',')}]`).join(' | ')
      );
      
      return {
        success: true,
        data: results,
        message: `${results.length}개 회차 실제 당첨번호 (913회차 CSV 데이터)`
      };
    } else {
      console.warn('⚠️ CSV 데이터가 없어 폴백 데이터 사용');
      return {
        success: false,
        data: [this.getFallbackData()],
        error: 'CSV 데이터 없음',
        message: 'public 폴더에 6_45_Lotto.csv 파일을 복사해주세요'
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
    if (!this.isDataLoaded) {
      await this.initializeData();
    }

    let nextRound = 1179; // 기본값
    if (this.csvData.length > 0) {
      nextRound = this.csvData[0].round + 1;
    }
    
    const nextDate = this.getNextSaturday();
    const daysUntil = this.getDaysUntilNextSaturday();
    
    console.log(`🔮 다음 회차 정보: ${nextRound}회차, ${nextDate}, ${daysUntil}일 후`);
    
    return {
      round: nextRound,
      date: nextDate,
      estimatedJackpot: 3500000000,
      daysUntilDraw: daysUntil
    };
  }

  // 수동 데이터 업데이트 (CSV 파일 다시 읽기)
  async forceUpdate(): Promise<{ success: boolean; message: string }> {
    console.log('🔄 CSV 파일 다시 로딩...');
    
    this.isUpdating = true;
    
    try {
      await this.loadCSVData();
      this.lastUpdateTime = Date.now();
      this.isUpdating = false;
      
      console.log('✅ CSV 데이터 업데이트 완료!');
      return {
        success: true,
        message: `✅ ${this.csvData.length}개 회차 CSV 데이터로 업데이트 완료!`
      };
    } catch (error) {
      this.isUpdating = false;
      console.error('❌ CSV 업데이트 실패:', error);
      return {
        success: false,
        message: '⚠️ public/6_45_Lotto.csv 파일을 확인해주세요'
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
    return {
      lastUpdateTime: new Date(this.lastUpdateTime),
      isUpdating: this.isUpdating,
      crawlerStatus: {
        isRateLimited: false,
        cacheSize: this.csvData.length,
        lastRequestTime: this.lastUpdateTime,
        mode: 'csv_file_direct',
        dataSource: 'public_csv_file_913rounds',
        totalRounds: this.csvData.length,
        isDataLoaded: this.isDataLoaded,
        latestRound: this.csvData.length > 0 ? this.csvData[0].round : 0,
        dataRange: this.getDataRange()
      },
      nextUpdateIn: 0
    };
  }

  // 폴백 데이터
  private getFallbackData(): LottoDrawResult {
    return {
      round: 1178,
      date: '2025-06-28',
      numbers: [5, 6, 11, 27, 43, 44],
      bonusNumber: 17,
      jackpotWinners: 12,
      jackpotPrize: 2391608407
    };
  }

  // 유틸리티 메서드들
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

  private getDataRange(): string {
    if (this.csvData.length === 0) return '데이터 없음';
    return `${this.csvData[this.csvData.length - 1].round}회 ~ ${this.csvData[0].round}회`;
  }

  // CSV 데이터 상태 확인
  public getCSVDataStatus(): {
    isLoaded: boolean;
    totalRounds: number;
    latestRound: number;
    oldestRound: number;
    dataRange: string;
  } {
    return {
      isLoaded: this.isDataLoaded,
      totalRounds: this.csvData.length,
      latestRound: this.csvData.length > 0 ? this.csvData[0].round : 0,
      oldestRound: this.csvData.length > 0 ? this.csvData[this.csvData.length - 1].round : 0,
      dataRange: this.getDataRange()
    };
  }

  public cleanup(): void {
    console.log('🧹 LottoDataManager 정리 완료');
    this.csvData = [];
    this.isDataLoaded = false;
  }
}

// 싱글톤 인스턴스
export const lottoDataManager = new LottoDataManager();
export default LottoDataManager;
