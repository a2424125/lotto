import React, { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
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
  round: number;
  error?: string;
}

const Check: React.FC<CheckProps> = ({ pastWinningNumbers }) => {
  // State 선언
  const [checkNumbers, setCheckNumbers] = useState("");
  const [selectedRound, setSelectedRound] = useState(0);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [scanDebugInfo, setScanDebugInfo] = useState("");
  const [currentCamera, setCurrentCamera] = useState<"environment" | "user">(
    "environment"
  );

  // Refs 선언
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // 회차 목록 생성
  const rounds = pastWinningNumbers
    .map((_, index) => {
      const currentRound = 1177;
      return currentRound - index;
    })
    .slice(0, 50);

  // QR 코드에서 로또 번호 추출
  const extractLottoNumbers = (qrText: string): string | null => {
    console.log("🔍 QR 텍스트 분석:", qrText);

    // 다양한 패턴으로 로또 번호 찾기
    const patterns = [
      // 쉼표로 구분된 6개 숫자
      /(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})/,
      // 공백으로 구분된 6개 숫자
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})/,
      // 하이픈으로 구분된 6개 숫자
      /(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})/,
      // 연속된 6개 2자리 숫자
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
    ];

    for (const pattern of patterns) {
      const match = qrText.match(pattern);
      if (match) {
        const numbers = match.slice(1).map((num) => parseInt(num));

        // 로또 번호 유효성 검사 (1-45 범위)
        if (
          numbers.every((num) => num >= 1 && num <= 45) &&
          new Set(numbers).size === 6
        ) {
          console.log("✅ 로또 번호 추출 성공:", numbers);
          return numbers.join(",");
        }
      }
    }

    // 단순히 1-45 범위의 숫자들이 6개 있는지 확인
    const allNumbers = qrText.match(/\b([1-9]|[1-3]\d|4[0-5])\b/g);
    if (allNumbers && allNumbers.length >= 6) {
      const uniqueNumbers = [
        ...new Set(allNumbers.slice(0, 6).map((n) => parseInt(n))),
      ];
      if (uniqueNumbers.length === 6) {
        console.log("✅ 일반 숫자에서 로또 번호 추출:", uniqueNumbers);
        return uniqueNumbers.join(",");
      }
    }

    return null;
  };

  // 개선된 jsQR 기반 QR 코드 스캔
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.log("⏳ 비디오 준비 중...", video.readyState);
      return;
    }

    try {
      console.log("🔍 jsQR 스캔 시도 중...", new Date().toLocaleTimeString());

      // 비디오 크기 확인
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (videoWidth === 0 || videoHeight === 0) {
        console.log("❌ 비디오 크기 0");
        return;
      }

      // 캔버스 크기를 비디오에 맞춤
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      console.log(`📷 비디오 크기: ${videoWidth}x${videoHeight}`);

      // 비디오 프레임을 캔버스에 그리기
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 중앙 영역만 스캔 (성능 향상)
      const scanX = Math.floor(canvas.width * 0.1);
      const scanY = Math.floor(canvas.height * 0.1);
      const scanWidth = Math.floor(canvas.width * 0.8);
      const scanHeight = Math.floor(canvas.height * 0.8);

      console.log(
        `🎯 스캔 영역: ${scanX}, ${scanY}, ${scanWidth}x${scanHeight}`
      );

      // 이미지 데이터 추출 (중앙 부분만)
      const imageData = ctx.getImageData(scanX, scanY, scanWidth, scanHeight);

      console.log(
        `📊 이미지 데이터 크기: ${imageData.width}x${imageData.height}, 픽셀: ${imageData.data.length}`
      );

      // 이미지 전처리 (밝기/대비 향상)
      const enhancedData = enhanceImageData(imageData);

      // QR 코드 분석
      const code = jsQR(
        enhancedData.data,
        enhancedData.width,
        enhancedData.height,
        {
          inversionAttempts: "dontInvert", // 성능 향상
        }
      );

      if (code) {
        console.log("🎯 QR 코드 발견 (jsQR):", code.data);
        setScanDebugInfo(`📱 QR 코드 발견: ${code.data.substring(0, 50)}...`);

        // 로또 번호 추출 시도
        const lottoNumbers = extractLottoNumbers(code.data);

        if (lottoNumbers) {
          // 성공적으로 로또 번호 추출
          setCheckNumbers(lottoNumbers);
          setScanDebugInfo(`✅ 로또 번호 인식 성공: ${lottoNumbers}`);

          // 스캔 중지
          stopQRScan();

          // 사용자에게 알림
          alert(
            `🎉 QR 코드에서 로또 번호를 찾았습니다!\n번호: ${lottoNumbers}`
          );
        } else {
          console.log("❌ 로또 번호 추출 실패:", code.data.substring(0, 100));
          setScanDebugInfo(
            `❌ QR 코드를 찾았지만 로또 번호가 아닙니다: ${code.data.substring(
              0,
              30
            )}...`
          );
        }
      } else {
        // 디버깅용 - 너무 많은 로그 방지
        if (Math.random() < 0.05) {
          // 5%만 로그
          console.log("🔍 QR 코드 없음 (jsQR)");
        }
      }
    } catch (error) {
      console.error("❌ jsQR 스캔 오류:", error);
      setScanDebugInfo(`❌ QR 스캔 오류: ${error.message}`);
    }
  }, [isScanning]);

  // 이미지 데이터 전처리 함수
  const enhanceImageData = (imageData: ImageData): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);

    // 밝기와 대비 향상
    for (let i = 0; i < data.length; i += 4) {
      // RGB 값 가져오기
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 그레이스케일로 변환
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      // 대비 향상 (임계값 적용)
      const enhanced = gray > 128 ? 255 : 0;

      data[i] = enhanced; // R
      data[i + 1] = enhanced; // G
      data[i + 2] = enhanced; // B
      // Alpha는 그대로
    }

    return new ImageData(data, imageData.width, imageData.height);
  };

  // QR 스캔 시작
  const startQRScan = async () => {
    console.log("🎯 QR 스캔 시작 버튼 클릭됨");
    setScanDebugInfo("📱 QR 스캔 준비 중...");

    try {
      setIsScanning(true);

      // 카메라 권한 요청 (모바일 최적화 해상도)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentCamera,
          width: { ideal: 640, max: 1280 }, // 해상도 낮춤
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanDebugInfo("📷 카메라 연결 성공! QR 코드를 스캔 중...");
        console.log("✅ 카메라 시작 성공");

        // BarcodeDetector 지원 확인
        if (!("BarcodeDetector" in window)) {
          throw new Error(
            "이 브라우저는 QR 코드 스캔을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요."
          );
        }

        // QR 스캔 더 자주 실행 (100ms)
        scanIntervalRef.current = window.setInterval(analyzeFrame, 100);
      }
    } catch (error: any) {
      console.error("❌ 카메라 오류:", error);
      setIsScanning(false);
      setScanDebugInfo(`❌ 카메라 오류: ${error.message}`);

      if (error.name === "NotAllowedError") {
        alert(
          "📷 카메라 권한을 허용해주세요!\n브라우저 설정에서 카메라 접근을 허용하고 페이지를 새로고침하세요."
        );
      } else if (error.name === "NotFoundError") {
        alert("📱 카메라를 찾을 수 없습니다.");
      } else {
        alert("❌ 카메라 접근 실패: " + error.message);
      }
    }
  };

  // QR 스캔 중지
  const stopQRScan = () => {
    console.log("🛑 QR 스캔 중지");

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setScanDebugInfo("");
  };

  // 카메라 전환
  const switchCamera = async () => {
    console.log("🔄 카메라 전환 클릭");
    const newCamera = currentCamera === "environment" ? "user" : "environment";
    setCurrentCamera(newCamera);
    setScanDebugInfo(
      `🔄 ${newCamera === "environment" ? "후면" : "전면"} 카메라로 전환 중...`
    );

    if (isScanning) {
      stopQRScan();
      setTimeout(() => startQRScan(), 500);
    }
  };

  // 갤러리에서 이미지 선택
  const selectImageFromGallery = () => {
    console.log("🖼️ 갤러리 버튼 클릭됨");
    setScanDebugInfo("🖼️ 갤러리에서 이미지 선택...");

    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("❌ fileInputRef가 없습니다");
      setScanDebugInfo("❌ 갤러리 기능 오류");
    }
  };

  // 갤러리 이미지 처리
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 파일 선택됨");
    const file = event.target.files?.[0];

    if (!file) {
      console.log("❌ 파일이 선택되지 않음");
      setScanDebugInfo("❌ 파일이 선택되지 않았습니다.");
      return;
    }

    console.log("📄 선택된 파일:", file.name, file.type);
    setScanDebugInfo(`📄 이미지 분석 중: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          console.log("🖼️ 갤러리 이미지 분석 시작");

          // 캔버스에 이미지 그리기
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              console.log(`📐 이미지 크기: ${img.width}x${img.height}`);

              // 이미지 데이터 추출
              const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );

              // QR 코드 분석
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height
              );

              if (code) {
                console.log(
                  "🎯 갤러리 이미지에서 QR 코드 발견 (jsQR):",
                  code.data
                );
                const lottoNumbers = extractLottoNumbers(code.data);

                if (lottoNumbers) {
                  setCheckNumbers(lottoNumbers);
                  setScanDebugInfo(
                    `✅ 이미지에서 로또 번호 인식 성공: ${lottoNumbers}`
                  );
                  alert(
                    `🎉 이미지에서 로또 번호를 찾았습니다!\n번호: ${lottoNumbers}`
                  );
                } else {
                  setScanDebugInfo(
                    `❌ QR 코드를 찾았지만 로또 번호가 아닙니다`
                  );
                  alert(
                    "❌ QR 코드를 찾았지만 로또 번호를 인식할 수 없습니다."
                  );
                }
              } else {
                setScanDebugInfo("❌ 이미지에서 QR 코드를 찾을 수 없습니다");
                alert("❌ 이미지에서 QR 코드를 찾을 수 없습니다.");
              }
            }
          }
        } catch (error) {
          console.error("이미지 QR 분석 오류:", error);
          setScanDebugInfo(`❌ 이미지 분석 오류: ${error.message}`);
          alert("❌ 이미지 분석 중 오류가 발생했습니다.");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // 파일 입력 초기화
    event.target.value = "";
  };

  // 수동 번호 입력 (테스트용)
  const addTestNumbers = () => {
    console.log("🧪 테스트 번호 추가");
    setCheckNumbers("7,12,23,34,38,45");
    setScanDebugInfo("🧪 테스트 번호 입력됨");
  };

  // 당첨 확인
  const checkWinning = () => {
    if (!checkNumbers.trim()) {
      setCheckResult({
        error: "번호를 입력해주세요.",
        grade: "",
        matches: 0,
        bonusMatch: false,
        winningNumbers: [],
        bonusNumber: 0,
        userNumbers: [],
        round: 0,
      });
      return;
    }

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
        round: 0,
      });
      return;
    }

    if (new Set(userNumbers).size !== 6) {
      setCheckResult({
        error: "중복된 번호가 있습니다. 서로 다른 6개의 번호를 입력해주세요.",
        grade: "",
        matches: 0,
        bonusMatch: false,
        winningNumbers: [],
        bonusNumber: 0,
        userNumbers: [],
        round: 0,
      });
      return;
    }

    const selectedWinning = pastWinningNumbers[selectedRound];
    const mainNumbers = selectedWinning.slice(0, 6);
    const bonusNumber = selectedWinning[6];

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
      round: rounds[selectedRound],
    });
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopQRScan();
    };
  }, []);

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

        {/* 회차 선택 */}
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
            회차 선택
          </label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(parseInt(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
              backgroundColor: "white",
            }}
          >
            {rounds.map((round, index) => (
              <option key={round} value={index}>
                {round}회차 {index === 0 ? "(최신)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 번호 입력 */}
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

        {/* 테스트 버튼들 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            onClick={addTestNumbers}
            style={{
              flex: 1,
              backgroundColor: "#10b981",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            🧪 테스트 번호
          </button>

          <button
            onClick={selectImageFromGallery}
            style={{
              flex: 1,
              backgroundColor: "#8b5cf6",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            🖼️ QR 갤러리
          </button>
        </div>

        {/* QR 스캔 버튼 */}
        <button
          onClick={isScanning ? stopQRScan : startQRScan}
          style={{
            width: "100%",
            backgroundColor: isScanning ? "#dc2626" : "#3b82f6",
            color: "white",
            padding: "12px 0",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.2s",
          }}
        >
          {isScanning ? (
            <>
              <span>🔴</span>
              <span>QR 스캔 중지</span>
            </>
          ) : (
            <>
              <span>📷</span>
              <span>
                QR 스캔 (고성능) (
                {currentCamera === "environment" ? "후면" : "전면"})
              </span>
            </>
          )}
        </button>

        {/* 디버깅 정보 */}
        {scanDebugInfo && (
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              padding: "8px 12px",
              marginBottom: "12px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#0369a1",
                margin: "0",
                fontFamily: "monospace",
              }}
            >
              {scanDebugInfo}
            </p>
          </div>
        )}

        {/* 전체화면 카메라 */}
        {isScanning && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                playsInline
                muted
              />

              {/* QR 스캔 영역 표시 */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "250px",
                  height: "250px",
                  border: "3px solid #00ff00",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.1)",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    padding: "5px 10px",
                    borderRadius: "10px",
                  }}
                >
                  📱 QR 코드를 화면에 맞춰주세요
                </div>
              </div>

              {/* 상단 컨트롤 */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={stopQRScan}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "2px solid white",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>

                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "white", margin: "0", fontSize: "16px" }}>
                    QR 코드 스캔 (jsQR)
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      margin: "0",
                      fontSize: "12px",
                    }}
                  >
                    로또 용지의 QR 코드를 스캔하세요 (개선된 알고리즘)
                  </p>
                </div>

                <button
                  onClick={switchCamera}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "2px solid white",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  🔄
                </button>
              </div>

              {/* 하단 정보 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "white", margin: "0", fontSize: "14px" }}>
                  현재 카메라:{" "}
                  {currentCamera === "environment" ? "후면" : "전면"}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    margin: "0",
                    fontSize: "12px",
                  }}
                >
                  개선된 jsQR 알고리즘으로 QR 코드 인식 중
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 히든 캔버스 */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* 히든 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />

        <button
          onClick={checkWinning}
          disabled={!checkNumbers.trim()}
          style={{
            width: "100%",
            backgroundColor: checkNumbers.trim() ? "#059669" : "#9ca3af",
            color: "white",
            padding: "10px 0",
            borderRadius: "6px",
            border: "none",
            fontWeight: "500",
            cursor: checkNumbers.trim() ? "pointer" : "not-allowed",
            fontSize: "14px",
          }}
        >
          당첨 확인하기
        </button>
      </div>

      {/* 선택된 회차 당첨번호 표시 */}
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
          {rounds[selectedRound]}회차 당첨번호
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
          {selectedRound === 0
            ? "2025년 06월 21일 추첨"
            : `${rounds[selectedRound]}회차 추첨`}
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
            {pastWinningNumbers[selectedRound].slice(0, 6).map((num, i) => (
              <LottoNumberBall key={i} number={num} size="md" />
            ))}

            <span
              style={{ fontSize: "16px", color: "#9ca3af", margin: "0 4px" }}
            >
              +
            </span>

            <LottoNumberBall
              number={pastWinningNumbers[selectedRound][6]}
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
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0",
                  }}
                >
                  {checkResult.round}회차 결과
                </p>
                {checkResult.grade.includes("당첨") && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#059669",
                      margin: "4px 0 0 0",
                    }}
                  >
                    축하합니다! 🎊
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 8px 0",
                    textAlign: "center",
                  }}
                >
                  {checkResult.round}회차 당첨번호
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
                  {checkResult.winningNumbers.map((num, i) => (
                    <LottoNumberBall
                      key={i}
                      number={num}
                      size="sm"
                      isMatched={checkResult.userNumbers.includes(num)}
                    />
                  ))}

                  <span
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      margin: "0 2px",
                    }}
                  >
                    +
                  </span>

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
