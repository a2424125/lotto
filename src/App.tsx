import React, { useState, useEffect } from "react";

const LottoApp = () => {
  const [currentMenu, setCurrentMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeGrade, setActiveGrade] = useState("1");
  const [recommendedNumbers, setRecommendedNumbers] = useState({});
  const [checkNumbers, setCheckNumbers] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // 샘플 과거 당첨번호 데이터
  const pastWinningNumbers = [
    [3, 7, 15, 16, 19, 43, 21], // 최신 회차 (1177회)
    [1, 5, 12, 18, 26, 32, 44],
    [3, 7, 15, 22, 28, 35, 41],
    [2, 9, 14, 21, 27, 33, 45],
    [4, 11, 17, 24, 31, 38, 42],
    [6, 13, 19, 25, 29, 36, 43],
    [8, 16, 20, 23, 30, 37, 40],
    [10, 12, 18, 26, 32, 39, 44],
    [1, 7, 14, 21, 28, 34, 41],
    [5, 11, 17, 24, 30, 37, 43],
  ];

  // 메뉴 아이템 배열 (아이콘 없이)
  const menuItems = [
    { id: "dashboard", name: "🏠 홈" },
    { id: "recommend", name: "🎯 번호추천" },
    { id: "check", name: "✅ 당첨확인" },
    { id: "stats", name: "📊 통계분석" },
    { id: "purchase", name: "🛍️ 내번호함" },
    { id: "settings", name: "⚙️ 설정" },
  ];

  // 당첨 등급별 확률 및 전략
  const gradeInfo = {
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
    const frequency = {};
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

  // 당첨 등급별 특화 번호 생성 (5개씩)
  const generateGradeSpecificNumbers = (grade) => {
    const strategies = [];

    switch (grade) {
      case "1": // 1등 전용 (6개 모두 맞춰야 함)
        strategies.push(
          { name: "AI 완벽분석", numbers: generate1stGradeNumbers() },
          { name: "황금비율 조합", numbers: generate1stGradeNumbers() },
          { name: "대박 패턴", numbers: generate1stGradeNumbers() },
          { name: "빅데이터 분석", numbers: generate1stGradeNumbers() },
          { name: "프리미엄 조합", numbers: generate1stGradeNumbers() }
        );
        break;
      case "2": // 2등 전용 (5개+보너스)
        strategies.push(
          { name: "보너스 고려", numbers: generate2ndGradeNumbers() },
          { name: "고빈도 분석", numbers: generate2ndGradeNumbers() },
          { name: "5+보너스 전략", numbers: generate2ndGradeNumbers() },
          { name: "패턴 매칭", numbers: generate2ndGradeNumbers() },
          { name: "확률 최적화", numbers: generate2ndGradeNumbers() }
        );
        break;
      case "3": // 3등 전용 (5개 맞추기)
        strategies.push(
          { name: "5개 적중 분석", numbers: generate3rdGradeNumbers() },
          { name: "균형 전략", numbers: generate3rdGradeNumbers() },
          { name: "구간 분산", numbers: generate3rdGradeNumbers() },
          { name: "중빈도 조합", numbers: generate3rdGradeNumbers() },
          { name: "안정 추천", numbers: generate3rdGradeNumbers() }
        );
        break;
      case "4": // 4등 전용 (4개 맞추기)
        strategies.push(
          { name: "4개 적중 전략", numbers: generate4thGradeNumbers() },
          { name: "연속 패턴", numbers: generate4thGradeNumbers() },
          { name: "기본 분석", numbers: generate4thGradeNumbers() },
          { name: "인기 조합", numbers: generate4thGradeNumbers() },
          { name: "패턴 분석", numbers: generate4thGradeNumbers() }
        );
        break;
      case "5": // 5등 전용 (3개 맞추기)
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

  // 1등 전용 번호 생성 (6개 모두 적중 목표)
  const generate1stGradeNumbers = () => {
    const frequent = getMostFrequentNumbers().slice(0, 12);
    const numbers = new Set();

    // 최고 빈도 번호 4개 + 황금비율 적용
    while (numbers.size < 4) {
      numbers.add(frequent[Math.floor(Math.random() * 8)]);
    }

    // 나머지는 패턴 기반
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

  // 2등 전용 번호 생성 (5개+보너스 고려)
  const generate2ndGradeNumbers = () => {
    const frequent = getMostFrequentNumbers().slice(0, 15);
    const numbers = new Set();

    // 보너스 가능성이 높은 번호들 고려
    const bonusCandidates = [21, 15, 7, 19, 43]; // 과거 보너스 번호 패턴

    // 고빈도 3개
    while (numbers.size < 3) {
      numbers.add(frequent[Math.floor(Math.random() * 10)]);
    }

    // 보너스 후보 1개
    if (Math.random() > 0.5) {
      numbers.add(
        bonusCandidates[Math.floor(Math.random() * bonusCandidates.length)]
      );
    }

    // 나머지는 균형
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 3등 전용 번호 생성 (5개 적중 목표)
  const generate3rdGradeNumbers = () => {
    const frequent = getMostFrequentNumbers().slice(0, 20);
    const numbers = new Set();

    // 균형잡힌 접근: 고빈도 3개, 중빈도 2개, 랜덤 1개
    while (numbers.size < 3) {
      numbers.add(frequent[Math.floor(Math.random() * 10)]);
    }

    while (numbers.size < 5) {
      numbers.add(frequent[Math.floor(Math.random() * frequent.length)]);
    }

    // 마지막 1개는 완전 랜덤
    numbers.add(Math.floor(Math.random() * 45) + 1);

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 4등 전용 번호 생성 (4개 적중 목표)
  const generate4thGradeNumbers = () => {
    const numbers = new Set();

    // 연속번호 패턴 활용 (4개 맞추기 용이)
    const start = Math.floor(Math.random() * 35) + 1;
    numbers.add(start);
    numbers.add(start + 1);

    // 패턴 번호 추가
    const patterns = [7, 14, 21, 28, 35, 42];
    while (numbers.size < 4) {
      numbers.add(patterns[Math.floor(Math.random() * patterns.length)]);
    }

    // 나머지는 랜덤
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 5등 전용 번호 생성 (3개 적중 목표 - 가장 확률 높음)
  const generate5thGradeNumbers = () => {
    const numbers = new Set();
    const popular = [1, 7, 14, 21, 28, 35, 42]; // 인기 번호들

    // 인기 번호 3개 (3개만 맞으면 5등)
    while (numbers.size < 3) {
      numbers.add(popular[Math.floor(Math.random() * popular.length)]);
    }

    // 나머지는 완전 랜덤
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 추천 번호 생성
  const generateRecommendations = (grade) => {
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

  // 당첨 확인
  const checkWinning = () => {
    if (!checkNumbers.trim()) return;

    const userNumbers = checkNumbers
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => n >= 1 && n <= 45);
    if (userNumbers.length !== 6) {
      setCheckResult({ error: "6개의 번호를 올바르게 입력해주세요." });
      return;
    }

    const latestWinning = pastWinningNumbers[0];
    const mainNumbers = latestWinning.slice(0, 6);
    const bonusNumber = latestWinning[6];

    const matches = userNumbers.filter((num) =>
      mainNumbers.includes(num)
    ).length;
    const bonusMatch = userNumbers.includes(bonusNumber);

    let grade = "";
    if (matches === 6) grade = "1등 당첨!";
    else if (matches === 5 && bonusMatch) grade = "2등 당첨!";
    else if (matches === 5) grade = "3등 당첨!";
    else if (matches === 4) grade = "4등 당첨!";
    else if (matches === 3) grade = "5등 당첨!";
    else grade = "아쉽게도 낙첨입니다.";

    setCheckResult({
      grade,
      matches,
      bonusMatch,
      winningNumbers: mainNumbers,
      bonusNumber,
      userNumbers,
    });
  };

  // 구매 내역에 추가
  const addToPurchaseHistory = (numbers, strategy) => {
    const newPurchase = {
      id: Date.now(),
      numbers,
      strategy,
      date: new Date().toLocaleDateString(),
      checked: false,
    };
    setPurchaseHistory((prev) => [newPurchase, ...prev]);
  };

  // 동행복권 스타일 번호공 (반응형 크기로 수정)
  const LottoNumberBall = ({
    number,
    isBonus = false,
    size = "md",
    isMatched = false,
  }) => {
    // 동행복권 실제 색상
    const getNumberColor = (num) => {
      if (isBonus) return "#ef4444"; // 빨강 (보너스)
      if (isMatched) return "#eab308"; // 노랑 (매치)
      if (num <= 10) return "#eab308"; // 노랑 (1-10)
      if (num <= 20) return "#3b82f6"; // 파랑 (11-20)
      if (num <= 30) return "#ef4444"; // 빨강 (21-30)
      if (num <= 40) return "#6b7280"; // 회색 (31-40)
      return "#10b981"; // 초록 (41-45)
    };

    // 화면 크기에 따른 반응형 크기 (더 작게 조정)
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
          flexShrink: 0, // 크기 축소 방지
        }}
      >
        {number}
      </div>
    );
  };

  // 대시보드 렌더링 (반응형 개선)
  const renderDashboard = () => (
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
            marginBottom: "4px",
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

      {/* 1177회차 당첨결과 (모바일 최적화) */}
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
              marginBottom: "8px",
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
          onClick={() => setCurrentMenu("recommend")}
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
          onClick={() => setCurrentMenu("recommend")}
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
          onClick={() => setCurrentMenu("check")}
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
          {Object.entries(gradeInfo).map(([grade, info]) => (
            <div
              key={grade}
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

  // 간단한 추천 화면
  const renderRecommend = () => (
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
                    addToPurchaseHistory(
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

  // 당첨확인 렌더링
  const renderCheck = () => (
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
            margin: "0 0 12px 0",
          }}
        >
          당첨번호 확인
        </h2>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            내 로또 번호 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={checkNumbers}
            onChange={(e) => setCheckNumbers(e.target.value)}
            placeholder="예: 3,7,15,16,19,43"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
          <p
            style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}
          >
            1~45 사이의 숫자 6개를 입력하세요
          </p>
        </div>

        <button
          onClick={checkWinning}
          style={{
            width: "100%",
            backgroundColor: "#059669",
            color: "white",
            padding: "10px 0",
            borderRadius: "6px",
            border: "none",
            fontWeight: "500",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          당첨 확인하기
        </button>
      </div>

      {checkResult && (
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          {checkResult.error ? (
            <p style={{ color: "#dc2626", textAlign: "center", margin: "0" }}>
              {checkResult.error}
            </p>
          ) : (
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
                  margin: "0 0 12px 0",
                  color: checkResult.grade.includes("당첨")
                    ? "#059669"
                    : "#6b7280",
                }}
              >
                {checkResult.grade}
              </h3>

              <div style={{ marginBottom: "12px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 8px 0",
                    textAlign: "center",
                  }}
                >
                  1177회차 당첨번호
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    marginBottom: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* 당첨번호 6개 */}
                  {checkResult.winningNumbers.map((num, i) => (
                    <LottoNumberBall key={i} number={num} size="sm" />
                  ))}

                  {/* 플러스 기호 */}
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      margin: "0 2px",
                    }}
                  >
                    +
                  </span>

                  {/* 보너스 번호 */}
                  <LottoNumberBall
                    number={checkResult.bonusNumber}
                    isBonus={true}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 6px 0",
                    textAlign: "center",
                  }}
                >
                  내 번호
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    justifyContent: "center",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {checkResult.userNumbers.map((num, i) => (
                    <LottoNumberBall
                      key={i}
                      number={num}
                      size="sm"
                      isMatched={
                        checkResult.winningNumbers.includes(num) ||
                        num === checkResult.bonusNumber
                      }
                    />
                  ))}
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    padding: "8px",
                    borderRadius: "4px",
                    margin: "0",
                  }}
                >
                  일치: {checkResult.matches}개
                  {checkResult.bonusMatch && " + 보너스"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    // 앱 시작시 1등 당첨 확률 번호 미리 생성
    generateRecommendations("1");
  }, []);

  const renderContent = () => {
    switch (currentMenu) {
      case "dashboard":
        return renderDashboard();
      case "recommend":
        return renderRecommend();
      case "check":
        return renderCheck();
      default:
        return renderDashboard();
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        position: "relative",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            padding: "6px",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        >
          ☰
        </button>
        <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
          로또 6/45
        </h1>
        <div style={{ width: "32px" }} />
      </div>

      {/* 사이드바 */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: "240px",
              backgroundColor: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}
                >
                  메뉴
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: "8px" }}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "6px",
                    textAlign: "left",
                    border: "none",
                    backgroundColor:
                      currentMenu === item.id ? "#eff6ff" : "transparent",
                    color: currentMenu === item.id ? "#2563eb" : "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div style={{ paddingBottom: "56px" }}>{renderContent()}</div>

      {/* 푸터 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "8px 12px",
          textAlign: "center",
          fontSize: "10px",
          color: "#6b7280",
        }}
      >
        로또는 확률게임입니다. 과도한 구매는 가계에 부담이 됩니다.
      </div>

      {/* 애니메이션 CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// export default 명시적으로 추가
export default LottoApp;
