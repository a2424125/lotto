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
          backgroundColor: "#fef2f2",
          padding: "20px",
          borderRadius: "12px",
          border: "3px solid #dc2626",
          marginBottom: "12px",
          boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)",
        }}>
          {/* 로또 용지 스타일 헤더 */}
          <div style={{
            textAlign: "center",
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#dc2626",
            borderRadius: "8px",
            color: "white",
          }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "bold", 
              margin: "0 0 4px 0",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}>
              🎫 로또 6/45 번호 등록
            </h3>
            <p style={{ 
              fontSize: "12px", 
              margin: "0",
              opacity: 0.9
            }}>
              구매할 번호를 미리 등록하거나 구매한 번호를 기록하세요
            </p>
          </div>

          {/* 입력 방법 선택 - 로또 용지 스타일 */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            marginBottom: "16px",
            padding: "4px",
            backgroundColor: "#fee2e2",
            borderRadius: "8px",
            border: "2px solid #fecaca",
          }}>
            <button
              onClick={() => setAddMethod("omr")}
              style={{
                flex: 1,
                padding: "12px 8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: addMethod === "omr" ? "#dc2626" : "white",
                color: addMethod === "omr" ? "white" : "#dc2626",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: addMethod === "omr" 
                  ? "0 2px 4px rgba(220, 38, 38, 0.3)" 
                  : "inset 0 1px 2px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
            >
              🎫 OMR 체크
              <br />
              <span style={{ fontSize: "10px", opacity: 0.8 }}>
                (실제 용지처럼)
              </span>
            </button>
            <button
              onClick={() => setAddMethod("direct")}
              style={{
                flex: 1,
                padding: "12px 8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: addMethod === "direct" ? "#dc2626" : "white",
                color: addMethod === "direct" ? "white" : "#dc2626",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: addMethod === "direct" 
                  ? "0 2px 4px rgba(220, 38, 38, 0.3)" 
                  : "inset 0 1px 2px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
            >
              ⌨️ 직접 입력
              <br />
              <span style={{ fontSize: "10px", opacity: 0.8 }}>
                (빠른 입력)
              </span>
            </button>
          </div>

          {/* 실제 로또 용지 스타일 */}
          {addMethod === "omr" && (
            <div style={{
              padding: "16px",
              backgroundColor: "#fef7f7",
              borderRadius: "8px",
              border: "2px solid #fecaca",
              marginBottom: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}>
              {/* 헤더 */}
              <div style={{ 
                textAlign: "center", 
                marginBottom: "12px",
                padding: "8px",
                backgroundColor: "#fee2e2",
                borderRadius: "4px",
                border: "1px solid #fecaca"
              }}>
                <h4 style={{ 
                  fontSize: "14px", 
                  fontWeight: "bold", 
                  color: "#dc2626", 
                  margin: "0 0 4px 0" 
                }}>
                  🎫 로또 6/45 A게임
                </h4>
                <p style={{ 
                  fontSize: "11px", 
                  color: "#991b1b", 
                  margin: "0" 
                }}>
                  아래 번호 중 6개를 선택하세요 ({selectedNumbers.length}/6)
                </p>
              </div>
              
              {/* 실제 로또 용지 스타일 번호 그리드 */}
              <div style={{
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "6px",
                border: "2px solid #dc2626",
                maxWidth: "350px",
                margin: "0 auto",
              }}>
                {/* 10개씩 5줄 배치 */}
                {[
                  Array.from({ length: 10 }, (_, i) => i + 1),      // 1-10
                  Array.from({ length: 10 }, (_, i) => i + 11),     // 11-20  
                  Array.from({ length: 10 }, (_, i) => i + 21),     // 21-30
                  Array.from({ length: 10 }, (_, i) => i + 31),     // 31-40
                  Array.from({ length: 5 }, (_, i) => i + 41),      // 41-45
                ].map((row, rowIndex) => (
                  <div key={rowIndex} style={{
                    display: "flex",
                    gap: "3px",
                    marginBottom: "3px",
                    justifyContent: rowIndex === 4 ? "center" : "flex-start",
                  }}>
                    {row.map(num => (
                      <button
                        key={num}
                        onClick={() => toggleNumber(num)}
                        disabled={selectedNumbers.length >= 6 && !selectedNumbers.includes(num)}
                        style={{
                          width: "28px",
                          height: "24px",
                          borderRadius: "3px",
                          border: selectedNumbers.includes(num) 
                            ? "2px solid #dc2626" 
                            : "1px solid #d1d5db",
                          backgroundColor: selectedNumbers.includes(num) 
                            ? "#dc2626" 
                            : "white",
                          color: selectedNumbers.includes(num) 
                            ? "white" 
                            : "#374151",
                          fontSize: "10px",
                          fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                          cursor: selectedNumbers.length >= 6 && !selectedNumbers.includes(num) 
                            ? "not-allowed" 
                            : "pointer",
                          opacity: selectedNumbers.length >= 6 && !selectedNumbers.includes(num) 
                            ? 0.3 
                            : 1,
                          transition: "all 0.1s",
                          boxShadow: selectedNumbers.includes(num) 
                            ? "inset 0 1px 2px rgba(0,0,0,0.3)" 
                            : "none",
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* 용지 하단 정보 */}
              <div style={{
                marginTop: "12px",
                padding: "8px",
                backgroundColor: "#fee2e2",
                borderRadius: "4px",
                textAlign: "center",
              }}>
                <p style={{ 
                  fontSize: "10px", 
                  color: "#991b1b", 
                  margin: "0",
                  lineHeight: "1.3"
                }}>
                  ※ 1~45번 중 6개 번호 선택 | 자동선택: 컴퓨터가 임의로 선택
                  <br />
                  ※ 구매 후 용지를 분실하지 마세요
                </p>
              </div>

              {/* 선택된 번호 확인 구역 */}
              {selectedNumbers.length > 0 && (
                <div style={{ 
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: "2px dashed #dc2626",
                }}>
                  <div style={{ textAlign: "center", marginBottom: "8px" }}>
                    <p style={{ 
                      fontSize: "12px", 
                      fontWeight: "bold", 
                      color: "#dc2626", 
                      margin: "0" 
                    }}>
                      ✓ 선택한 번호 확인
                    </p>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    gap: "6px", 
                    justifyContent: "center",
                    flexWrap: "wrap"
                  }}>
                    {selectedNumbers.map((num, i) => (
                      <div key={i} style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)",
                      }}>
                        {num}
                      </div>
                    ))}
                    {/* 빈 칸들 표시 */}
                    {Array.from({ length: 6 - selectedNumbers.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        backgroundColor: "#f3f4f6",
                        border: "2px dashed #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}>
                        ?
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <p style={{ 
                      fontSize: "10px", 
                      color: "#6b7280", 
                      margin: "0" 
                    }}>
                      {selectedNumbers.length === 6 
                        ? "✅ 6개 번호 선택 완료!" 
                        : `${6 - selectedNumbers.length}개 더 선택해주세요`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 직접 입력 - 로또 용지 스타일 */}
          {addMethod === "direct" && (
            <div style={{
              padding: "16px",
              backgroundColor: "#fef7f7",
              borderRadius: "8px",
              border: "2px solid #fecaca",
              marginBottom: "12px",
            }}>
              <div style={{
                textAlign: "center",
                marginBottom: "12px",
                padding: "8px",
                backgroundColor: "#fee2e2",
                borderRadius: "4px",
              }}>
                <h4 style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#dc2626",
                  margin: "0 0 4px 0"
                }}>
                  ⌨️ 빠른 번호 입력
                </h4>
                <p style={{
                  fontSize: "11px",
                  color: "#991b1b",
                  margin: "0"
                }}>
                  쉼표(,)로 구분하여 6개 번호를 입력하세요
                </p>
              </div>
              
              <div style={{
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "6px",
                border: "2px solid #dc2626",
              }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "12px", 
                  fontWeight: "bold", 
                  color: "#dc2626", 
                  marginBottom: "8px" 
                }}>
                  번호 입력 (1~45)
                </label>
                <input
                  type="text"
                  value={directInput}
                  onChange={(e) => setDirectInput(e.target.value)}
                  placeholder="예: 3, 7, 15, 16, 19, 43"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #fecaca",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#dc2626",
                  }}
                />
                <button
                  onClick={handleDirectInput}
                  style={{
                    width: "100%",
                    backgroundColor: "#dc2626",
                    color: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginTop: "8px",
                    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)",
                  }}
                >
                  🎯 번호 적용하기
                </button>
              </div>
              
              <div style={{
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#fee2e2",
                borderRadius: "4px",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "10px",
                  color: "#991b1b",
                  margin: "0",
                  lineHeight: "1.3"
                }}>
                  💡 팁: "3,7,15,16,19,43" 처럼 쉼표로 구분해서 입력하세요
                  <br />
                  중복 번호나 범위 밖 번호는 자동으로 제외됩니다
                </p>
              </div>
            </div>
          )}

          {/* 메모 입력 - 로또 용지 스타일 */}
          <div style={{
            marginBottom: "12px",
            padding: "12px",
            backgroundColor: "#fffbeb",
            borderRadius: "6px",
            border: "1px solid #fcd34d",
          }}>
            <label style={{ 
              display: "block", 
              fontSize: "12px", 
              fontWeight: "bold", 
              color: "#d97706", 
              marginBottom: "6px" 
            }}>
              📝 메모 (선택사항)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 신촌 로또방에서 구매 예정, 행운의 번호"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #fcd34d",
                borderRadius: "4px",
                fontSize: "12px",
                boxSizing: "border-box",
                backgroundColor: "white",
              }}
            />
            <p style={{
              fontSize: "10px",
              color: "#92400e",
              margin: "4px 0 0 0",
            }}>
              💡 구매 장소, 구매 예정일, 특별한 의미 등을 기록하세요
            </p>
          </div>

          {/* 저장 버튼들 - 로또 용지 스타일 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                flex: 1,
                backgroundColor: "#6b7280",
                color: "white",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(107, 114, 128, 0.3)",
              }}
            >
              ❌ 취소
            </button>
            <button
              onClick={saveNumbers}
              disabled={selectedNumbers.length !== 6}
              style={{
                flex: 2,
                backgroundColor: selectedNumbers.length === 6 ? "#dc2626" : "#9ca3af",
                color: "white",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: selectedNumbers.length === 6 ? "pointer" : "not-allowed",
                boxShadow: selectedNumbers.length === 6 
                  ? "0 2px 4px rgba(220, 38, 38, 0.3)" 
                  : "none",
                transition: "all 0.2s",
              }}
            >
              {selectedNumbers.length === 6 
                ? "🎫 번호 저장하기" 
                : `💭 ${6 - selectedNumbers.length}개 더 선택`}
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
