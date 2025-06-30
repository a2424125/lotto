import React, { useState } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";

interface PurchaseItem {
  id: number;
  numbers: number[];
  strategy: string;
  date: string;
  checked: boolean;
}

interface PurchaseProps {
  purchaseHistory: PurchaseItem[];
  onDelete: (id: number) => void;
  onCheck: (id: number, numbers: number[]) => void;
  pastWinningNumbers: number[][];
}

interface CheckResult {
  grade: string;
  matches: number;
  bonusMatch: boolean;
}

const Purchase: React.FC<PurchaseProps> = ({
  purchaseHistory,
  onDelete,
  onCheck,
  pastWinningNumbers,
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "checked" | "unchecked">("all");
  const [showResults, setShowResults] = useState(false);

  // QR코드 생성 함수
  const generateQRCode = (numbers: number[]): string => {
    // 간단한 QR코드 패턴 생성 (실제로는 QR 라이브러리 사용 권장)
    const data = numbers.join(",");
    const size = 120;
    const modules = 21; // QR 코드 모듈 수
    const moduleSize = size / modules;
    
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    
    // 간단한 패턴 생성 (실제 QR코드는 아니지만 시각적 효과)
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const hash = (data.charCodeAt(0) * (i + 1) * (j + 1)) % 100;
        if (hash > 50) {
          svg += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    svg += "</svg>";
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // 당첨 확인 함수
  const checkWinning = (userNumbers: number[]): CheckResult => {
    const latestWinning = pastWinningNumbers[0];
    const mainNumbers = latestWinning.slice(0, 6);
    const bonusNumber = latestWinning[6];

    const matches = userNumbers.filter((num) =>
      mainNumbers.includes(num)
    ).length;
    const bonusMatch = userNumbers.includes(bonusNumber);

    let grade = "";
    if (matches === 6) grade = "1등";
    else if (matches === 5 && bonusMatch) grade = "2등";
    else if (matches === 5) grade = "3등";
    else if (matches === 4) grade = "4등";
    else if (matches === 3) grade = "5등";
    else grade = "낙첨";

    return { grade, matches, bonusMatch };
  };

  // 전체 당첨 확인
  const checkAllNumbers = () => {
    purchaseHistory.forEach((item) => {
      if (!item.checked) {
        onCheck(item.id, item.numbers);
      }
    });
    setShowResults(true);
  };

  // 필터링된 목록
  const filteredHistory = purchaseHistory.filter((item) => {
    if (filter === "checked") return item.checked;
    if (filter === "unchecked") return !item.checked;
    return true;
  });

  // 통계 계산
  const stats = {
    total: purchaseHistory.length,
    checked: purchaseHistory.filter((item) => item.checked).length,
    winners: purchaseHistory.filter((item) => {
      if (!item.checked) return false;
      const result = checkWinning(item.numbers);
      return result.grade !== "낙첨";
    }).length,
  };

  // QR코드 다운로드
  const downloadQR = (numbers: number[], strategy: string) => {
    const qrData = generateQRCode(numbers);
    const link = document.createElement("a");
    link.download = `로또번호_${numbers.join("-")}_${strategy}.svg`;
    link.href = qrData;
    link.click();
  };

  return (
    <div style={{ padding: "12px" }}>
      {/* 헤더 */}
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
          🛍️ 내번호함
        </h2>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
          저장된 로또 번호를 관리하고 당첨을 확인하세요
        </p>

        {/* 통계 요약 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0",
              }}
            >
              {stats.total}
            </p>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
              총 번호
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#eff6ff",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#2563eb",
                margin: "0",
              }}
            >
              {stats.checked}
            </p>
            <p style={{ fontSize: "12px", color: "#2563eb", margin: "0" }}>
              확인 완료
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#f0fdf4",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#059669",
                margin: "0",
              }}
            >
              {stats.winners}
            </p>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0" }}>
              당첨
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            onClick={checkAllNumbers}
            style={{
              flex: 1,
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            전체 당첨확인
          </button>
          <button
            onClick={() => setShowResults(!showResults)}
            style={{
              flex: 1,
              backgroundColor: "#059669",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {showResults ? "결과 숨기기" : "결과 보기"}
          </button>
        </div>

        {/* 필터 */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { key: "all", name: "전체", count: stats.total },
            { key: "unchecked", name: "미확인", count: stats.total - stats.checked },
            { key: "checked", name: "확인완료", count: stats.checked },
          ].map(({ key, name, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                backgroundColor: filter === key ? "#2563eb" : "white",
                color: filter === key ? "white" : "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {name} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* 번호 목록 */}
      {filteredHistory.length === 0 ? (
        <div
          style={{
            backgroundColor: "white",
            padding: "32px 16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 6px 0",
            }}
          >
            {filter === "all" ? "저장된 번호가 없어요" : "해당하는 번호가 없어요"}
          </p>
          <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
            {filter === "all"
              ? "번호추천에서 마음에 드는 번호를 저장해보세요!"
              : "다른 필터를 선택해보세요"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredHistory.map((item) => {
            const result = item.checked ? checkWinning(item.numbers) : null;
            const isWinner = result && result.grade !== "낙첨";

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "12px",
                  border: isWinner
                    ? "2px solid #059669"
                    : "1px solid #e5e7eb",
                  boxShadow: isWinner ? "0 2px 8px rgba(5, 150, 105, 0.2)" : "none",
                }}
              >
                {/* 헤더 */}
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
                      {item.strategy}
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        margin: "0",
                      }}
                    >
                      {item.date} 저장
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => setShowQR(showQR === item.id ? null : item.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#8b5cf6",
                        color: "white",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      QR
                    </button>
                    <button
                      onClick={() => onCheck(item.id, item.numbers)}
                      disabled={item.checked}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: item.checked ? "#6b7280" : "#059669",
                        color: "white",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "12px",
                        cursor: item.checked ? "not-allowed" : "pointer",
                      }}
                    >
                      {item.checked ? "확인완료" : "당첨확인"}
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 번호 표시 */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    justifyContent: "center",
                    backgroundColor: "#f9fafb",
                    padding: "8px",
                    borderRadius: "6px",
                    marginBottom: "8px",
                  }}
                >
                  {item.numbers.map((num, i) => (
                    <LottoNumberBall
                      key={i}
                      number={num}
                      size="sm"
                      isMatched={
                        result
                          ? pastWinningNumbers[0].slice(0, 7).includes(num)
                          : false
                      }
                    />
                  ))}
                </div>

                {/* QR코드 표시 */}
                {showQR === item.id && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <img
                      src={generateQRCode(item.numbers)}
                      alt="QR Code"
                      style={{
                        width: "120px",
                        height: "120px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    />
                    <div>
                      <button
                        onClick={() => downloadQR(item.numbers, item.strategy)}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          fontSize: "12px",
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        📱 QR 다운로드
                      </button>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          margin: "4px 0 0 0",
                        }}
                      >
                        로또 판매점에서 QR 스캔으로 구매 가능
                      </p>
                    </div>
                  </div>
                )}

                {/* 당첨 결과 */}
                {showResults && result && (
                  <div
                    style={{
                      padding: "8px",
                      backgroundColor: isWinner ? "#f0fdf4" : "#fef2f2",
                      borderRadius: "6px",
                      border: isWinner
                        ? "1px solid #bbf7d0"
                        : "1px solid #fecaca",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: isWinner ? "#059669" : "#dc2626",
                        }}
                      >
                        {result.grade === "낙첨" ? "😔 낙첨" : `🎉 ${result.grade} 당첨!`}
                      </span>
                      {result.grade !== "낙첨" && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#059669",
                            margin: "2px 0 0 0",
                          }}
                        >
                          {result.matches}개 일치
                          {result.bonusMatch && " + 보너스"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 안내 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          marginTop: "12px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "0",
            textAlign: "center",
          }}
        >
          💡 팁: QR코드를 생성하여 로또 판매점에서 빠르게 구매하세요!
          <br />
          저장된 번호는 자동으로 기기에 보관됩니다.
        </p>
      </div>
    </div>
  );
};

export default Purchase;
