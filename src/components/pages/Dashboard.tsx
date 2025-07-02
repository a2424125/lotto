import React, { useState, useEffect } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";
import { lottoDataManager } from "../../services/lottoDataManager";
import { LottoDrawResult } from "../../types/lotto";

interface DashboardProps {
  pastWinningNumbers: number[][];
  onMenuChange: (menu: string) => void;
  generate1stGradeNumbers: () => number[];
  onRefreshData?: () => void;
  isDataLoading?: boolean;
  dataStatus?: any;
  roundRange?: {
    latestRound: number;
    oldestRound: number;
  };
}

interface NextDrawInfo {
  round: number;
  date: string;
  estimatedJackpot: number;
  daysUntilDraw: number;
  formattedDate: string;
  timeUntilDraw: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  pastWinningNumbers,
  onMenuChange,
  generate1stGradeNumbers,
  onRefreshData,
  isDataLoading = false,
  dataStatus,
  roundRange,
}) => {
  // ✅ 추가: 총 회차수 계산 - 동적으로 변경되는 핵심 변수
  const totalRounds = pastWinningNumbers.length;

  // 실제 회차 범위 정보
  const actualLatestRound = roundRange?.latestRound || 1178;
  const actualOldestRound = roundRange?.oldestRound || 1178;

  const [nextDrawInfo, setNextDrawInfo] = useState<NextDrawInfo | null>(null);
  const [isLoadingNextDraw, setIsLoadingNextDraw] = useState(true);
  const [latestResult, setLatestResult] = useState<LottoDrawResult | null>(
    null
  );
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadNextDrawInfo();
    loadLatestResult();

    // 매 시간마다 업데이트
    const interval = setInterval(() => {
      loadNextDrawInfo();
      loadLatestResult();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // pastWinningNumbers가 변경될 때마다 최신 결과 업데이트
  useEffect(() => {
    if (pastWinningNumbers.length > 0) {
      loadLatestResult();
    }
  }, [pastWinningNumbers]);

  // 최신 당첨 결과 로드
  const loadLatestResult = async () => {
    try {
      setIsLoadingLatest(true);
      const response = await lottoDataManager.getLatestResult();

      if (response.success && response.data) {
        setLatestResult(response.data);
        console.log("📊 최신 당첨 결과 로드:", response.data.round, "회차");
      } else {
        console.warn("⚠️ 최신 당첨 결과 로드 실패, 폴백 사용");
        // 폴백: pastWinningNumbers에서 추정
        if (pastWinningNumbers.length > 0) {
          setLatestResult({
            round: actualLatestRound, // 실제 최신 회차 사용
            date: "2025-06-28", // 기본값
            numbers: pastWinningNumbers[0].slice(0, 6),
            bonusNumber: pastWinningNumbers[0][6],
            jackpotWinners: 6,
            jackpotPrize: 4576672000,
          });
        }
      }
    } catch (error) {
      console.error("❌ 최신 당첨 결과 로드 실패:", error);
    } finally {
      setIsLoadingLatest(false);
    }
  };

  // 다음 추첨 정보 로드
  const loadNextDrawInfo = async () => {
    try {
      setIsLoadingNextDraw(true);
      const info = await lottoDataManager.getNextDrawInfo();

      // 날짜 포맷팅
      const date = new Date(info.date);
      const formattedDate = formatKoreanDate(date);
      const timeUntilDraw = getTimeUntilDraw(info.daysUntilDraw);

      setNextDrawInfo({
        ...info,
        formattedDate,
        timeUntilDraw,
      });

      console.log("📅 다음 추첨 정보 업데이트:", formattedDate);
    } catch (error) {
      console.error("❌ 다음 추첨 정보 로드 실패:", error);

      // 폴백 정보 - 실제 최신 회차 기반으로 계산
      setNextDrawInfo({
        round: actualLatestRound + 1, // 실제 최신 회차 + 1
        date: getNextSaturday(),
        estimatedJackpot: 3500000000,
        daysUntilDraw: getDaysUntilNextSaturday(),
        formattedDate: formatKoreanDate(new Date(getNextSaturday())),
        timeUntilDraw: getTimeUntilDraw(getDaysUntilNextSaturday()),
      });
    } finally {
      setIsLoadingNextDraw(false);
    }
  };

  // 수동 새로고침 (강화됨)
  const handleRefresh = async () => {
    setIsLoadingNextDraw(true);
    setIsLoadingLatest(true);

    try {
      // 상위 컴포넌트의 새로고침 호출
      if (onRefreshData) {
        await onRefreshData();
      }

      // 로컬 데이터도 새로고침
      await Promise.all([loadNextDrawInfo(), loadLatestResult()]);

      console.log("✅ Dashboard 데이터 새로고침 완료");
    } catch (error) {
      console.error("❌ Dashboard 새로고침 실패:", error);
    }
  };

  // 한국어 날짜 포맷팅
  const formatKoreanDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

    return `${year}년 ${month}월 ${day}일 (${weekday}) 오후 8시 45분`;
  };

  // 한국어 날짜 포맷팅 (당첨결과용)
  const formatResultDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}년 ${month}월 ${day}일 추첨`;
    } catch {
      return dateStr;
    }
  };

  // 추첨까지 남은 시간 텍스트
  const getTimeUntilDraw = (daysUntil: number): string => {
    if (daysUntil === 0) return "오늘 추첨!";
    if (daysUntil === 1) return "내일 추첨!";
    return `${daysUntil}일 후 추첨`;
  };

  // 다음 토요일 계산
  const getNextSaturday = (): string => {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay()) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);

    return nextSaturday.toISOString().split("T")[0];
  };

  // 다음 토요일까지 남은 일수
  const getDaysUntilNextSaturday = (): number => {
    const now = new Date();
    return (6 - now.getDay()) % 7 || 7;
  };

  // 상금 포맷팅 (억 단위)
  const formatPrize = (amount: number): string => {
    const eok = Math.floor(amount / 100000000);
    const cheon = Math.floor((amount % 100000000) / 10000000);

    if (cheon > 0) {
      return `${eok}억 ${cheon}천만원`;
    } else {
      return `${eok}억원`;
    }
  };

  return (
    <div style={{ padding: "12px" }}>
      {/* 다음 추첨 정보 - 동적 업데이트 */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #bbf7d0",
          marginBottom: "12px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {nextDrawInfo ? (
          <>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#166534",
                margin: "0 0 4px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              다음 추첨: {nextDrawInfo.round}회
              {nextDrawInfo.daysUntilDraw <= 1 && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    borderRadius: "4px",
                    animation: "pulse 2s infinite",
                  }}
                >
                  {nextDrawInfo.daysUntilDraw === 0 ? "오늘!" : "내일!"}
                </span>
              )}
            </h3>
            <p style={{ color: "#16a34a", margin: "2px 0", fontSize: "14px" }}>
              {nextDrawInfo.formattedDate}
            </p>
            <p style={{ fontSize: "12px", color: "#16a34a", margin: "2px 0" }}>
              예상 1등 당첨금: {formatPrize(nextDrawInfo.estimatedJackpot)}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#059669",
                margin: "4px 0 0 0",
                fontWeight: "bold",
              }}
            >
              ⏰ {nextDrawInfo.timeUntilDraw}
            </p>
          </>
        ) : (
          <div style={{ padding: "16px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                border: "2px solid #bbf7d0",
                borderTop: "2px solid #166534",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 8px",
              }}
            />
            <p style={{ color: "#16a34a", margin: "0", fontSize: "12px" }}>
              다음 추첨 정보 로딩 중...
            </p>
          </div>
        )}
      </div>

      {/* 최신 당첨결과 - 동적 업데이트 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          {latestResult ? (
            <>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 4px 0",
                }}
              >
                {latestResult.round}회 당첨결과
                {isLoadingLatest && (
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    ⏳
                  </span>
                )}
              </h2>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
                ({formatResultDate(latestResult.date)})
              </p>
            </>
          ) : (
            <>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 4px 0",
                }}
              >
                당첨결과 로딩 중...
              </h2>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #e5e7eb",
                  borderTop: "2px solid #2563eb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "8px auto",
                }}
              />
            </>
          )}
        </div>

        {/* 당첨번호 + 보너스 번호 일렬 배치 */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              margin: "0 0 8px 0",
            }}
          >
            당첨번호
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {/* 당첨번호 6개 */}
            {pastWinningNumbers[0].slice(0, 6).map((num, i) => (
              <LottoNumberBall key={i} number={num} size="md" />
            ))}

            {/* 플러스 기호 */}
            <span
              style={{ fontSize: "16px", color: "#9ca3af", margin: "0 4px" }}
            >
              +
            </span>

            {/* 보너스 번호 */}
            <LottoNumberBall
              number={pastWinningNumbers[0][6]}
              isBonus={true}
              size="md"
            />
          </div>
          <p
            style={{
              fontSize: "10px",
              color: "#9ca3af",
              margin: "6px 0 0 0",
            }}
          >
            마지막 번호는 보너스 번호입니다
          </p>
        </div>

        {/* 당첨 통계 정보 (선택적) */}
        {latestResult && latestResult.jackpotWinners && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              backgroundColor: "#f8fafc",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                fontSize: "11px",
                color: "#6b7280",
              }}
            >
              <span>🏆 1등 {latestResult.jackpotWinners}명</span>
              {latestResult.jackpotPrize && (
                <span>
                  💰 {Math.round(latestResult.jackpotPrize / 100000000)}억원
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ AI 추천 미리보기 - 동적 회차 표시 */}
      <div
        style={{
          backgroundColor: "#eff6ff",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
          marginBottom: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1e40af",
              margin: "0 0 6px 0",
            }}
          >
            AI 빅데이터 완벽분석
          </h3>
          <p
            style={{ color: "#2563eb", fontSize: "12px", margin: "0 0 12px 0" }}
          >
            확률: 1/8,145,060 | 상금: 약 20억원
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          {generate1stGradeNumbers().map((num, i) => (
            <LottoNumberBall key={i} number={num} size="sm" />
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              margin: "0",
              lineHeight: "1.4",
            }}
          >
            🧠 AI가 {actualLatestRound}~{actualOldestRound}회차 ({totalRounds}
            개) 데이터를 분석한 추천번호입니다
          </p>
        </div>
        <button
          onClick={() => onMenuChange("recommend")}
          style={{
            width: "100%",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 0",
            borderRadius: "6px",
            border: "none",
            fontWeight: "500",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          모든 등급별 추천번호 보기 →
        </button>
      </div>

      {/* 메뉴 버튼들 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => onMenuChange("recommend")}
          style={{
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            padding: "16px 8px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>🎯</div>
          <p
            style={{
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0",
              fontSize: "14px",
            }}
          >
            번호추천
          </p>
          <p
            style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}
          >
            AI 분석
          </p>
        </button>

        <button
          onClick={() => onMenuChange("minigame")}
          style={{
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            padding: "16px 8px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>🎮</div>
          <p
            style={{
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0",
              fontSize: "14px",
            }}
          >
            미니게임
          </p>
          <p
            style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}
          >
            재미있는 게임
          </p>
        </button>
      </div>

      {/* 당첨 확률 안내 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: "0 0 12px 0",
          }}
        >
          당첨 확률 안내
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            {
              name: "1등",
              desc: "6개 번호 일치",
              probability: "1/8,145,060",
              prize: "약 20억원",
            },
            {
              name: "2등",
              desc: "5개 번호 + 보너스 일치",
              probability: "1/1,357,510",
              prize: "약 6천만원",
            },
            {
              name: "3등",
              desc: "5개 번호 일치",
              probability: "1/35,724",
              prize: "약 150만원",
            },
            {
              name: "4등",
              desc: "4개 번호 일치",
              probability: "1/733",
              prize: "5만원",
            },
            {
              name: "5등",
              desc: "3개 번호 일치",
              probability: "1/45",
              prize: "5천원",
            },
          ].map((info, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                backgroundColor: "#f9fafb",
                borderRadius: "4px",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: "500",
                    color: "#1f2937",
                    fontSize: "14px",
                  }}
                >
                  {info.name}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginLeft: "6px",
                  }}
                >
                  ({info.desc})
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#2563eb",
                    margin: "0",
                  }}
                >
                  {info.probability}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    margin: "1px 0 0 0",
                  }}
                >
                  {info.prize}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: "10px",
            color: "#6b7280",
            marginTop: "8px",
            textAlign: "center",
            margin: "8px 0 0 0",
          }}
        >
          ※ 확률이 높을수록 당첨 가능성이 큽니다
        </p>
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
