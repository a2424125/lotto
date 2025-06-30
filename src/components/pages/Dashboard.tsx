import React, { useState, useEffect } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";
import { lottoDataManager } from "../../services/lottoDataManager";

interface DashboardProps {
  pastWinningNumbers: number[][];
  onMenuChange: (menu: string) => void;
  generate1stGradeNumbers: () => number[];
  onRefreshData?: () => void;
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
  onRefreshData
}) => {
  const [nextDrawInfo, setNextDrawInfo] = useState<NextDrawInfo | null>(null);
  const [isLoadingNextDraw, setIsLoadingNextDraw] = useState(true);

  // 컴포넌트 마운트 시 다음 추첨 정보 로드
  useEffect(() => {
    loadNextDrawInfo();
    
    // 매 시간마다 다음 추첨 정보 업데이트
    const interval = setInterval(loadNextDrawInfo, 60 * 60 * 1000); // 1시간마다
    
    return () => clearInterval(interval);
  }, []);

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
        timeUntilDraw
      });
      
      console.log('📅 다음 추첨 정보 업데이트:', formattedDate);
    } catch (error) {
      console.error('❌ 다음 추첨 정보 로드 실패:', error);
      
      // 폴백 정보
      setNextDrawInfo({
        round: 1179,
        date: getNextSaturday(),
        estimatedJackpot: 3500000000,
        daysUntilDraw: getDaysUntilNextSaturday(),
        formattedDate: formatKoreanDate(new Date(getNextSaturday())),
        timeUntilDraw: getTimeUntilDraw(getDaysUntilNextSaturday())
      });
    } finally {
      setIsLoadingNextDraw(false);
    }
  };

  // 한국어 날짜 포맷팅
  const formatKoreanDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday}) 오후 8시 45분`;
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
    
    return nextSaturday.toISOString().split('T')[0];
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
          position: "relative"
        }}
      >
        {/* 새로고침 버튼 */}
        <button
          onClick={loadNextDrawInfo}
          disabled={isLoadingNextDraw}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(22, 101, 52, 0.1)",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "10px",
            color: "#166534",
            cursor: isLoadingNextDraw ? "not-allowed" : "pointer",
            opacity: isLoadingNextDraw ? 0.6 : 1
          }}
        >
          {isLoadingNextDraw ? "⏳" : "🔄"}
        </button>

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
                gap: "8px"
              }}
            >
              다음 추첨: {nextDrawInfo.round}회
              {nextDrawInfo.daysUntilDraw <= 1 && (
                <span style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "4px",
                  animation: "pulse 2s infinite"
                }}>
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
            <p style={{ 
              fontSize: "11px", 
              color: "#059669", 
              margin: "4px 0 0 0",
              fontWeight: "bold"
            }}>
              ⏰ {nextDrawInfo.timeUntilDraw}
            </p>
          </>
        ) : (
          <div style={{ padding: "16px" }}>
            <div style={{
              width: "24px",
              height: "24px",
              border: "2px solid #bbf7d0",
              borderTop: "2px solid #166534",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 8px"
            }} />
            <p style={{ color: "#16a34a", margin: "0", fontSize: "12px" }}>
              다음 추첨 정보 로딩 중...
            </p>
          </div>
        )}
      </div>

      {/* 1177회차 당첨결과 */}
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
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 4px 0",
            }}
          >
            1177회 당첨결과
          </h2>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
            (2025년 06월 21일 추첨)
          </p>
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
      </div>

      {/* AI 추천 미리보기 */}
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
            1등 당첨 추천번호
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
          onClick={() => onMenuChange("check")}
          style={{
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            padding: "16px 8px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>✅</div>
          <p
            style={{
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0",
              fontSize: "14px",
            }}
          >
            당첨확인
          </p>
          <p
            style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}
          >
            즉시 확인
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
