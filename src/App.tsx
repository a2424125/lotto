import React, { useState, useEffect } from "react";
import Dashboard from "./components/pages/Dashboard";
import Recommend from "./components/pages/Recommend";
import Check from "./components/pages/Check";
import Stats from "./components/pages/Stats";
import Purchase from "./components/pages/Purchase";
import Settings from "./components/pages/Settings";
import { lottoDataManager } from "./services/lottoDataManager";
import { LottoDrawResult } from "./types/lotto";

interface PurchaseItem {
  id: number;
  numbers: number[];
  strategy: string;
  date: string;
  checked: boolean;
  status: "saved" | "favorite" | "checked";
  memo?: string;
  purchaseDate?: string;
}

const LottoApp = () => {
  // 상태 관리
  const [currentMenu, setCurrentMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseItem[]>([]);
  
  // 새로운 상태: 실시간 당첨번호 데이터
  const [pastWinningNumbers, setPastWinningNumbers] = useState<number[][]>([
    [3, 7, 15, 16, 19, 43, 21], // 기본값 (폴백)
  ]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<{
    lastUpdate: Date | null;
    isRealTime: boolean;
    source: 'crawled' | 'fallback';
  }>({
    lastUpdate: null,
    isRealTime: false,
    source: 'fallback'
  });

  // 메뉴 아이템 배열
  const menuItems = [
    { id: "dashboard", name: "🏠 홈" },
    { id: "recommend", name: "🎯 번호추천" },
    { id: "check", name: "✅ 당첨확인" },
    { id: "stats", name: "📊 통계분석" },
    { id: "purchase", name: "🛍️ 내번호함" },
    { id: "settings", name: "⚙️ 설정" },
  ];

  // 실시간 당첨번호 데이터 로드
  useEffect(() => {
    loadLottoData();
  }, []);

  const loadLottoData = async () => {
    setIsDataLoading(true);
    try {
      console.log('로또 데이터 로딩 시작...');
      
      // 최신 10회차 데이터 가져오기
      const historyResponse = await lottoDataManager.getHistory(10);
      
      if (historyResponse.success && historyResponse.data) {
        // 기존 형식으로 변환 (6개 당첨번호 + 1개 보너스번호)
        const formattedData = historyResponse.data.map((result: LottoDrawResult) => [
          ...result.numbers,
          result.bonusNumber
        ]);

        setPastWinningNumbers(formattedData);
        setDataStatus({
          lastUpdate: new Date(),
          isRealTime: true,
          source: 'crawled'
        });
        
        console.log('실시간 데이터 로드 완료:', formattedData.length, '회차');
      } else {
        throw new Error(historyResponse.error || '데이터 로드 실패');
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setDataStatus({
        lastUpdate: new Date(),
        isRealTime: false,
        source: 'fallback'
      });
      
      // 폴백 데이터는 이미 기본값으로 설정됨
    } finally {
      setIsDataLoading(false);
    }
  };

  // 수동 데이터 새로고침
  const refreshData = async () => {
    try {
      const result = await lottoDataManager.forceUpdate();
      if (result.success) {
        await loadLottoData();
        alert('데이터가 업데이트되었습니다!');
      } else {
        alert('데이터 업데이트에 실패했습니다: ' + result.message);
      }
    } catch (error) {
      alert('데이터 새로고침 중 오류가 발생했습니다.');
    }
  };

  // 로또 번호 생성 로직들 (기존과 동일하지만 실시간 데이터 사용)
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

  // 내번호함 관련 함수들 (기존과 동일)
  const addToPurchaseHistory = (numbers: number[], strategy: string) => {
    const newPurchase: PurchaseItem = {
      id: Date.now(),
      numbers,
      strategy,
      date: new Date().toLocaleDateString(),
      checked: false,
      status: "saved",
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
      dataStatus,
      exportDate: new Date().toISOString(),
      version: "2.0.0",
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
    const commonProps = {
      pastWinningNumbers,
      isDataLoading,
      dataStatus
    };

    switch (currentMenu) {
      case "dashboard":
        return (
          <Dashboard
            {...commonProps}
            onMenuChange={setCurrentMenu}
            generate1stGradeNumbers={generate1stGradeNumbers}
            onRefreshData={refreshData}
          />
        );
      case "recommend":
        return (
          <Recommend
            {...commonProps}
            onAddToPurchaseHistory={addToPurchaseHistory}
          />
        );
      case "check":
        return <Check {...commonProps} />;
      case "stats":
        return <Stats {...commonProps} />;
      case "purchase":
        return (
          <Purchase
            purchaseHistory={purchaseHistory}
            onDelete={deletePurchaseItem}
            onCheck={checkPurchaseItem}
            onAdd={addToPurchaseHistory}
            pastWinningNumbers={pastWinningNumbers}
          />
        );
      case "settings":
        return (
          <Settings
            onDataExport={exportData}
            onDataImport={importData}
            onDataReset={resetData}
            onRefreshData={refreshData}
            dataStatus={dataStatus}
          />
        );
      default:
        return (
          <Dashboard
            {...commonProps}
            onMenuChange={setCurrentMenu}
            generate1stGradeNumbers={generate1stGradeNumbers}
            onRefreshData={refreshData}
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
            로또 6/45
          </h1>
          {/* 데이터 상태 인디케이터 */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: dataStatus.isRealTime ? "#10b981" : "#f59e0b",
              animation: isDataLoading ? "pulse 2s infinite" : "none"
            }}
            title={dataStatus.isRealTime ? "실시간 데이터" : "오프라인 데이터"}
          />
        </div>
        <button
          onClick={refreshData}
          style={{
            padding: "6px",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "14px",
          }}
          title="데이터 새로고침"
        >
          🔄
        </button>
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
              
              {/* 데이터 상태 정보 */}
              <div style={{ 
                marginTop: "16px", 
                padding: "8px", 
                backgroundColor: "#f3f4f6", 
                borderRadius: "6px",
                fontSize: "12px"
              }}>
                <div style={{ color: "#6b7280", marginBottom: "4px" }}>
                  데이터 상태
                </div>
                <div style={{ 
                  color: dataStatus.isRealTime ? "#059669" : "#d97706",
                  fontWeight: "500"
                }}>
                  {dataStatus.isRealTime ? "🟢 실시간" : "🟡 오프라인"}
                </div>
                {dataStatus.lastUpdate && (
                  <div style={{ color: "#9ca3af", marginTop: "2px" }}>
                    {dataStatus.lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div style={{ paddingBottom: "56px" }}>
        {isDataLoading && (
          <div style={{
            position: "fixed",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "12px",
            zIndex: 40
          }}>
            📡 데이터 업데이트 중...
          </div>
        )}
        {renderContent()}
      </div>

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
        {dataStatus.source === 'crawled' && (
          <span style={{ color: "#059669", marginLeft: "8px" }}>
            • 실시간 연동
          </span>
        )}
      </div>

      {/* 애니메이션 CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default LottoApp;
