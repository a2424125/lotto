// src/types/lotto.ts
// 로또 관련 타입 정의

export interface LottoDrawResult {
  round: number; // 회차
  date: string; // 추첨일
  numbers: number[]; // 당첨번호 6개
  bonusNumber: number; // 보너스번호
  totalSales?: number; // 총 판매금액
  jackpotWinners?: number; // 1등 당첨자 수
  jackpotPrize?: number; // 1등 당첨금
}

export interface WinnerInfo {
  first: { count: number; prize: number };
  second: { count: number; prize: number };
  third: { count: number; prize: number };
  fourth: { count: number; prize: number };
  fifth: { count: number; prize: number };
}

export interface DetailedLottoResult extends LottoDrawResult {
  winners: WinnerInfo;
  nextJackpot?: number; // 다음회차 예상 당첨금
}

export interface PurchaseItem {
  id: number;
  numbers: number[];
  strategy: string;
  date: string;
  checked: boolean;
  status: "saved" | "favorite" | "checked";
  memo?: string;
  purchaseDate?: string;
}

export interface CheckResult {
  grade: string;
  matches: number;
  bonusMatch: boolean;
  winningNumbers?: number[];
  bonusNumber?: number;
  userNumbers?: number[];
  error?: string;
}

export interface RecommendStrategy {
  name: string;
  numbers: number[];
  grade: string;
  description?: string;
}

// API 응답 타입
export interface LottoAPIResponse {
  success: boolean;
  data?: LottoDrawResult;
  error?: string;
  message?: string;
}

export interface LottoHistoryAPIResponse {
  success: boolean;
  data?: LottoDrawResult[];
  error?: string;
  message?: string;
}
