import React from "react";

interface NumberBallProps {
  number: number;
  size?: "small" | "medium" | "large";
  bonus?: boolean;
}

const NumberBall: React.FC<NumberBallProps> = ({
  number,
  size = "medium",
  bonus = false,
}) => {
  // 동행복권 스타일 색상 매핑
  const getColorClass = (num: number): string => {
    if (num >= 1 && num <= 10) return "yellow";
    if (num >= 11 && num <= 20) return "blue";
    if (num >= 21 && num <= 30) return "red";
    if (num >= 31 && num <= 40) return "gray";
    if (num >= 41 && num <= 45) return "green";
    return "gray";
  };

  // 크기별 스타일
  const getSizeClass = (size: string): string => {
    switch (size) {
      case "small":
        return "ball-small";
      case "large":
        return "ball-large";
      default:
        return "ball-medium";
    }
  };

  const colorClass = getColorClass(number);
  const sizeClass = getSizeClass(size);
  const bonusClass = bonus ? "bonus-ball" : "";

  return (
    <div className={`number-ball ${colorClass} ${sizeClass} ${bonusClass}`}>
      <span className="ball-number">{number}</span>
      {bonus && <span className="bonus-text">보너스</span>}
    </div>
  );
};

export default NumberBall;
