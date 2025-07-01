import React, { useState } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";

interface CheckProps {
  pastWinningNumbers: number[][];
}

interface CheckResult {
  grade: string;
  matches: number;
  bonusMatch: boolean;
  winningNumbers: number[];
  bonusNumber: number;
  userNumbers: number[];
  error?: string;
}

const Check: React.FC<CheckProps> = ({ pastWinningNumbers }) => {
  const [checkNumbers, setCheckNumbers] = useState("");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  // 당첨 확인
  const checkWinning = () => {
    if (!checkNumbers.trim()) return;

    const userNumbers = checkNumbers
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => n >= 1 && n <= 45);

    if (userNumbers.length !== 6) {
      setCheckResult({
        error: "6개의 번호를 올바르게 입력해주세요.",
        grade: "",
        matches: 0,
        bonusMatch: false,
        winningNumbers: [],
        bonusNumber: 0,
        userNumbers: [],
      });
      return;
    }

    // 중복 번호 체크
    if (new Set(userNumbers).size !== 6) {
      setCheckResult({
        error: "중복된 번호가 있습니다. 서로 다른 6개의 번호를 입력해주세요.",
        grade: "",
        matches: 0,
        bonusMatch: false,
        winningNumbers: [],
        bonusNumber: 0,
        userNumbers: [],
      });
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

  // 예시 번호 입력
  const fillExampleNumbers = () => {
    setCheckNumbers("3,7,15,16,19,43");
  };

  // 랜덤 번호 생성
  const generateRandomNumbers = () => {
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    setCheckNumbers(
      Array.from(numbers)
        .sort((a, b) => a - b)
        .join(",")
    );
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

        {/* 빠른 입력 버튼들 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            onClick={fillExampleNumbers}
            style={{
              flex: 1,
              backgroundColor: "#6b7280",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            예시 번호
          </button>
          <button
            onClick={generateRandomNumbers}
            style={{
              flex: 1,
              backgroundColor: "#8b5cf6",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            랜덤 생성
          </button>
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

      {/* 현재 회차 당첨번호 표시 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: "0 0 8px 0",
          }}
        >
          1177회차 당첨번호
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
          2025년 06월 21일 추첨
        </p>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "8px",
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
              margin: "0",
            }}
          >
            마지막 번호는 보너스 번호입니다
          </p>
        </div>
      </div>

      {/* 당첨 확인 결과 */}
      {checkResult && (
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            marginBottom: "12px",
          }}
        >
          {checkResult.error ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                backgroundColor: "#fef2f2",
                borderRadius: "6px",
                border: "1px solid #fecaca",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>❌</div>
              <p
                style={{
                  color: "#dc2626",
                  margin: "0",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {checkResult.error}
              </p>
            </div>
          ) : (
            <div>
              {/* 당첨 결과 헤더 */}
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  backgroundColor: checkResult.grade.includes("당첨")
                    ? "#f0fdf4"
                    : "#f9fafb",
                  borderRadius: "8px",
                  border: checkResult.grade.includes("당첨")
                    ? "1px solid #bbf7d0"
                    : "1px solid #e5e7eb",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>
                  {checkResult.grade.includes("당첨") ? "🎉" : "😔"}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "0 0 4px 0",
                    color: checkResult.grade.includes("당첨")
                      ? "#059669"
                      : "#6b7280",
                  }}
                >
                  {checkResult.grade}
                </h3>
                {checkResult.grade.includes("당첨") && (
                  <p
                    style={{ fontSize: "12px", color: "#059669", margin: "0" }}
                  >
                    축하합니다! 🎊
                  </p>
                )}
              </div>

              {/* 번호 비교 */}
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
                    <LottoNumberBall
                      key={i}
                      number={num}
                      size="sm"
                      isMatched={checkResult.userNumbers.includes(num)}
                    />
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
                    isMatched={checkResult.userNumbers.includes(
                      checkResult.bonusNumber
                    )}
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

                {/* 매칭 정보 */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#1f2937",
                      margin: "0 0 4px 0",
                    }}
                  >
                    일치 번호: {checkResult.matches}개
                    {checkResult.bonusMatch && " + 보너스"}
                  </p>
                  <p
                    style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}
                  >
                    매칭된 번호는 노란색으로 표시됩니다
                  </p>
                </div>

                {/* 등급별 상금 정보 */}
                {checkResult.grade.includes("당첨") && (
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "6px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#1e40af",
                        margin: "0 0 4px 0",
                        textAlign: "center",
                      }}
                    >
                      💰 예상 상금 정보
                    </h4>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1f2937",
                        textAlign: "center",
                      }}
                    >
                      {checkResult.grade.includes("1등") && "약 20억원"}
                      {checkResult.grade.includes("2등") && "약 6천만원"}
                      {checkResult.grade.includes("3등") && "약 150만원"}
                      {checkResult.grade.includes("4등") && "5만원"}
                      {checkResult.grade.includes("5등") && "5천원"}
                    </div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#6b7280",
                        margin: "4px 0 0 0",
                        textAlign: "center",
                      }}
                    >
                      ※ 실제 상금은 당첨자 수에 따라 달라질 수 있습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
          💡 당첨 확률 참고
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { grade: "1등", matches: "6개 일치", probability: "1/8,145,060" },
            {
              grade: "2등",
              matches: "5개 + 보너스",
              probability: "1/1,357,510",
            },
            { grade: "3등", matches: "5개 일치", probability: "1/35,724" },
            { grade: "4등", matches: "4개 일치", probability: "1/733" },
            { grade: "5등", matches: "3개 일치", probability: "1/45" },
          ].map((info, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 8px",
                backgroundColor: "#f9fafb",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#1f2937", fontWeight: "500" }}>
                {info.grade} ({info.matches})
              </span>
              <span style={{ color: "#6b7280" }}>{info.probability}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Check;
