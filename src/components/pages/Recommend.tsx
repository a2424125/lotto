import React, { useState } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";

interface RecommendProps {
  pastWinningNumbers: number[][];
  onAddToPurchaseHistory: (numbers: number[], strategy: string) => void;
}

interface Strategy {
  name: string;
  numbers: number[];
}

const Recommend: React.FC<RecommendProps> = ({
  pastWinningNumbers,
  onAddToPurchaseHistory,
}) => {
  const [activeGrade, setActiveGrade] = useState("1");
  const [recommendedNumbers, setRecommendedNumbers] = useState<{
    [key: string]: Strategy[];
  }>({});
  const [loading, setLoading] = useState(false);

  // 당첨 등급별 확률 및 전략
  const gradeInfo: { [key: string]: any } = {
    "1": {
      name: "1등",
      desc: "6개 번호 일치",
      probability: "1/8,145,060",
      prize: "약 20억원",
      strategy: "완벽 분석 (6개 모두 적중 목표)",
    },
    "2": {
      name: "2등",
      desc: "5개 번호 + 보너스 일치",
      probability: "1/1,357,510",
      prize: "약 6천만원",
      strategy: "고빈도 + 보너스 고려",
    },
    "3": {
      name: "3등",
      desc: "5개 번호 일치",
      probability: "1/35,724",
      prize: "약 150만원",
      strategy: "균형 분석 (5개 적중 목표)",
    },
    "4": {
      name: "4등",
      desc: "4개 번호 일치",
      probability: "1/733",
      prize: "5만원",
      strategy: "패턴 분석 (4개 적중 목표)",
    },
    "5": {
      name: "5등",
      desc: "3개 번호 일치",
      probability: "1/45",
      prize: "5천원",
      strategy: "확률 중심 (3개 적중 목표)",
    },
  };

  // 가장 많이 나온 번호 분석
  const getMostFrequentNumbers = () => {
    const frequency: { [key: number]: number } = {};
    pastWinningNumbers.forEach((numbers) => {
      numbers.slice(0, 6).forEach((num) => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([num]) => parseInt(num));
  };

  // 1등 전용 번호 생성
  const generate1stGradeNumbers = () => {
    const frequent = getMostFrequentNumbers().slice(0, 12);
    const numbers = new Set<number>();

    while (numbers.size < 4) {
      numbers.add(frequent[Math.floor(Math.random() * 8)]);
    }

    while (numbers.size < 6) {
      const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34];
      const candidate = fibonacci[Math.floor(Math.random() * fibonacci.length)];
      if (candidate <= 45) {
        numbers.add(candidate);
      } else {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 2등 전용 번호 생성
  const generate2ndGradeNumbers = () => {
    const frequent = getMostFrequentNumbers().slice(0, 15);
    const numbers = new Set<number>();
    const bonusCandidates = [21, 15, 7, 19, 43];

    while (numbers.size < 3) {
      numbers.add(frequent[Math.floor(Math.random() * 10)]);
    }

    if (Math.random() > 0.5) {
      numbers.add(
        bonusCandidates[Math.floor(Math.random() * bonusCandidates.length)]
      );
    }

    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 3등 전용 번호 생성
  const generate3rdGradeNumbers = () => {
    const frequent = getMostFrequentNumbers().slice(0, 20);
    const numbers = new Set<number>();

    while (numbers.size < 3) {
      numbers.add(frequent[Math.floor(Math.random() * 10)]);
    }

    while (numbers.size < 5) {
      numbers.add(frequent[Math.floor(Math.random() * frequent.length)]);
    }

    numbers.add(Math.floor(Math.random() * 45) + 1);

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 4등 전용 번호 생성
  const generate4thGradeNumbers = () => {
    const numbers = new Set<number>();
    const start = Math.floor(Math.random() * 35) + 1;
    numbers.add(start);
    numbers.add(start + 1);

    const patterns = [7, 14, 21, 28, 35, 42];
    while (numbers.size < 4) {
      numbers.add(patterns[Math.floor(Math.random() * patterns.length)]);
    }

    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 5등 전용 번호 생성
  const generate5thGradeNumbers = () => {
    const numbers = new Set<number>();
    const popular = [1, 7, 14, 21, 28, 35, 42];

    while (numbers.size < 3) {
      numbers.add(popular[Math.floor(Math.random() * popular.length)]);
    }

    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 당첨 등급별 특화 번호 생성
  const generateGradeSpecificNumbers = (grade: string): Strategy[] => {
    const strategies: Strategy[] = [];

    switch (grade) {
      case "1":
        strategies.push(
          { name: "AI 완벽분석", numbers: generate1stGradeNumbers() },
          { name: "황금비율 조합", numbers: generate1stGradeNumbers() },
          { name: "대박 패턴", numbers: generate1stGradeNumbers() },
          { name: "빅데이터 분석", numbers: generate1stGradeNumbers() },
          { name: "프리미엄 조합", numbers: generate1stGradeNumbers() }
        );
        break;
      case "2":
        strategies.push(
          { name: "보너스 고려", numbers: generate2ndGradeNumbers() },
          { name: "고빈도 분석", numbers: generate2ndGradeNumbers() },
          { name: "5+보너스 전략", numbers: generate2ndGradeNumbers() },
          { name: "패턴 매칭", numbers: generate2ndGradeNumbers() },
          { name: "확률 최적화", numbers: generate2ndGradeNumbers() }
        );
        break;
      case "3":
        strategies.push(
          { name: "5개 적중 분석", numbers: generate3rdGradeNumbers() },
          { name: "균형 전략", numbers: generate3rdGradeNumbers() },
          { name: "구간 분산", numbers: generate3rdGradeNumbers() },
          { name: "중빈도 조합", numbers: generate3rdGradeNumbers() },
          { name: "안정 추천", numbers: generate3rdGradeNumbers() }
        );
        break;
      case "4":
        strategies.push(
          { name: "4개 적중 전략", numbers: generate4thGradeNumbers() },
          { name: "연속 패턴", numbers: generate4thGradeNumbers() },
          { name: "기본 분석", numbers: generate4thGradeNumbers() },
          { name: "인기 조합", numbers: generate4thGradeNumbers() },
          { name: "패턴 분석", numbers: generate4thGradeNumbers() }
        );
        break;
      case "5":
        strategies.push(
          { name: "3개 적중 전략", numbers: generate5thGradeNumbers() },
          { name: "확률 중심", numbers: generate5thGradeNumbers() },
          { name: "랜덤 플러스", numbers: generate5thGradeNumbers() },
          { name: "행운 번호", numbers: generate5thGradeNumbers() },
          { name: "입문자 추천", numbers: generate5thGradeNumbers() }
        );
        break;
      default:
        strategies.push({
          name: "기본 추천",
          numbers: generate1stGradeNumbers(),
        });
    }

    return strategies;
  };

  // 추천 번호 생성
  const generateRecommendations = (grade: string) => {
    setLoading(true);
    setTimeout(() => {
      const strategies = generateGradeSpecificNumbers(grade);
      setRecommendedNumbers((prev) => ({
        ...prev,
        [grade]: strategies,
      }));
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ padding: "12px" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
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
          당첨 등급별 번호 추천
        </h2>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
          원하는 당첨 등급을 선택하여 맞춤 번호를 받아보세요
        </p>

        {/* 등급 선택 버튼들 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          {Object.entries(gradeInfo).map(([grade, info]) => (
            <button
              key={grade}
              onClick={() => setActiveGrade(grade)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                textAlign: "left",
                border:
                  activeGrade === grade
                    ? "2px solid #3b82f6"
                    : "2px solid #e5e7eb",
                backgroundColor: activeGrade === grade ? "#eff6ff" : "white",
                cursor: "pointer",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: activeGrade === grade ? "#2563eb" : "#1f2937",
                  }}
                >
                  {info.name}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    backgroundColor:
                      activeGrade === grade ? "#dbeafe" : "#f3f4f6",
                    color: activeGrade === grade ? "#1d4ed8" : "#6b7280",
                    marginLeft: "8px",
                  }}
                >
                  {info.desc}
                </span>
              </div>
              <div style={{ marginTop: "4px", fontSize: "12px" }}>
                <span
                  style={{
                    fontWeight: "500",
                    color: activeGrade === grade ? "#2563eb" : "#6b7280",
                  }}
                >
                  확률: {info.probability}
                </span>
                <span
                  style={{
                    fontWeight: "500",
                    color: activeGrade === grade ? "#2563eb" : "#6b7280",
                    marginLeft: "12px",
                  }}
                >
                  상금: {info.prize}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => generateRecommendations(activeGrade)}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {loading
              ? `${gradeInfo[activeGrade].name} 분석중...`
              : `${gradeInfo[activeGrade].name} 추천번호 5개 생성`}
          </button>
        </div>
      </div>

      {/* 추천 결과 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          ></div>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            {gradeInfo[activeGrade].name} 맞춤 번호를 분석중입니다...
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(recommendedNumbers[activeGrade] || []).map((rec, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontWeight: "bold",
                      color: "#1f2937",
                      margin: "0",
                      fontSize: "14px",
                    }}
                  >
                    {rec.name}
                  </h3>
                  <p
                    style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}
                  >
                    {gradeInfo[activeGrade].name} 전용 추천
                  </p>
                </div>
                <button
                  onClick={() =>
                    onAddToPurchaseHistory(
                      rec.numbers,
                      `${gradeInfo[activeGrade].name} - ${rec.name}`
                    )
                  }
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  저장
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  backgroundColor: "#f9fafb",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {rec.numbers.map((num, i) => (
                  <LottoNumberBall key={i} number={num} size="sm" />
                ))}
              </div>
            </div>
          ))}

          {!recommendedNumbers[activeGrade] && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 6px 0",
                }}
              >
                {gradeInfo[activeGrade].name} 추천번호
              </p>
              <p
                style={{
                  color: "#6b7280",
                  margin: "0 0 4px 0",
                  fontSize: "14px",
                }}
              >
                확률: {gradeInfo[activeGrade].probability}
              </p>
              <p
                style={{
                  color: "#6b7280",
                  margin: "0 0 16px 0",
                  fontSize: "14px",
                }}
              >
                예상상금: {gradeInfo[activeGrade].prize}
              </p>
              <button
                onClick={() => generateRecommendations(activeGrade)}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {gradeInfo[activeGrade].name} 맞춤 번호 5개 받기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recommend;
