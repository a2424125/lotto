// src/services/lottoDataManager.ts
import {
  LottoDrawResult,
  LottoAPIResponse,
  LottoHistoryAPIResponse,
} from "../types/lotto";

class LottoDataManager {
  private csvData: LottoDrawResult[] = [];
  private isDataLoaded: boolean = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      await this.loadCSVData();
      this.isDataLoaded = true;
    } catch (error) {
      console.error("CSV 로드 실패:", error);
      this.isDataLoaded = false;
    }
  }

  private async loadCSVData(): Promise<void> {
    const response = await fetch("/6_45_Lotto.csv");
    if (!response.ok) throw new Error(`CSV 파일 없음: ${response.status}`);

    const csvContent = await response.text();
    const Papa = await this.getPapaparse();

    const parsed = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    this.csvData = parsed.data
      .filter((row: any) => row.Draw && row.Date && row["Winning Number 1"])
      .map((row: any) => this.convertRowToLottoResult(row))
      .filter((result) => result.round > 0 && result.numbers.length === 6)
      .sort((a, b) => b.round - a.round); // 최신순 정렬

    // ✅ 실제 로드된 데이터 범위 로그
    if (this.csvData.length > 0) {
      const latestRound = this.csvData[0].round;
      const oldestRound = this.csvData[this.csvData.length - 1].round;
      console.log(
        `📊 CSV 데이터 로드 완료: ${latestRound}회 ~ ${oldestRound}회 (총 ${this.csvData.length}개)`
      );
    }
  }

  private async getPapaparse(): Promise<any> {
    if (!(window as any).Papa) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";

      return new Promise((resolve, reject) => {
        script.onload = () => resolve((window as any).Papa);
        script.onerror = () => reject(new Error("Papaparse 로드 실패"));
        document.head.appendChild(script);
      });
    }
    return (window as any).Papa;
  }

  private convertRowToLottoResult(row: any): LottoDrawResult {
    const numbers = [
      row["Winning Number 1"],
      row["2"],
      row["3"],
      row["4"],
      row["5"],
      row["6"],
    ]
      .filter((num) => num && num > 0 && num <= 45)
      .sort((a, b) => a - b);

    let formattedDate = row.Date;
    if (formattedDate && !formattedDate.includes("-")) {
      const date = new Date(formattedDate);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split("T")[0];
      }
    }

    return {
      round: parseInt(row.Draw) || 0,
      date: formattedDate || "",
      numbers: numbers,
      bonusNumber: parseInt(row["Bonus Number"]) || 0,
      jackpotWinners: parseInt(row["Division 1 Winners"]) || 0,
      jackpotPrize: parseInt(row["Division 1 Prize"]) || 0,
    };
  }

  async getLatestResult(): Promise<LottoAPIResponse> {
    if (!this.isDataLoaded) await this.initializeData();

    if (this.csvData.length > 0) {
      return {
        success: true,
        data: this.csvData[0], // 최신 데이터 (정렬된 첫 번째)
        message: `${this.csvData[0].round}회차 당첨번호`,
      };
    } else {
      return {
        success: false,
        data: this.getFallbackData(),
        error: "CSV 데이터 로드 실패",
      };
    }
  }

  async getResultByRound(round: number): Promise<LottoAPIResponse> {
    if (!this.isDataLoaded) await this.initializeData();

    const result = this.csvData.find((data) => data.round === round);

    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false, error: "해당 회차 데이터 없음" };
    }
  }

  async getHistory(count: number = 10): Promise<LottoHistoryAPIResponse> {
    if (!this.isDataLoaded) await this.initializeData();

    const results = this.csvData.slice(0, count);

    if (results.length > 0) {
      return {
        success: true,
        data: results,
        message: `${results.length}회차 데이터 (${results[0].round}~${
          results[results.length - 1].round
        }회차)`,
      };
    } else {
      return {
        success: false,
        data: [this.getFallbackData()],
        error: "CSV 데이터 없음",
      };
    }
  }

  async getNextDrawInfo(): Promise<{
    round: number;
    date: string;
    estimatedJackpot: number;
    daysUntilDraw: number;
  }> {
    if (!this.isDataLoaded) await this.initializeData();

    // ✅ 실제 최신 회차 기반으로 다음 회차 계산
    const latestRound = this.csvData.length > 0 ? this.csvData[0].round : 1178;
    const nextRound = latestRound + 1;
    const nextDate = this.getNextSaturday();
    const daysUntil = this.getDaysUntilNextSaturday();

    console.log(
      `📅 다음 추첨 정보: ${nextRound}회차 (현재 최신: ${latestRound}회차)`
    );

    return {
      round: nextRound,
      date: nextDate,
      estimatedJackpot: 3500000000,
      daysUntilDraw: daysUntil,
    };
  }

  async forceUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      await this.loadCSVData();

      if (this.csvData.length > 0) {
        const latestRound = this.csvData[0].round;
        const oldestRound = this.csvData[this.csvData.length - 1].round;
        return {
          success: true,
          message: `${latestRound}~${oldestRound}회차 (${this.csvData.length}개) 업데이트 완료`,
        };
      } else {
        return {
          success: false,
          message: "CSV 파일에 유효한 데이터가 없습니다",
        };
      }
    } catch (error) {
      return { success: false, message: "CSV 파일 확인 필요" };
    }
  }

  // ✅ 실제 데이터 범위 정보 제공
  getDataRange(): {
    latestRound: number;
    oldestRound: number;
    totalCount: number;
  } {
    if (this.csvData.length === 0) {
      return {
        latestRound: 1178,
        oldestRound: 1178,
        totalCount: 1,
      };
    }

    return {
      latestRound: this.csvData[0].round,
      oldestRound: this.csvData[this.csvData.length - 1].round,
      totalCount: this.csvData.length,
    };
  }

  getServiceStatus() {
    const dataRange = this.getDataRange();

    return {
      lastUpdateTime: new Date(),
      isUpdating: false,
      crawlerStatus: {
        mode: "csv_direct",
        totalRounds: dataRange.totalCount,
        isDataLoaded: this.isDataLoaded,
        latestRound: dataRange.latestRound,
        oldestRound: dataRange.oldestRound,
        dataRange: `${dataRange.latestRound}~${dataRange.oldestRound}회차`,
      },
      nextUpdateIn: 0,
    };
  }

  private getFallbackData(): LottoDrawResult {
    // ✅ 폴백 데이터도 실제 범위에 맞춰 조정
    const dataRange = this.getDataRange();

    return {
      round: dataRange.latestRound,
      date: "2025-06-28",
      numbers: [5, 6, 11, 27, 43, 44],
      bonusNumber: 17,
      jackpotWinners: 12,
      jackpotPrize: 2391608407,
    };
  }

  private getNextSaturday(): string {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay()) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    return nextSaturday.toISOString().split("T")[0];
  }

  private getDaysUntilNextSaturday(): number {
    const now = new Date();
    return (6 - now.getDay()) % 7 || 7;
  }

  public cleanup(): void {
    this.csvData = [];
    this.isDataLoaded = false;
  }
}

export const lottoDataManager = new LottoDataManager();
export default LottoDataManager;
