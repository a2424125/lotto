import React, { useState, useEffect } from "react";
import Dashboard from "./components/pages/Dashboard";
import Recommend from "./components/pages/Recommend";
import Stats from "./components/pages/Stats";
import Purchase from "./components/pages/Purchase";
import MiniGame from "./components/pages/MiniGame";
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
  const [roundRange, setRoundRange] = useState<{
    latestRound: number;
    oldestRound: number;
  }>({
    latestRound: 1178,
    oldestRound: 1178,
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<{
    lastUpdate: Date | null;
    isRealTime: boolean;
    source: "crawled" | "fallback";
  }>({
    lastUpdate: null,
    isRealTime: false,
    source: "fallback",
  });

  // 📅 다음 추첨 정보 상태 추가
  const [nextDrawInfo, setNextDrawInfo] = useState<{
    round: number;
    date: string;
    estimatedJackpot: number;
    daysUntilDraw: number;
  } | null>(null);

  // 메뉴 아이템 배열
  const menuItems = [
    { id: "dashboard", name: "🏠 홈" },
    { id: "recommend", name: "🎯 번호추천" },
    { id: "stats", name: "📊 통계분석" },
    { id: "purchase", name: "🛍️ 내번호함" },
    { id: "minigame", name: "🎮 미니게임" },
    { id: "settings", name: "⚙️ 설정" },
  ];

  // 실시간 당첨번호 데이터 로드
  useEffect(() => {
    loadLottoData();
    loadNextDrawInfo(); // 📅 다음 추첨 정보도 로드
  }, []);

  const loadLottoData = async () => {
    setIsDataLoading(true);
    try {
      console.log("로또 데이터 로딩 시작...");

      // ✅ 전체 데이터 가져오기 (제한 없이 모든 데이터)
      const historyResponse = await lottoDataManager.getHistory(9999);

      if (historyResponse.success && historyResponse.data) {
        // 기존 형식으로 변환 (6개 당첨번호 + 1개 보너스번호)
        const formattedData = historyResponse.data.map(
          (result: LottoDrawResult) => [...result.numbers, result.bonusNumber]
        );

        // ✅ 실제 회차 범위 계산
        if (historyResponse.data.length > 0) {
          const latestRound = historyResponse.data[0].round;
          const oldestRound =
            historyResponse.data[historyResponse.data.length - 1].round;
          setRoundRange({ latestRound, oldestRound });
        }

        setPastWinningNumbers(formattedData);
        setDataStatus({
          lastUpdate: new Date(),
          isRealTime: true,
          source: "crawled",
        });

        console.log("실시간 데이터 로드 완료:", formattedData.length, "회차");
      } else {
        throw new Error(historyResponse.error || "데이터 로드 실패");
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setDataStatus({
        lastUpdate: new Date(),
        isRealTime: false,
        source: "fallback",
      });

      // 폴백 데이터는 이미 기본값으로 설정됨
    } finally {
      setIsDataLoading(false);
    }
  };

  // 📅 다음 추첨 정보 로드
  const loadNextDrawInfo = async () => {
    try {
      console.log("📅 다음 추첨 정보 로딩...");
      const nextInfo = await lottoDataManager.getNextDrawInfo();
      setNextDrawInfo(nextInfo);
      console.log("📅 다음 추첨 정보 로드 완료:", nextInfo);
    } catch (error) {
      console.error("❌ 다음 추첨 정보 로드 실패:", error);
      // 폴백 정보 계산
      const fallbackInfo = {
        round:
          pastWinningNumbers.length > 0
            ? (parseInt(pastWinningNumbers[0][0]?.toString()) || 1177) + 1
            : 1179,
        date: getNextSaturday(),
        estimatedJackpot: 3500000000,
        daysUntilDraw: getDaysUntilNextSaturday(),
      };
      setNextDrawInfo(fallbackInfo);
    }
  };

  // 수동 데이터 새로고침 (개선됨)
  const refreshData = async () => {
    try {
      console.log("🔄 전체 데이터 새로고침 시작...");
      setIsDataLoading(true);

      // 1. 로또 당첨번호 데이터 업데이트
      const result = await lottoDataManager.forceUpdate();

      // 2. 당첨번호 데이터 다시 로드
      await loadLottoData();

      // 3. 다음 추첨 정보 다시 로드
      await loadNextDrawInfo();

      if (result.success) {
        alert("✅ 모든 데이터가 업데이트되었습니다!");
      } else {
        alert("⚠️ 일부 데이터 업데이트에 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error("❌ 데이터 새로고침 중 오류:", error);
      alert("❌ 데이터 새로고침 중 오류가 발생했습니다.");
    }
  };

  // 유틸리티 함수들
  const getNextSaturday = (): string => {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay()) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    return nextSaturday.toISOString().split("T")[0];
  };

  const getDaysUntilNextSaturday = (): number => {
    const now = new Date();
    return (6 - now.getDay()) % 7 || 7;
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
      nextDrawInfo, // 📅 다음 추첨 정보도 포함
      exportDate: new Date().toISOString(),
      version: "2.1.0", // 📅 버전 업데이트
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
    // 📅 다음 추첨 정보도 가져오기 (선택적)
    if (data.nextDrawInfo) {
      setNextDrawInfo(data.nextDrawInfo);
    }
  };

  const resetData = () => {
    setPurchaseHistory([]);
    setNextDrawInfo(null); // 📅 다음 추첨 정보도 초기화
  };

  // 📅 개선된 Settings props
  const settingsProps = {
    onDataExport: exportData,
    onDataImport: importData,
    onDataReset: resetData,
    onRefreshData: refreshData, // 📅 새로고침 기능 추가
    dataStatus: {
      ...dataStatus,
      nextDrawInfo, // 📅 다음 추첨 정보 포함
    },
  };

  // 컴포넌트 렌더링
  const renderContent = () => {
    const commonProps = {
      pastWinningNumbers,
      roundRange,
      isDataLoading,
      dataStatus,
    };

    switch (currentMenu) {
      case "dashboard":
        return (
          <Dashboard
            {...commonProps}
            onMenuChange={setCurrentMenu}
            generate1stGradeNumbers={generate1stGradeNumbers}
            onRefreshData={refreshData} // 📅 새로고침 함수 전달
            nextDrawInfo={nextDrawInfo} // 📅 다음 추첨 정보 전달 (선택적)
          />
        );
      case "recommend":
        return (
          <Recommend
            {...commonProps}
            onAddToPurchaseHistory={addToPurchaseHistory}
          />
        );
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
      case "minigame":
        return <MiniGame {...commonProps} />;
      case "settings":
        return <Settings {...settingsProps} />;
      default:
        return (
          <Dashboard
            {...commonProps}
            onMenuChange={setCurrentMenu}
            generate1stGradeNumbers={generate1stGradeNumbers}
            onRefreshData={refreshData}
            nextDrawInfo={nextDrawInfo}
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
              animation: isDataLoading ? "pulse 2s infinite" : "none",
            }}
            title={dataStatus.isRealTime ? "실시간 데이터" : "오프라인 데이터"}
          />
          {/* 📅 다음 추첨 D-Day 표시 */}
          {nextDrawInfo && nextDrawInfo.daysUntilDraw <= 1 && (
            <span
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                backgroundColor: "#ef4444",
                borderRadius: "4px",
                fontWeight: "bold",
                animation: "pulse 2s infinite",
              }}
            >
              {nextDrawInfo.daysUntilDraw === 0 ? "오늘 추첨!" : "내일 추첨!"}
            </span>
          )}
        </div>
        <button
          onClick={refreshData}
          disabled={isDataLoading}
          style={{
            padding: "6px",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            cursor: isDataLoading ? "not-allowed" : "pointer",
            borderRadius: "4px",
            fontSize: "14px",
            opacity: isDataLoading ? 0.6 : 1,
            animation: isDataLoading ? "spin 2s linear infinite" : "none",
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
              <div
                style={{
                  marginTop: "16px",
                  padding: "8px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                <div style={{ color: "#6b7280", marginBottom: "4px" }}>
                  데이터 상태
                </div>
                <div
                  style={{
                    color: dataStatus.isRealTime ? "#059669" : "#d97706",
                    fontWeight: "500",
                  }}
                >
                  {dataStatus.isRealTime ? "🟢 실시간" : "🟡 오프라인"}
                </div>
                {dataStatus.lastUpdate && (
                  <div style={{ color: "#9ca3af", marginTop: "2px" }}>
                    {dataStatus.lastUpdate.toLocaleTimeString()}
                  </div>
                )}
                {/* 📊 실제 회차 범위 표시 */}
                <div
                  style={{
                    marginTop: "8px",
                    padding: "6px",
                    backgroundColor: "#e0f2fe",
                    borderRadius: "4px",
                    border: "1px solid #81d4fa",
                  }}
                >
                  <div
                    style={{
                      color: "#0277bd",
                      fontWeight: "500",
                      fontSize: "11px",
                    }}
                  >
                    📊 {roundRange.latestRound}~{roundRange.oldestRound}회차 (
                    {pastWinningNumbers.length}개)
                  </div>
                </div>
                {/* 📅 다음 추첨 정보 */}
                {nextDrawInfo && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "6px",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "4px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <div
                      style={{
                        color: "#166534",
                        fontWeight: "500",
                        fontSize: "11px",
                      }}
                    >
                      📅 다음 {nextDrawInfo.round}회차
                    </div>
                    <div style={{ color: "#16a34a", fontSize: "10px" }}>
                      {nextDrawInfo.daysUntilDraw === 0
                        ? "오늘 추첨!"
                        : nextDrawInfo.daysUntilDraw === 1
                        ? "내일 추첨!"
                        : `${nextDrawInfo.daysUntilDraw}일 후`}
                    </div>
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
          <div
            style={{
              position: "fixed",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "12px",
              zIndex: 40,
            }}
          >
            📡 {roundRange.latestRound}~{roundRange.oldestRound}회차 데이터
            업데이트 중...
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
        {dataStatus.source === "crawled" && (
          <span style={{ color: "#059669", marginLeft: "8px" }}>
            • {roundRange.latestRound}~{roundRange.oldestRound}회차 실시간 연동
          </span>
        )}
        {/* 📅 다음 추첨 미니 정보 */}
        {nextDrawInfo && nextDrawInfo.daysUntilDraw <= 3 && (
          <span
            style={{ color: "#dc2626", marginLeft: "8px", fontWeight: "bold" }}
          >
            • 다음 추첨{" "}
            {nextDrawInfo.daysUntilDraw === 0
              ? "오늘!"
              : nextDrawInfo.daysUntilDraw === 1
              ? "내일!"
              : `${nextDrawInfo.daysUntilDraw}일 후`}
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
