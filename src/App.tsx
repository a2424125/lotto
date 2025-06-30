import React, { useState, useEffect } from "react";
import Dashboard from "./components/pages/Dashboard";
import Recommend from "./components/pages/Recommend";
import Check from "./components/pages/Check";
import Stats from "./components/pages/Stats";
import Purchase from "./components/pages/Purchase";
import Settings from "./components/pages/Settings";

interface PurchaseItem {
  id: number;
  numbers: number[];
  strategy: string;
  date: string;
  checked: boolean;
  status: "saved" | "planned" | "purchased"; // 추가
  memo?: string; // 추가
  purchaseDate?: string; // 추가
}

const LottoApp = () => {
  // 상태 관리
  const [currentMenu, setCurrentMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseItem[]>([]);

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

  // 메뉴 아이템 배열
  const menuItems = [
    { id: "dashboard", name: "🏠 홈" },
    { id: "recommend", name: "🎯 번호추천" },
    { id: "check", name: "✅ 당첨확인" },
    { id: "stats", name: "📊 통계분석" },
    { id: "purchase", name: "🛍️ 내번호함" },
    { id: "settings", name: "⚙️ 설정" },
  ];

  // 로또 번호 생성 로직들 (기존과 동일)
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

  // 내번호함 관련 함수들 (수정됨)
  const addToPurchaseHistory = (numbers: number[], strategy: string) => {
    const newPurchase: PurchaseItem = {
      id: Date.now(),
      numbers,
      strategy,
      date: new Date().toLocaleDateString(),
      checked: false,
      status: "saved", // 기본값: 저장 상태
      memo: "",
    };
    setPurchaseHistory((prev) => [newPurchase, ...prev]);
  };

  const deletePurchaseItem = (id: number) => {
    setPurchaseHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const checkPurchaseItem = (id: number, numbers: number[]) => {
    setPurchaseHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: true } : item))
    );
  };

  // 설정 관련 함수들
  const exportData = () => {
    const data = {
      purchaseHistory,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lotto_data_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: any) => {
    if (data.purchaseHistory) {
      setPurchaseHistory(data.purchaseHistory);
    }
  };

  const resetData = () => {
    setPurchaseHistory([]);
  };

  // 컴포넌트 렌더링
  const renderContent = () => {
    switch (currentMenu) {
      case "dashboard":
        return (
          <Dashboard
            pastWinningNumbers={pastWinningNumbers}
            onMenuChange={setCurrentMenu}
            generate1stGradeNumbers={generate1stGradeNumbers}
          />
        );
      case "recommend":
        return (
          <Recommend
            pastWinningNumbers={pastWinningNumbers}
            onAddToPurchaseHistory={addToPurchaseHistory}
          />
        );
      case "check":
        return <Check pastWinningNumbers={pastWinningNumbers} />;
      case "stats":
        return <Stats pastWinningNumbers={pastWinningNumbers} />;
      case "purchase":
        return (
          <Purchase
            purchaseHistory={purchaseHistory}
            onDelete={deletePurchaseItem}
            onCheck={checkPurchaseItem}
            onAdd={addToPurchaseHistory} // 새로 추가
            pastWinningNumbers={pastWinningNumbers}
          />
        );
      case "settings":
        return (
          <Settings
            onDataExport={exportData}
            onDataImport={importData}
            onDataReset={resetData}
          />
        );
      default:
        return (
          <Dashboard
            pastWinningNumbers={pastWinningNumbers}
            onMenuChange={setCurrentMenu}
            generate1stGradeNumbers={generate1stGradeNumbers}
          />
        );
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

export default LottoApp;
