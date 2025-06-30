import React from "react";

interface StatsProps {
  pastWinningNumbers: number[][];
}

const Stats: React.FC<StatsProps> = ({ pastWinningNumbers }) => {
  return (
    <div style={{ padding: "12px" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: "0 0 8px 0",
          }}
        >
          📊 통계분석
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
          개발 중입니다...
        </p>
      </div>
    </div>
  );
};

export default Stats;
