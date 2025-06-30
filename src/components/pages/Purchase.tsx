import React, { useState } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";

interface PurchaseItem {
  id: number;
  numbers: number[];
  strategy: string;
  date: string;
  checked: boolean;
  status: "saved" | "planned" | "purchased";
  memo?: string;
  purchaseDate?: string;
}

interface PurchaseProps {
  purchaseHistory: PurchaseItem[];
  onDelete: (id: number) => void;
  onCheck: (id: number, numbers: number[]) => void;
  onAdd: (numbers: number[], strategy: string) => void;
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
  onAdd,
  pastWinningNumbers,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMethod, setAddMethod] = useState<"omr" | "direct">("omr");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [directInput, setDirectInput] = useState("");
  const [memo, setMemo] = useState("");
  const [filter, setFilter] = useState<"all" | "saved" | "planned" | "purchased">("all");

  // OMR 스타일 번호 선택
  const toggleNumber = (num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      } else if (prev.length < 6) {
        return [...prev, num].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  // 직접 입력 처리
  const handleDirectInput = () => {
    const numbers = directInput
      .split(",")
      .map(n => parseInt(n.trim()))
      .filter(n => n >= 1 && n <= 45);
    
    if (numbers.length === 6 && new Set(numbers).size === 6) {
      setSelectedNumbers(numbers.sort((a, b) => a - b));
      setAddMethod("omr");
    } else {
      alert("1~45 사이의 서로 다른 6개 번호를 입력해주세요.");
    }
  };

  // 번호 저장
  const saveNumbers = () => {
    if (selectedNumbers.length === 6) {
      onAdd(selectedNumbers, memo || "수동 입력");
      setSelectedNumbers([]);
      setDirectInput("");
      setMemo("");
      setShowAddForm(false);
    }
  };

  // 당첨 확인
  const checkWinning = (userNumbers: number[]): CheckResult => {
    const latestWinning = pastWinningNumbers[0];
    const mainNumbers = latestWinning.slice(0, 6);
    const bonusNumber = latestWinning[6];

    const matches = userNumbers.filter(num => mainNumbers.includes(num)).length;
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

  // 번호 복사
  const copyNumbers = (numbers: number[]) => {
    const text = numbers.join(", ");
    navigator.clipboard.writeText(text);
    alert("번호가 복사되었습니다!");
  };

  // 필터링
  const filteredHistory = purchaseHistory.filter(item => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  // 통계
  const stats = {
    total: purchaseHistory.length,
    saved: purchaseHistory.filter(item => item.status === "saved").length,
    planned: purchaseHistory.filter(item => item.status === "planned").length,
    purchased: purchaseHistory.filter(item => item.status === "purchased").length,
  };

  return (
    <div style={{ padding: "12px" }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "12px",
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#1f2937",
          margin: "0 0 8px 0",
        }}>
          🛍️ 내번호함
        </h2>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
          로또 번호를 등록하고 관리하세요
        </p>

        {/* 통계 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <div style={{ flex: 1, padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "6px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937", margin: "0" }}>{stats.total}</p>
            <p style={{ fontSize: "10px", color: "#6b7280", margin: "0" }}>전체</p>
          </div>
          <div style={{ flex: 1, padding: "8px", backgroundColor: "#fef3c7", borderRadius: "6px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#d97706", margin: "0" }}>{stats.saved}</p>
            <p style={{ fontSize: "10px", color: "#d97706", margin: "0" }}>저장</p>
          </div>
          <div style={{ flex: 1, padding: "8px", backgroundColor: "#dbeafe", borderRadius: "6px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#2563eb", margin: "0" }}>{stats.planned}</p>
            <p style={{ fontSize: "10px", color: "#2563eb", margin: "0" }}>구매예정</p>
          </div>
          <div style={{ flex: 1, padding: "8px", backgroundColor: "#dcfce7", borderRadius: "6px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#16a34a", margin: "0" }}>{stats.purchased}</p>
            <p style={{ fontSize: "10px", color: "#16a34a", margin: "0" }}>구매완료</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            width: "100%",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          + 번호 등록하기
        </button>
      </div>

      {/* 번호 등록 폼 */}
      {showAddForm && (
        <div style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 12px 0" }}>
            번호 등록
          </h3>

          {/* 입력 방법 선택 */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={() => setAddMethod("omr")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: addMethod === "omr" ? "2px solid #2563eb" : "1px solid #d1d5db",
                backgroundColor: addMethod === "omr" ? "#eff6ff" : "white",
                color: addMethod === "omr" ? "#2563eb" : "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              🎫 OMR 체크
            </button>
            <button
              onClick={() => setAddMethod("direct")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: addMethod === "direct" ? "2px solid #2563eb" : "1px solid #d1d5db",
                backgroundColor: addMethod === "direct" ? "#eff6ff" : "white",
                color: addMethod === "direct" ? "#2563eb" : "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ⌨️ 직접 입력
            </button>
          </div>

          {/* OMR 스타일 번호 선택 */}
          {addMethod === "omr" && (
            <div style={{
              padding: "12px",
              backgroundColor: "#f8fafc",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              marginBottom: "12px",
            }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0" }}>
                  로또 6/45 용지처럼 번호를 체크하세요 ({selectedNumbers.length}/6)
                </p>
              </div>
              
              {/* 번호 그리드 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: "4px",
                maxWidth: "320px",
                margin: "0 auto",
              }}>
                {Array.from({ length: 45 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={selectedNumbers.length >= 6 && !selectedNumbers.includes(num)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#fef2f2" : "white",
                      color: selectedNumbers.includes(num) ? "#dc2626" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: selectedNumbers.length >= 6 && !selectedNumbers.includes(num) ? "not-allowed" : "pointer",
                      opacity: selectedNumbers.length >= 6 && !selectedNumbers.includes(num) ? 0.5 : 1,
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 선택된 번호 표시 */}
              {selectedNumbers.length > 0 && (
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 6px 0" }}>선택된 번호</p>
                  <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                    {selectedNumbers.map((num, i) => (
                      <LottoNumberBall key={i} number={num} size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 직접 입력 */}
          {addMethod === "direct" && (
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                번호 입력 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={directInput}
                onChange={(e) => setDirectInput(e.target.value)}
                placeholder="예: 3, 7, 15, 16, 19, 43"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleDirectInput}
                style={{
                  width: "100%",
                  backgroundColor: "#059669",
                  color: "white",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                번호 적용
              </button>
            </div>
          )}

          {/* 메모 */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
              메모 (선택사항)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 신촌 로또방에서 구매 예정"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* 저장 버튼 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                flex: 1,
                backgroundColor: "#6b7280",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              취소
            </button>
            <button
              onClick={saveNumbers}
              disabled={selectedNumbers.length !== 6}
              style={{
                flex: 1,
                backgroundColor: selectedNumbers.length === 6 ? "#2563eb" : "#9ca3af",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                fontSize: "14px",
                cursor: selectedNumbers.length === 6 ? "pointer" : "not-allowed",
              }}
            >
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
        {[
          { key: "all", name: "전체", count: stats.total },
          { key: "saved", name: "저장", count: stats.saved },
          { key: "planned", name: "구매예정", count: stats.planned },
          { key: "purchased", name: "구매완료", count: stats.purchased },
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

      {/* 번호 목록 */}
      {filteredHistory.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          padding: "32px 16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <p style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 6px 0" }}>
            등록된 번호가 없어요
          </p>
          <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
            번호를 등록해서 당첨을 확인해보세요!
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
                  border: isWinner ? "2px solid #059669" : "1px solid #e5e7eb",
                  boxShadow: isWinner ? "0 2px 8px rgba(5, 150, 105, 0.2)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ fontWeight: "bold", color: "#1f2937", margin: "0", fontSize: "14px" }}>
                      {item.strategy}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
                      {item.date} 등록
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => copyNumbers(item.numbers)}
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
                      복사
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
                <div style={{
                  display: "flex",
                  gap: "4px",
                  justifyContent: "center",
                  backgroundColor: "#f9fafb",
                  padding: "8px",
                  borderRadius: "6px",
                  marginBottom: result ? "8px" : "0",
                }}>
                  {item.numbers.map((num, i) => (
                    <LottoNumberBall
                      key={i}
                      number={num}
                      size="sm"
                      isMatched={result ? pastWinningNumbers[0].slice(0, 7).includes(num) : false}
                    />
                  ))}
                </div>

                {/* 당첨 결과 */}
                {result && (
                  <div style={{
                    padding: "8px",
                    backgroundColor: isWinner ? "#f0fdf4" : "#fef2f2",
                    borderRadius: "6px",
                    border: isWinner ? "1px solid #bbf7d0" : "1px solid #fecaca",
                    textAlign: "center",
                  }}>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: isWinner ? "#059669" : "#dc2626",
                    }}>
                      {result.grade === "낙첨" ? "😔 낙첨" : `🎉 ${result.grade} 당첨!`}
                    </span>
                    {result.grade !== "낙첨" && (
                      <p style={{ fontSize: "12px", color: "#059669", margin: "2px 0 0 0" }}>
                        {result.matches}개 일치{result.bonusMatch && " + 보너스"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Purchase;
