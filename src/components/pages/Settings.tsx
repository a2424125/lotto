import React, { useState } from "react";

interface SettingsProps {
  onDataExport: () => void;
  onDataImport: (data: any) => void;
  onDataReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  onDataExport,
  onDataImport,
  onDataReset,
}) => {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [autoSave, setAutoSave] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onDataImport(data);
          alert("데이터를 성공적으로 가져왔습니다!");
        } catch (error) {
          alert("올바르지 않은 파일 형식입니다.");
        }
      };
      reader.readAsText(file);
    }
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
          ⚙️ 설정
        </h2>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 16px 0" }}>
          앱 환경설정 및 데이터 관리
        </p>
      </div>

      {/* 일반 설정 */}
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
            margin: "0 0 12px 0",
          }}
        >
          일반 설정
        </h3>

        {/* 알림 설정 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            marginBottom: "8px",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#1f2937",
                margin: "0",
              }}
            >
              🔔 추첨일 알림
            </h4>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
              매주 토요일 추첨 전 알림을 받습니다
            </p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: notifications ? "#10b981" : "#d1d5db",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "white",
                position: "absolute",
                top: "2px",
                left: notifications ? "22px" : "2px",
                transition: "all 0.2s",
              }}
            />
          </button>
        </div>

        {/* 테마 설정 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            marginBottom: "8px",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#1f2937",
                margin: "0",
              }}
            >
              🌙 다크 모드
            </h4>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
              어두운 테마로 눈의 피로를 줄입니다
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: theme === "dark" ? "#10b981" : "#d1d5db",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "white",
                position: "absolute",
                top: "2px",
                left: theme === "dark" ? "22px" : "2px",
                transition: "all 0.2s",
              }}
            />
          </button>
        </div>

        {/* 자동 저장 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#1f2937",
                margin: "0",
              }}
            >
              💾 자동 저장
            </h4>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
              추천받은 번호를 자동으로 내번호함에 저장
            </p>
          </div>
          <button
            onClick={() => setAutoSave(!autoSave)}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: autoSave ? "#10b981" : "#d1d5db",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "white",
                position: "absolute",
                top: "2px",
                left: autoSave ? "22px" : "2px",
                transition: "all 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      {/* 데이터 관리 */}
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
            margin: "0 0 12px 0",
          }}
        >
          데이터 관리
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* 데이터 내보내기 */}
          <button
            onClick={onDataExport}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            📤 데이터 내보내기
          </button>

          {/* 데이터 가져오기 */}
          <label
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textAlign: "center",
            }}
          >
            📥 데이터 가져오기
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              style={{ display: "none" }}
            />
          </label>

          {/* 데이터 초기화 */}
          <button
            onClick={() => setShowConfirmReset(true)}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            🗑️ 모든 데이터 초기화
          </button>
        </div>
      </div>

      {/* 앱 정보 */}
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
          앱 정보
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280" }}>버전</span>
            <span
              style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}
            >
              1.0.0
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              최종 업데이트
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}
            >
              2025.06.30
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280" }}>개발자</span>
            <span
              style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}
            >
              Lotto Team
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#f0f9ff",
            borderRadius: "6px",
            border: "1px solid #bfdbfe",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#1e40af",
              margin: "0",
              textAlign: "center",
            }}
          >
            🍀 행운이 함께하는 로또 6/45 앱입니다! <br />
            과도한 구매는 가계에 부담이 됩니다.
          </p>
        </div>
      </div>

      {/* 초기화 확인 모달 */}
      {showConfirmReset && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowConfirmReset(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "300px",
              margin: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 8px 0",
                textAlign: "center",
              }}
            >
              ⚠️ 데이터 초기화
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "0 0 16px 0",
                textAlign: "center",
              }}
            >
              모든 저장된 번호와 설정이 삭제됩니다.
              <br />
              정말로 초기화하시겠습니까?
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowConfirmReset(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  onDataReset();
                  setShowConfirmReset(false);
                  alert("모든 데이터가 초기화되었습니다.");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
