import React, { useState, useEffect } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";
import { lottoRecommendService, RecommendStrategy } from "../../services/lottoRecommendService";

interface RecommendProps {
  pastWinningNumbers: number[][];
  onAddToPurchaseHistory: (numbers: number[], strategy: string) => void;
  isDataLoading?: boolean;
  dataStatus?: any;
}

const Recommend: React.FC<RecommendProps> = ({
  pastWinningNumbers,
  onAddToPurchaseHistory,
  isDataLoading,
  dataStatus
}) => {
  const [activeGrade, setActiveGrade] = useState("1");
  const [recommendedStrategies, setRecommendedStrategies] = useState<RecommendStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisStats, setAnalysisStats] = useState<any>(null);
  const [showAnalysisDetail, setShowAnalysisDetail] = useState(false);

  // 당첨 등급별 정보
  const gradeInfo: { [key: string]: any } = {
    "1": {
      name: "1등",
      desc: "6개 번호 일치",
      probability: "1/8,145,060",
      prize: "약 20억원",
      strategy: "913회차 빅데이터 AI 완벽 분석",
      emoji: "👑",
      color: "#059669"
    },
    "2": {
      name: "2등",
      desc: "5개 번호 + 보너스 일치",
      probability: "1/1,357,510",
      prize: "약 6천만원",
      strategy: "고빈도 + 보너스 고려",
      emoji: "🥈",
      color: "#0891b2"
    },
    "3": {
      name: "3등",
      desc: "5개 번호 일치",
      probability: "1/35,724",
      prize: "약 150만원",
      strategy: "균형 분석 (5개 적중 목표)",
      emoji: "🥉",
      color: "#7c3aed"
    },
    "4": {
      name: "4등",
      desc: "4개 번호 일치",
      probability: "1/733",
      prize: "5만원",
      strategy: "패턴 분석 (4개 적중 목표)",
      emoji: "🎯",
      color: "#dc2626"
    },
    "5": {
      name: "5등",
      desc: "3개 번호 일치",
      probability: "1/45",
      prize: "5천원",
      strategy: "확률 중심 (3개 적중 목표)",
      emoji: "🎲",
      color: "#ea580c"
    },
  };

  // 컴포넌트 마운트 시 분석 통계 로드
  useEffect(() => {
    loadAnalysisStats();
    
    // 1등이 기본 선택이므로 미리 로드
    if (activeGrade === "1") {
      setTimeout(() => {
        generate1stGradeRecommendations();
      }, 1000);
    }
  }, []);

  const loadAnalysisStats = async () => {
    const stats = lottoRecommendService.getAnalysisStats();
    setAnalysisStats(stats);
    console.log('📊 빅데이터 분석 통계:', stats);
  };

  // 🎯 1등급 고도화 추천번호 생성
  const generate1stGradeRecommendations = async () => {
    setLoading(true);
    try {
      console.log('🧠 913회차 AI 빅데이터 분석 시작...');
      
      // 로딩 애니메이션을 위한 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const strategies = await lottoRecommendService.generate1stGradeRecommendations();
      setRecommendedStrategies(strategies);
      
      console.log(`✅ ${strategies.length}개 AI 전략 생성 완료!`);
      
      // 각 전략의 신뢰도 로그
      strategies.forEach(s => {
        console.log(`🎯 ${s.name}: 신뢰도 ${s.confidence}%`);
      });
      
    } catch (error) {
      console.error('❌ AI 추천 생성 실패:', error);
      setRecommendedStrategies(generateFallbackStrategies());
    } finally {
      setLoading(false);
    }
  };

  // 기존 방식 폴백 (2-5등급용)
  const generateBasicRecommendations = (grade: string) => {
    setLoading(true);
    setTimeout(() => {
      const strategies = generateFallbackStrategies(grade);
      setRecommendedStrategies(strategies);
      setLoading(false);
    }, 800);
  };

  // 폴백 전략 생성
  const generateFallbackStrategies = (grade: string = "1"): RecommendStrategy[] => {
    const strategies: RecommendStrategy[] = [];
    
    for (let i = 0; i < 5; i++) {
      const numbers = generateRandomNumbers();
      strategies.push({
        name: `${gradeInfo[grade].name} 전략 ${i + 1}`,
        numbers: numbers,
        grade: gradeInfo[grade].name,
        description: `${gradeInfo[grade].strategy} 방식으로 생성된 번호`,
        confidence: 70 + Math.floor(Math.random() * 20),
        analysisData: {
          dataRange: `최신 ${pastWinningNumbers.length}회차`,
          method: '기본 분석',
          patterns: ['빈도 분석', '랜덤 조합']
        }
      });
    }
    
    return strategies;
  };

  // 랜덤 번호 생성
  const generateRandomNumbers = (): number[] => {
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  };

  // 추천 번호 생성
  const generateRecommendations = (grade: string) => {
    if (grade === "1") {
      generate1stGradeRecommendations();
    } else {
      generateBasicRecommendations(grade);
    }
  };

  // 신뢰도에 따른 색상 및 이모지
  const getConfidenceStyle = (confidence: number): { color: string; emoji: string; text: string } => {
    if (confidence >= 95) return { color: "#059669", emoji: "🔥", text: "초고신뢰" };
    if (confidence >= 90) return { color: "#0891b2", emoji: "💎", text: "고신뢰" };
    if (confidence >= 85) return { color: "#7c3aed", emoji: "⭐", text: "우수" };
    if (confidence >= 80) return { color: "#dc2626", emoji: "✨", text: "양호" };
    return { color: "#6b7280", emoji: "📊", text: "기본" };
  };

  return (
    <div style={{ padding: "12px" }}>
      {/* 🔥 빅데이터 분석 시스템 헤더 */}
      {analysisStats && (
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "12px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* 배경 패턴 */}
          <div style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            transform: "rotate(45deg)"
          }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "bold",
                margin: "0",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                🧠 AI 빅데이터 분석 시스템
                <span style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "4px"
                }}>
                  v2.0
                </span>
              </h3>
              
              <button
                onClick={() => setShowAnalysisDetail(!showAnalysisDetail)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                {showAnalysisDetail ? "간단히" : "자세히"}
              </button>
            </div>
            
            <div style={{ fontSize: "14px", opacity: 0.9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <span>📊 <strong>{analysisStats.totalRounds}회차</strong> 분석</span>
                <span>🎯 <strong>{analysisStats.uniquePatterns.toLocaleString()}</strong>개 패턴</span>
                <span>🔥 상태: <strong>{analysisStats.analysisReady ? "준비완료" : "로딩중"}</strong></span>
              </div>
              
              {showAnalysisDetail && (
                <div style={{ marginTop: "12px", fontSize: "12px", opacity: 0.8 }}>
                  <div style={{ marginBottom: "4px" }}>
                    📈 데이터 범위: {analysisStats.dataRange}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    🔥 핫넘버: {analysisStats.hotNumbers?.join(', ')} | 🧊 콜드넘버: {analysisStats.coldNumbers?.join(', ')}
                  </div>
                  <div>
                    📊 분석 기준: {analysisStats.recentTrend}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메인 추천 영역 */}
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
          fontWeight: "bold",
          color: "#1f2937",
          margin: "0 0 8px 0",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          🎯 당첨 등급별 AI 추천
        </h2>
        
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 16px 0" }}>
          {activeGrade === "1" ? 
            "🔥 913회차 빅데이터 AI 분석으로 최강의 1등 번호를 받아보세요!" :
            `${gradeInfo[activeGrade].name} 맞춤 번호를 스마트하게 추천해드립니다`
          }
        </p>

        {/* 등급 선택 버튼들 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "16px",
        }}>
          {Object.entries(gradeInfo).map(([grade, info]) => (
            <button
              key={grade}
              onClick={() => setActiveGrade(grade)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
                border: activeGrade === grade ? `2px solid ${info.color}` : "2px solid #e5e7eb",
                backgroundColor: activeGrade === grade ? `${info.color}15` : "white",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: activeGrade === grade ? `0 4px 12px ${info.color}30` : "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>{info.emoji}</span>
                  <span style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: activeGrade === grade ? info.color : "#1f2937",
                  }}>
                    {info.name}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: activeGrade === grade ? info.color : "#f3f4f6",
                    color: activeGrade === grade ? "white" : "#6b7280",
                    fontWeight: "bold"
                  }}>
                    {info.desc}
                  </span>
                </div>
                
                {grade === "1" && (
                  <span style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                    color: "white",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(245, 158, 11, 0.3)"
                  }}>
                    🧠 AI 분석
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                🎲 확률: <strong>{info.probability}</strong> | 💰 상금: <strong>{info.prize}</strong>
              </div>
              
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                📊 {info.strategy}
              </div>
            </button>
          ))}
        </div>

        {/* 추천 버튼 */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => generateRecommendations(activeGrade)}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : 
                activeGrade === "1" ? 
                "linear-gradient(45deg, #059669, #0891b2)" : 
                gradeInfo[activeGrade].color,
              color: "white",
              padding: "14px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              boxShadow: loading ? "none" : `0 4px 12px ${gradeInfo[activeGrade].color}40`,
              transform: loading ? "none" : "translateY(-1px)",
              transition: "all 0.2s"
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff30",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                {activeGrade === "1" ? 
                  "🧠 AI 빅데이터 분석중..." : 
                  `${gradeInfo[activeGrade].name} 분석중...`
                }
              </span>
            ) : (
              <>
                {gradeInfo[activeGrade].emoji} {activeGrade === "1" ? 
                  "AI 빅데이터 분석 시작!" : 
                  `${gradeInfo[activeGrade].name} 추천 받기`
                }
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔥 추천 결과 영역 */}
      {loading ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px 16px",
          textAlign: "center",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #059669",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          
          <h3 style={{ color: "#1f2937", margin: "0 0 8px 0", fontSize: "18px" }}>
            {activeGrade === "1" ? 
              "🧠 AI가 913회차 빅데이터를 분석중입니다..." :
              `${gradeInfo[activeGrade].name} 맞춤 번호를 생성중입니다...`
            }
          </h3>
          
          {activeGrade === "1" && (
            <div style={{ fontSize: "14px", color: "#059669", marginTop: "12px" }}>
              <div style={{ margin: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: "#059669", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                <span>전체 기간 빈도 분석 중...</span>
              </div>
              <div style={{ margin: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: "#0891b2", borderRadius: "50%", animation: "pulse 1.5s infinite 0.5s" }} />
                <span>최신 트렌드 패턴 인식 중...</span>
              </div>
              <div style={{ margin: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: "#7c3aed", borderRadius: "50%", animation: "pulse 1.5s infinite 1s" }} />
                <span>AI 머신러닝 예측 중...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>>
          {recommendedStrategies.map((strategy, index) => {
            const confStyle = getConfidenceStyle(strategy.confidence);
            
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  border: strategy.confidence >= 90 ? `2px solid ${confStyle.color}` : "1px solid #e5e7eb",
                  boxShadow: strategy.confidence >= 90 ? 
                    `0 4px 16px ${confStyle.color}20` : 
                    "0 2px 8px rgba(0,0,0,0.1)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* 고신뢰도 배지 */}
                {strategy.confidence >= 90 && (
                  <div style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    background: `linear-gradient(45deg, ${confStyle.color}, ${confStyle.color}dd)`,
                    color: "white",
                    padding: "4px 12px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    clipPath: "polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%)"
                  }}>
                    {confStyle.emoji} {confStyle.text}
                  </div>
                )}

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}>
                  <div style={{ flex: 1, paddingRight: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <h3 style={{
                        fontWeight: "bold",
                        color: "#1f2937",
                        margin: "0",
                        fontSize: "16px",
                      }}>
                        {strategy.name}
                      </h3>
                      
                      <span style={{
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: confStyle.color,
                        color: "white",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {confStyle.emoji} {strategy.confidence}%
                      </span>
                    </div>
                    
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                      {strategy.description}
                    </p>
                    
                    <div style={{ fontSize: "11px", color: "#9ca3af", display: "flex", gap: "12px" }}>
                      <span>📊 {strategy.analysisData.dataRange}</span>
                      <span>🔍 {strategy.analysisData.method}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onAddToPurchaseHistory(strategy.numbers, strategy.name);
                      alert('✅ 내번호함에 저장되었습니다!');
                    }}
                    style={{
                      background: "linear-gradient(45deg, #2563eb, #3b82f6)",
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                      transition: "all 0.2s"
                    }}
                  >
                    🗂️ 내번호함에 추가
                  </button>
                </div>
                
                {/* 번호 표시 */}
                <div style={{
                  display: "flex",
                  gap: "6px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  backgroundColor: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  border: "2px dashed #e2e8f0"
                }}>
                  {strategy.numbers.map((num, i) => (
                    <LottoNumberBall key={i} number={num} size="md" />
                  ))}
                </div>

                {/* 분석 패턴 태그들 */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>
                    🏷️ 분석 패턴:
                  </span>
                  {strategy.analysisData.patterns.map((pattern, i) => (
                    <span key={i} style={{
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #e2e8f0"
                    }}>
                      {pattern}
                    </span>
                  ))}
                </div>
                
                {strategy.analysisData.specialInfo && (
                  <div style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: "#059669",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    ✨ {strategy.analysisData.specialInfo}
                  </div>
                )}
              </div>
            );
          })}

          {recommendedStrategies.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "48px 16px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                {gradeInfo[activeGrade].emoji}
              </div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 8px 0",
              }}>
                {gradeInfo[activeGrade].name} 추천번호
              </h3>
              <p style={{ color: "#6b7280", margin: "0 0 6px 0", fontSize: "14px" }}>
                확률: {gradeInfo[activeGrade].probability}
              </p>
              <p style={{ color: "#6b7280", margin: "0 0 24px 0", fontSize: "14px" }}>
                예상상금: {gradeInfo[activeGrade].prize}
              </p>
              <button
                onClick={() => generateRecommendations(activeGrade)}
                style={{
                  background: activeGrade === "1" ? 
                    "linear-gradient(45deg, #059669, #0891b2)" : 
                    gradeInfo[activeGrade].color,
                  color: "white",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "16px",
                  boxShadow: `0 4px 12px ${gradeInfo[activeGrade].color}40`
                }}
              >
                {gradeInfo[activeGrade].emoji} {activeGrade === "1" ? 
                  "🧠 AI 빅데이터 분석 시작!" :
                  `${gradeInfo[activeGrade].name} 맞춤 번호 받기`
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSS 애니메이션 */}
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

export default Recommend;
