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
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [memo, setMemo] = useState("");
  const [isAutoSelect, setIsAutoSelect] = useState(false);
  const [filter, setFilter] = useState<"all" | "saved" | "planned" | "purchased">("all");

  // AI 추천번호들 (실제로는 번호추천에서 생성된 것들을 props로 받아야 함)
  const aiRecommendedNumbers = [
    { name: "1등 - AI 완벽분석", numbers: [2, 8, 14, 21, 29, 35], grade: "1등" },
    { name: "1등 - 황금비율 조합", numbers: [5, 11, 17, 23, 31, 42], grade: "1등" },
    { name: "2등 - 보너스 고려", numbers: [7, 13, 19, 25, 33, 39], grade: "2등" },
    { name: "3등 - 균형 분석", numbers: [3, 9, 16, 27, 34, 41], grade: "3등" },
    { name: "4등 - 패턴 분석", numbers: [1, 12, 18, 26, 32, 44], grade: "4등" }
  ];

  // 번호 선택/해제 (OMR 방식)
  const toggleNumber = (num: number) => {
    if (isAutoSelect) return; // 자동선택 모드에서는 수동 선택 불가
    
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      } else if (prev.length < 6) {
        return [...prev, num].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  // 자동선택 토글
  const toggleAutoSelect = () => {
    setIsAutoSelect(!isAutoSelect);
    if (!isAutoSelect) {
      // 자동선택 활성화시 랜덤 번호 생성
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      setSelectedNumbers(Array.from(numbers).sort((a, b) => a - b));
    } else {
      // 자동선택 해제시 번호 초기화
      setSelectedNumbers([]);
    }
  };

  // AI 추천번호 적용
  const applyRecommendedNumbers = (numbers: number[]) => {
    setSelectedNumbers([...numbers]);
    setIsAutoSelect(false); // AI 추천 적용시 자동선택 해제
  };

  // 번호 저장
  const saveNumbers = () => {
    if (selectedNumbers.length === 6) {
      let strategyName = "";
      if (isAutoSelect) {
        strategyName = "자동 생성";
      } else if (aiRecommendedNumbers.some(rec => JSON.stringify(rec.numbers) === JSON.stringify(selectedNumbers))) {
        const matchedRec = aiRecommendedNumbers.find(rec => JSON.stringify(rec.numbers) === JSON.stringify(selectedNumbers));
        strategyName = matchedRec?.name || "AI 추천";
      } else {
        strategyName = "수동 선택";
      }
      
      onAdd(selectedNumbers, strategyName);
      setSelectedNumbers([]);
      setMemo("");
      setIsAutoSelect(false);
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
      {/* 헤더 (상단 버튼 제거) */}
      <div style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#1f2937",
          margin: "0 0 8px 0",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          🗂️ 로또수첩
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 16px 0" }}>
          나만의 로또 번호를 기록하고 당첨을 확인하세요
        </p>

        {/* 통계 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <div style={{ 
            flex: 1, 
            padding: "12px 8px", 
            backgroundColor: "#f8fafc", 
            borderRadius: "8px", 
            textAlign: "center",
            border: "1px solid #f1f5f9"
          }}>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", margin: "0" }}>{stats.total}</p>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>전체</p>
          </div>
          <div style={{ 
            flex: 1, 
            padding: "12px 8px", 
            backgroundColor: "#fefce8", 
            borderRadius: "8px", 
            textAlign: "center",
            border: "1px solid #fef3c7"
          }}>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#d97706", margin: "0" }}>{stats.saved}</p>
            <p style={{ fontSize: "12px", color: "#d97706", margin: "0" }}>저장</p>
          </div>
          <div style={{ 
            flex: 1, 
            padding: "12px 8px", 
            backgroundColor: "#eff6ff", 
            borderRadius: "8px", 
            textAlign: "center",
            border: "1px solid #dbeafe"
          }}>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb", margin: "0" }}>{stats.planned}</p>
            <p style={{ fontSize: "12px", color: "#2563eb", margin: "0" }}>구매예정</p>
          </div>
          <div style={{ 
            flex: 1, 
            padding: "12px 8px", 
            backgroundColor: "#f0fdf4", 
            borderRadius: "8px", 
            textAlign: "center",
            border: "1px solid #bbf7d0"
          }}>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a", margin: "0" }}>{stats.purchased}</p>
            <p style={{ fontSize: "12px", color: "#16a34a", margin: "0" }}>구매완료</p>
          </div>
        </div>

        {/* 새 번호 등록 토글 버튼 */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: "100%",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.3)"
            }}
          >
            + 새 번호 등록하기
          </button>
        )}
      </div>

      {/* 실제 로또용지 스타일 번호 등록 폼 */}
      {showAddForm && (
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          {/* 로또 용지 헤더 */}
          <div style={{
            textAlign: "center",
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            border: "2px solid #fecaca"
          }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "bold", 
              margin: "0 0 4px 0"
            }}>
              🏮 Lotto 6/45
            </h3>
            <p style={{ 
              fontSize: "12px", 
              margin: "0",
              opacity: 0.9
            }}>
              구매용지 | 1~45번 중 서로 다른 6개 번호 선택
            </p>
          </div>

          {/* A게임 (단일 게임 모드) */}
          <div style={{
            backgroundColor: "#fefefe",
            padding: "16px",
            borderRadius: "8px",
            border: "2px solid #dc2626",
            marginBottom: "12px"
          }}>
            {/* 게임 헤더 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              padding: "8px",
              backgroundColor: "#dc2626",
              color: "white",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              A 게임 | 1,000원
            </div>

            {/* 실제 로또 용지 번호 배치 (7개씩 7행) */}
            <div style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #fecaca"
            }}>
              {/* 1-7 */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px", justifyContent: "center" }}>
                {Array.from({ length: 7 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 8-14 */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px", justifyContent: "center" }}>
                {Array.from({ length: 7 }, (_, i) => i + 8).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 15-21 */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px", justifyContent: "center" }}>
                {Array.from({ length: 7 }, (_, i) => i + 15).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 22-28 */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px", justifyContent: "center" }}>
                {Array.from({ length: 7 }, (_, i) => i + 22).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 29-35 */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px", justifyContent: "center" }}>
                {Array.from({ length: 7 }, (_, i) => i + 29).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 36-42 */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px", justifyContent: "center" }}>
                {Array.from({ length: 7 }, (_, i) => i + 36).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 43-45 (마지막 3개) */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "8px", justifyContent: "center" }}>
                {Array.from({ length: 3 }, (_, i) => i + 43).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isAutoSelect}
                    style={{
                      width: "32px",
                      height: "28px",
                      borderRadius: "4px",
                      border: selectedNumbers.includes(num) ? "2px solid #dc2626" : "1px solid #d1d5db",
                      backgroundColor: selectedNumbers.includes(num) ? "#dc2626" : "white",
                      color: selectedNumbers.includes(num) ? "white" : "#374151",
                      fontSize: "11px",
                      fontWeight: selectedNumbers.includes(num) ? "bold" : "normal",
                      cursor: isAutoSelect ? "not-allowed" : "pointer",
                      opacity: isAutoSelect ? 0.6 : 1
                    }}
                  >
                    {num}
                  </button>
                ))}
                {/* 빈 공간 4개 (7개 맞춤을 위해) */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ width: "32px", height: "28px" }} />
                ))}
              </div>

              {/* 자동선택 체크박스 (실제 로또용지 스타일) */}
              <div style={{
                marginTop: "12px",
                padding: "8px",
                backgroundColor: "#fee2e2",
                borderRadius: "4px",
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#dc2626"
                }}>
                  <input
                    type="checkbox"
                    checked={isAutoSelect}
                    onChange={toggleAutoSelect}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#dc2626"
                    }}
                  />
                  🎲 자동선택
                </label>
                <span style={{
                  fontSize: "10px",
                  color: "#991b1b",
                  marginLeft: "8px"
                }}>
                  (컴퓨터가 자동으로 번호 선택)
                </span>
              </div>
            </div>

            {/* 선택된 번호 표시 */}
            {selectedNumbers.length > 0 && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: isAutoSelect ? "#dcfce7" : "#eff6ff",
                borderRadius: "6px",
                border: isAutoSelect ? "1px solid #bbf7d0" : "1px solid #bfdbfe"
              }}>
                <div style={{ textAlign: "center", marginBottom: "8px" }}>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: isAutoSelect ? "#166534" : "#1d4ed8",
                    margin: "0"
                  }}>
                    {isAutoSelect ? "🎲 자동 선택된 번호" : "✅ 선택한 번호"} ({selectedNumbers.length}/6)
                  </p>
                </div>
                <div style={{
                  display: "flex",
                  gap: "6px",
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>
                  {selectedNumbers.map((num, i) => (
                    <LottoNumberBall key={i} number={num} size="sm" />
                  ))}
                  {/* 빈 칸들 */}
                  {Array.from({ length: 6 - selectedNumbers.length }).map((_, i) => (
                    <div key={`empty-${i}`} style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      border: "2px dashed #d1d5db",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#9ca3af"
                    }}>
                      ?
                    </div>
                  ))}
                </div>
                {selectedNumbers.length === 6 && (
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <span style={{
                      fontSize: "11px",
                      color: isAutoSelect ? "#166534" : "#1d4ed8",
                      fontWeight: "600"
                    }}>
                      ✅ 6개 번호 선택 완료!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI 추천번호 섹션 */}
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#fefce8",
            borderRadius: "8px",
            border: "1px solid #fef3c7"
          }}>
            <h4 style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#92400e",
              margin: "0 0 8px 0",
              textAlign: "center"
            }}>
              🤖 AI 추천번호 적용하기
            </h4>
            <p style={{
              fontSize: "11px",
              color: "#a16207",
              margin: "0 0 12px 0",
              textAlign: "center"
            }}>
              번호추천 메뉴에서 생성된 AI 분석 번호
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {aiRecommendedNumbers.map((rec, index) => (
                <button
                  key={index}
                  onClick={() => applyRecommendedNumbers(rec.numbers)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "white",
                    border: "1px solid #fcd34d",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#92400e" }}>
                      {rec.name}
                    </span>
                    <span style={{ fontSize: "9px", color: "#a16207" }}>
                      적용하기 →
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                    {rec.numbers.map((num, i) => (
                      <div key={i} style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "#d97706",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        fontWeight: "bold"
                      }}>
                        {num}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 메모 입력 */}
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px"
            }}>
              📝 메모 (선택사항)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 행운의 번호, 신촌에서 구매 예정"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "12px",
                boxSizing: "border-box",
                backgroundColor: "white"
              }}
            />
          </div>

          {/* 저장/취소 버튼 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedNumbers([]);
                setMemo("");
                setIsAutoSelect(false);
              }}
              style={{
                flex: 1,
                backgroundColor: "#6b7280",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              취소
            </button>
            <button
              onClick={saveNumbers}
              disabled={selectedNumbers.length !== 6}
              style={{
                flex: 2,
                backgroundColor: selectedNumbers.length === 6 ? "#dc2626" : "#9ca3af",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: selectedNumbers.length === 6 ? "pointer" : "not-allowed",
                boxShadow: selectedNumbers.length === 6 ? "0 4px 12px rgba(220, 38, 38, 0.4)" : "none",
                transform: selectedNumbers.length === 6 ? "translateY(-2px)" : "none",
                transition: "all 0.2s"
              }}
            >
              {selectedNumbers.length === 6 ? "🎫 번호 저장하기" : `${6 - selectedNumbers.length}개 더 선택`}
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
