import React from "react";
import LottoNumberBall from "../shared/LottoNumberBall";

interface DashboardProps {
  pastWinningNumbers: number[][];
  onMenuChange: (menu: string) => void;
  generate1stGradeNumbers: () => number[];
}

const Dashboard: React.FC<DashboardProps> = ({
  pastWinningNumbers,
  onMenuChange,
  generate1stGradeNumbers,
}) => {
  return (
    <div style={{ padding: "12px" }}>
      {/* 다음 추첨 정보 */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #bbf7d0",
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#166534",
            margin: "0 0 4px 0",
          }}
        >
          다음 추첨: 1178회
        </h3>
        <p style={{ color: "#16a34a", margin: "2px 0", fontSize: "14px" }}>
          2025년 6월 28일 (토) 오후 8시 45분
        </p>
        <p style={{ fontSize: "12px", color: "#16a34a", margin: "2px 0" }}>
          예상 1등 당첨금: 35억 2천만원
        </p>
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
    </div>
  );
};

export default Dashboard;
