import React from "react";

interface LottoNumberBallProps {
  number: number;
  isBonus?: boolean;
  size?: "sm" | "md" | "lg";
  isMatched?: boolean;
}

const LottoNumberBall: React.FC<LottoNumberBallProps> = ({
  number,
  isBonus = false,
  size = "md",
  isMatched = false,
}) => {
  // 동행복권 실제 색상
  const getNumberColor = (num: number): string => {
    if (isBonus) return "#ef4444"; // 빨강 (보너스)
    if (isMatched) return "#eab308"; // 노랑 (매치)
    if (num <= 10) return "#eab308"; // 노랑 (1-10)
    if (num <= 20) return "#3b82f6"; // 파랑 (11-20)
    if (num <= 30) return "#ef4444"; // 빨강 (21-30)
    if (num <= 40) return "#6b7280"; // 회색 (31-40)
    return "#10b981"; // 초록 (41-45)
  };

  // 화면 크기에 따른 반응형 크기
  const sizeStyles = {
    sm: { width: "28px", height: "28px", fontSize: "12px" },
    md: { width: "32px", height: "32px", fontSize: "13px" },
    lg: { width: "36px", height: "36px", fontSize: "14px" },
  };

  return (
    <div
      style={{
        ...sizeStyles[size],
        borderRadius: "50%",
        backgroundColor: getNumberColor(number),
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        margin: "1px",
        flexShrink: 0,
      }}
    >
      {number}
    </div>
  );
};

export default LottoNumberBall;
