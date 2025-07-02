import React, { useState } from "react";

interface MiniGameProps {
  pastWinningNumbers: number[][];
  isDataLoading?: boolean;
  dataStatus?: any;
  roundRange?: {
    latestRound: number;
    oldestRound: number;
  };
}

const MiniGame: React.FC<MiniGameProps> = ({
  pastWinningNumbers,
  isDataLoading = false,
  dataStatus,
  roundRange,
}) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // ✅ 실제 회차 범위 정보 사용
  const actualLatestRound = roundRange?.latestRound || 1178;
  const actualOldestRound = roundRange?.oldestRound || 1178;
  const totalRounds = pastWinningNumbers.length;

  const games = [
    {
      id: "guess",
      name: "번호맞추기",
      desc: "숨겨진 번호를 맞춰보세요",
      emoji: "🎯",
      color: "#3b82f6",
    },
    {
      id: "lucky",
      name: "행운뽑기",
      desc: "오늘의 행운 번호를 뽑아보세요",
      emoji: "🍀",
      color: "#10b981",
    },
    {
      id: "simulation",
      name: "당첨시뮬",
      desc: "가상으로 로또를 구매해보세요",
      emoji: "🎲",
      color: "#8b5cf6",
    },
    {
      id: "quiz",
      name: "로또퀴즈",
      desc: "로또 상식을 테스트해보세요",
      emoji: "🧠",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ padding: "12px" }}>
      {/* 헤더 - 실제 회차 범위 표시 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: "0 0 8px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🎮 로또 미니게임
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>
          재미있는 로또 게임으로 행운을 시험해보세요!
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#059669",
            margin: "0",
            fontWeight: "500",
          }}
        >
          📊 {actualLatestRound}~{actualOldestRound}회차 ({totalRounds}개)
          데이터 기반 게임
        </p>

        {/* 데이터 상태 표시 */}
        {dataStatus && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: dataStatus.isRealTime ? "#059669" : "#d97706",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: dataStatus.isRealTime ? "#10b981" : "#f59e0b",
              }}
            />
            {dataStatus.isRealTime ? "실시간 데이터 연동" : "오프라인 모드"}
          </div>
        )}
      </div>

      {/* 게임 목록 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
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
          🎯 게임 선택
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              disabled={isDataLoading}
              style={{
                padding: "16px",
                borderRadius: "8px",
                border:
                  selectedGame === game.id
                    ? `2px solid ${game.color}`
                    : "1px solid #e5e7eb",
                backgroundColor:
                  selectedGame === game.id ? `${game.color}15` : "white",
                cursor: isDataLoading ? "not-allowed" : "pointer",
                textAlign: "center",
                transition: "all 0.2s",
                boxShadow:
                  selectedGame === game.id
                    ? `0 4px 12px ${game.color}30`
                    : "0 1px 3px rgba(0,0,0,0.1)",
                opacity: isDataLoading ? 0.6 : 1,
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {game.emoji}
              </div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: selectedGame === game.id ? game.color : "#1f2937",
                  margin: "0 0 4px 0",
                }}
              >
                {game.name}
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: "0",
                }}
              >
                {game.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 게임 영역 */}
      {selectedGame ? (
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚧</div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            게임 준비중입니다
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "0 0 16px 0",
              lineHeight: "1.5",
            }}
          >
            선택하신 "
            <strong>{games.find((g) => g.id === selectedGame)?.name}</strong>"
            게임을 개발중입니다.
            <br />
            {actualLatestRound}~{actualOldestRound}회차 ({totalRounds}개)
            데이터를 활용한 재미있는 게임으로 곧 만나보실 수 있습니다! 🎉
          </p>
          <button
            onClick={() => setSelectedGame(null)}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            다른 게임 선택하기
          </button>
        </div>
      ) : (
        /* 게임을 선택하지 않았을 때 */
        <div
          style={{
            backgroundColor: "white",
            padding: "32px 24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            게임을 선택해주세요
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "0 0 16px 0",
            }}
          >
            위에서 원하는 미니게임을 선택하여 즐겨보세요!
          </p>

          {/* 통계 정보 - 실제 데이터 반영 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2563eb",
                  marginBottom: "4px",
                }}
              >
                {games.length}
              </div>
              <div style={{ fontSize: "12px", color: "#1e40af" }}>
                게임 종류
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #bbf7d0",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#059669",
                  marginBottom: "4px",
                }}
              >
                {totalRounds}
              </div>
              <div style={{ fontSize: "12px", color: "#047857" }}>
                회차 데이터
              </div>
            </div>
          </div>

          {/* 실제 회차 범위 정보 박스 */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fefce8",
              borderRadius: "8px",
              border: "1px solid #fef3c7",
            }}
          >
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#92400e",
                margin: "0 0 6px 0",
              }}
            >
              📊 분석 데이터 범위
            </h4>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
                color: "#a16207",
              }}
            >
              <span>
                최신 회차: <strong>{actualLatestRound}회</strong>
              </span>
              <span>
                가장 오래된 회차: <strong>{actualOldestRound}회</strong>
              </span>
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "11px",
                color: "#a16207",
                textAlign: "center",
              }}
            >
              총 <strong>{totalRounds}개</strong> 회차 데이터 보유
            </div>
          </div>

          {/* 게임 개발 예정 알림 */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              🚀 <strong>개발 예정 기능</strong>
              <br />• 실제 {actualLatestRound}~{actualOldestRound}회차 데이터
              기반 게임
              <br />
              • 확률 시뮬레이션 및 패턴 학습 게임
              <br />• 재미있는 인터랙티브 경험 제공
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGame;
