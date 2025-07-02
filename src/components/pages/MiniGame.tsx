import React, { useState } from "react";

interface MiniGameProps {
  pastWinningNumbers: number[][];
  isDataLoading?: boolean;
  dataStatus?: any;
}

const MiniGame: React.FC<MiniGameProps> = ({
  pastWinningNumbers,
  isDataLoading = false,
  dataStatus,
}) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

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
      {/* 헤더 */}
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
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
          재미있는 로또 게임으로 행운을 시험해보세요!
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
            <br />곧 만나보실 수 있습니다! 🎉
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

          {/* 통계 정보 */}
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
                {pastWinningNumbers.length}
              </div>
              <div style={{ fontSize: "12px", color: "#047857" }}>
                회차 데이터
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGame;
