import React, { useState, useEffect } from "react";
import LottoNumberBall from "../shared/LottoNumberBall";

interface StatsProps {
  pastWinningNumbers: number[][];
  isDataLoading?: boolean;
  dataStatus?: any;
}

interface NumberStats {
  number: number;
  frequency: number;
  percentage: number;
  lastAppeared: string;
  gap: number;
  trend: 'hot' | 'cold' | 'normal';
}

interface ZoneStats {
  zone: string;
  range: string;
  frequency: number;
  percentage: number;
  numbers: number[];
}

interface PatternStats {
  oddEvenRatio: { odd: number; even: number };
  consecutiveNumbers: number;
  sumRange: { min: number; max: number; avg: number };
  numberGaps: { min: number; max: number; avg: number };
}

interface PrizeStats {
  totalRounds: number;
  totalPrize: number;
  avgPrize: number;
  maxPrize: number;
  minPrize: number;
  totalWinners: number;
}

const Stats: React.FC<StatsProps> = ({ 
  pastWinningNumbers, 
  isDataLoading = false,
  dataStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'frequency' | 'zones' | 'patterns' | 'trends' | 'prizes'>('frequency');
  const [analysisRange, setAnalysisRange] = useState<'all' | '100' | '50' | '20'>('all');
  const [numberStats, setNumberStats] = useState<NumberStats[]>([]);
  const [zoneStats, setZoneStats] = useState<ZoneStats[]>([]);
  const [patternStats, setPatternStats] = useState<PatternStats | null>(null);
  const [prizeStats, setPrizeStats] = useState<PrizeStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 탭 정보
  const tabs = [
    { id: 'frequency', name: '🔢 번호 빈도', desc: '각 번호별 출현 빈도' },
    { id: 'zones', name: '📊 구간 분석', desc: '번호 구간별 분포' },
    { id: 'patterns', name: '🧩 패턴 분석', desc: '홀짝, 연속번호 등' },
    { id: 'trends', name: '📈 트렌드', desc: '시기별 변화 추이' },
    { id: 'prizes', name: '💰 당첨금', desc: '당첨금 통계' }
  ];

  // 분석 범위 옵션
  const rangeOptions = [
    { value: 'all', label: '전체', desc: `${pastWinningNumbers.length}회차` },
    { value: '100', label: '최근 100회', desc: '중기 트렌드' },
    { value: '50', label: '최근 50회', desc: '단기 트렌드' },
    { value: '20', label: '최근 20회', desc: '초단기 트렌드' }
  ];

  useEffect(() => {
    if (pastWinningNumbers.length > 0) {
      performAnalysis();
    }
  }, [pastWinningNumbers, analysisRange]);

  // 📊 통계 분석 실행
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // 분석 범위 결정
      const rangeMap = { all: pastWinningNumbers.length, '100': 100, '50': 50, '20': 20 };
      const dataRange = Math.min(rangeMap[analysisRange], pastWinningNumbers.length);
      const targetData = pastWinningNumbers.slice(0, dataRange);

      console.log(`📈 ${dataRange}회차 데이터 분석 시작...`);

      // 분석을 위한 약간의 지연 (UX)
      await new Promise(resolve => setTimeout(resolve, 800));

      // 1. 번호별 빈도 분석
      const numberFreq = analyzeNumberFrequency(targetData);
      setNumberStats(numberFreq);

      // 2. 구간별 분석
      const zones = analyzeZones(targetData);
      setZoneStats(zones);

      // 3. 패턴 분석
      const patterns = analyzePatterns(targetData);
      setPatternStats(patterns);

      // 4. 당첨금 분석 (임시 데이터)
      const prizes = analyzePrizes(targetData);
      setPrizeStats(prizes);

      console.log('✅ 통계 분석 완료!');
    } catch (error) {
      console.error('❌ 통계 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 📈 번호별 빈도 분석
  const analyzeNumberFrequency = (data: number[][]): NumberStats[] => {
    const frequency: { [key: number]: number } = {};
    const lastAppeared: { [key: number]: number } = {};

    // 빈도 계산 및 마지막 출현 기록
    data.forEach((draw, drawIndex) => {
      const numbers = draw.slice(0, 6); // 보너스 제외
      numbers.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        if (!lastAppeared[num]) {
          lastAppeared[num] = drawIndex; // 첫 발견이 마지막 출현
        }
      });
    });

    const totalDraws = data.length;
    const results: NumberStats[] = [];

    for (let num = 1; num <= 45; num++) {
      const freq = frequency[num] || 0;
      const percentage = (freq / totalDraws) * 100;
      const gap = lastAppeared[num] !== undefined ? lastAppeared[num] : totalDraws;
      
      // 트렌드 분석 (최근 20회차 기준)
      let trend: 'hot' | 'cold' | 'normal' = 'normal';
      const recentFreq = data.slice(0, Math.min(20, data.length))
        .reduce((count, draw) => count + (draw.slice(0, 6).includes(num) ? 1 : 0), 0);
      
      if (recentFreq >= 4) trend = 'hot';
      else if (recentFreq === 0) trend = 'cold';

      results.push({
        number: num,
        frequency: freq,
        percentage: Math.round(percentage * 100) / 100,
        lastAppeared: gap === totalDraws ? '없음' : `${gap + 1}회차 전`,
        gap: gap,
        trend: trend
      });
    }

    return results.sort((a, b) => b.frequency - a.frequency);
  };

  // 📊 구간별 분석
  const analyzeZones = (data: number[][]): ZoneStats[] => {
    const zones = [
      { zone: '1구간', range: '1-9', start: 1, end: 9, color: '#eab308' },
      { zone: '2구간', range: '10-19', start: 10, end: 19, color: '#3b82f6' },
      { zone: '3구간', range: '20-29', start: 20, end: 29, color: '#ef4444' },
      { zone: '4구간', range: '30-39', start: 30, end: 39, color: '#6b7280' },
      { zone: '5구간', range: '40-45', start: 40, end: 45, color: '#10b981' }
    ];

    return zones.map(zone => {
      let frequency = 0;
      const numbers: number[] = [];

      data.forEach(draw => {
        const zoneNumbers = draw.slice(0, 6).filter(num => num >= zone.start && num <= zone.end);
        frequency += zoneNumbers.length;
        zoneNumbers.forEach(num => {
          if (!numbers.includes(num)) numbers.push(num);
        });
      });

      const totalPossible = data.length * 6;
      const percentage = (frequency / totalPossible) * 100;

      return {
        zone: zone.zone,
        range: zone.range,
        frequency,
        percentage: Math.round(percentage * 100) / 100,
        numbers: numbers.sort((a, b) => a - b)
      };
    });
  };

  // 🧩 패턴 분석
  const analyzePatterns = (data: number[][]): PatternStats => {
    let totalOdd = 0, totalEven = 0;
    let totalConsecutive = 0;
    const sums: number[] = [];
    const gaps: number[] = [];

    data.forEach(draw => {
      const numbers = draw.slice(0, 6).sort((a, b) => a - b);
      
      // 홀짝 분석
      numbers.forEach(num => {
        if (num % 2 === 0) totalEven++;
        else totalOdd++;
      });

      // 연속번호 분석
      let consecutive = 0;
      for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i + 1] - numbers[i] === 1) {
          consecutive++;
        }
      }
      totalConsecutive += consecutive;

      // 합계 분석
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      sums.push(sum);

      // 간격 분석
      for (let i = 0; i < numbers.length - 1; i++) {
        gaps.push(numbers[i + 1] - numbers[i]);
      }
    });

    const avgSum = sums.reduce((acc, sum) => acc + sum, 0) / sums.length;
    const avgGap = gaps.reduce((acc, gap) => acc + gap, 0) / gaps.length;

    return {
      oddEvenRatio: {
        odd: Math.round((totalOdd / (totalOdd + totalEven)) * 100),
        even: Math.round((totalEven / (totalOdd + totalEven)) * 100)
      },
      consecutiveNumbers: Math.round((totalConsecutive / data.length) * 100) / 100,
      sumRange: {
        min: Math.min(...sums),
        max: Math.max(...sums),
        avg: Math.round(avgSum * 100) / 100
      },
      numberGaps: {
        min: Math.min(...gaps),
        max: Math.max(...gaps),
        avg: Math.round(avgGap * 100) / 100
      }
    };
  };

  // 💰 당첨금 분석 (임시 구현)
  const analyzePrizes = (data: number[][]): PrizeStats => {
    // 실제로는 CSV의 당첨금 데이터를 사용해야 함
    const prizes = data.map((_, index) => {
      // 임시 데이터 (실제 구현시 CSV의 당첨금 컬럼 사용)
      return Math.floor(Math.random() * 3000000000) + 500000000;
    });

    const totalPrize = prizes.reduce((acc, prize) => acc + prize, 0);
    
    return {
      totalRounds: data.length,
      totalPrize,
      avgPrize: Math.round(totalPrize / prizes.length),
      maxPrize: Math.max(...prizes),
      minPrize: Math.min(...prizes),
      totalWinners: data.length * 8 // 임시 값
    };
  };

  // 트렌드 색상 결정
  const getTrendColor = (trend: 'hot' | 'cold' | 'normal'): string => {
    switch (trend) {
      case 'hot': return '#ef4444';
      case 'cold': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // 트렌드 이모지
  const getTrendEmoji = (trend: 'hot' | 'cold' | 'normal'): string => {
    switch (trend) {
      case 'hot': return '🔥';
      case 'cold': return '🧊';
      default: return '📊';
    }
  };

  // 렌더링
  return (
    <div style={{ padding: "12px" }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px"
        }}>
          <div>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 4px 0",
            }}>
              📊 통계분석 대시보드
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
              913회차 빅데이터 심층 분석
            </p>
          </div>
          
          {/* 새로고침 버튼 */}
          <button
            onClick={performAnalysis}
            disabled={isAnalyzing || isDataLoading}
            style={{
              background: isAnalyzing 
                ? "linear-gradient(45deg, #6b7280, #9ca3af)" 
                : "linear-gradient(45deg, #059669, #0891b2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12px",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              opacity: isAnalyzing ? 0.8 : 1,
              transition: "all 0.3s ease"
            }}
          >
            {isAnalyzing ? "⏳ 분석중..." : "🔄 새로고침"}
          </button>
        </div>

        {/* 분석 범위 선택 */}
        <div style={{
          display: "flex",
          gap: "6px",
          padding: "8px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0"
        }}>
          <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", alignSelf: "center" }}>
            📈 분석범위:
          </span>
          {rangeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setAnalysisRange(option.value as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: analysisRange === option.value ? "#2563eb" : "white",
                color: analysisRange === option.value ? "white" : "#374151",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: analysisRange === option.value ? "600" : "400",
                transition: "all 0.2s"
              }}
            >
              {option.label}
              <div style={{ fontSize: "9px", opacity: 0.8 }}>{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "12px",
        overflow: "hidden"
      }}>
        <div style={{
          display: "flex",
          overflowX: "auto",
          borderBottom: "1px solid #e5e7eb"
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: "1",
                padding: "12px 8px",
                border: "none",
                backgroundColor: activeTab === tab.id ? "#eff6ff" : "white",
                color: activeTab === tab.id ? "#2563eb" : "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
                transition: "all 0.2s",
                textAlign: "center",
                minWidth: "80px"
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                {tab.name}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.8 }}>
                {tab.desc}
              </div>
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        <div style={{ padding: "16px" }}>
          {isAnalyzing ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #2563eb",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px"
              }} />
              <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
                🧠 {analysisRange === 'all' ? '전체' : `최근 ${analysisRange}회차`} 데이터를 분석하고 있습니다...
              </p>
            </div>
          ) : (
            <>
              {/* 번호 빈도 분석 */}
              {activeTab === 'frequency' && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>
                    🔢 번호별 출현 빈도 ({analysisRange === 'all' ? '전체' : `최근 ${analysisRange}회차`})
                  </h3>
                  
                  {/* 상위 10개 번호 */}
                  <div style={{
                    backgroundColor: "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
                      🏆 TOP 10 고빈도 번호
                    </h4>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                      {numberStats.slice(0, 10).map((stat, index) => (
                        <div key={stat.number} style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <div style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <LottoNumberBall number={stat.number} size="sm" />
                            {index < 3 && (
                              <div style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: index === 0 ? "#fbbf24" : index === 1 ? "#9ca3af" : "#cd7f32",
                                color: "white",
                                fontSize: "8px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#1f2937" }}>
                              {stat.frequency}회
                            </div>
                            <div style={{ fontSize: "8px", color: "#6b7280" }}>
                              {stat.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 트렌드별 분류 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {['hot', 'normal', 'cold'].map(trendType => {
                      const trendNumbers = numberStats.filter(stat => stat.trend === trendType);
                      if (trendNumbers.length === 0) return null;

                      return (
                        <div key={trendType} style={{
                          padding: "12px",
                          backgroundColor: trendType === 'hot' ? "#fef2f2" : 
                                         trendType === 'cold' ? "#eff6ff" : "#f9fafb",
                          borderRadius: "8px",
                          border: `1px solid ${trendType === 'hot' ? "#fecaca" : 
                                              trendType === 'cold' ? "#bfdbfe" : "#e5e7eb"}`
                        }}>
                          <h4 style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: trendType === 'hot' ? "#dc2626" : 
                                   trendType === 'cold' ? "#2563eb" : "#374151",
                            margin: "0 0 8px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            {getTrendEmoji(trendType as any)} 
                            {trendType === 'hot' ? '핫넘버' : 
                             trendType === 'cold' ? '콜드넘버' : '일반'}
                            <span style={{ fontSize: "12px", opacity: 0.8 }}>
                              ({trendNumbers.length}개)
                            </span>
                          </h4>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {trendNumbers.slice(0, 15).map(stat => (
                              <div key={stat.number} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                border: "1px solid #e5e7eb",
                                fontSize: "11px"
                              }}>
                                <LottoNumberBall number={stat.number} size="sm" />
                                <div>
                                  <div style={{ fontWeight: "bold" }}>{stat.frequency}회</div>
                                  <div style={{ color: "#6b7280", fontSize: "9px" }}>
                                    {stat.lastAppeared}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 구간 분석 */}
              {activeTab === 'zones' && zoneStats.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>
                    📊 구간별 분포 분석
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {zoneStats.map((zone, index) => (
                      <div key={zone.zone} style={{
                        padding: "16px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px"
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "#1f2937",
                              margin: "0 0 4px 0"
                            }}>
                              {zone.zone} ({zone.range})
                            </h4>
                            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
                              출현 빈도: {zone.frequency}회 ({zone.percentage}%)
                            </p>
                          </div>
                          <div style={{
                            padding: "8px 12px",
                            backgroundColor: "#eff6ff",
                            borderRadius: "6px",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>
                              {zone.percentage}%
                            </div>
                            <div style={{ fontSize: "10px", color: "#6b7280" }}>
                              비율
                            </div>
                          </div>
                        </div>
                        
                        {/* 진행률 바 */}
                        <div style={{
                          width: "100%",
                          height: "8px",
                          backgroundColor: "#f3f4f6",
                          borderRadius: "4px",
                          marginBottom: "12px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${zone.percentage}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, #2563eb, #3b82f6)`,
                            borderRadius: "4px",
                            transition: "width 1s ease-in-out"
                          }} />
                        </div>

                        {/* 해당 구간 번호들 */}
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {zone.numbers.map(num => (
                            <LottoNumberBall key={num} number={num} size="sm" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 패턴 분석 */}
              {activeTab === 'patterns' && patternStats && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>
                    🧩 패턴 분석 결과
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* 홀짝 비율 */}
                    <div style={{
                      padding: "16px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937", margin: "0 0 12px 0" }}>
                        ⚖️ 홀수 vs 짝수 비율
                      </h4>
                      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>홀수</span>
                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#ef4444" }}>
                              {patternStats.oddEvenRatio.odd}%
                            </span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${patternStats.oddEvenRatio.odd}%`,
                              height: "100%",
                              backgroundColor: "#ef4444",
                              borderRadius: "4px"
                            }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>짝수</span>
                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#3b82f6" }}>
                              {patternStats.oddEvenRatio.even}%
                            </span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${patternStats.oddEvenRatio.even}%`,
                              height: "100%",
                              backgroundColor: "#3b82f6",
                              borderRadius: "4px"
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 연속번호 */}
                    <div style={{
                      padding: "16px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>
                        🔗 연속번호 출현율
                      </h4>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        backgroundColor: "#f0fdf4",
                        borderRadius: "8px",
                        border: "1px solid #bbf7d0"
                      }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#059669" }}>
                            {patternStats.consecutiveNumbers}
                          </div>
                          <div style={{ fontSize: "12px", color: "#16a34a" }}>
                            회차당 평균 연속번호
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 합계 범위 */}
                    <div style={{
                      padding: "16px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937", margin: "0 0 12px 0" }}>
                        ➕ 당첨번호 합계 분석
                      </h4>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ flex: 1, textAlign: "center", padding: "12px", backgroundColor: "#fef3c7", borderRadius: "6px" }}>
                          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#92400e" }}>
                            {patternStats.sumRange.min}
                          </div>
                          <div style={{ fontSize: "10px", color: "#a16207" }}>최소</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center", padding: "12px", backgroundColor: "#dcfce7", borderRadius: "6px" }}>
                          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#166534" }}>
                            {patternStats.sumRange.avg}
                          </div>
                          <div style={{ fontSize: "10px", color: "#16a34a" }}>평균</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center", padding: "12px", backgroundColor: "#fce7f3", borderRadius: "6px" }}>
                          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#be185d" }}>
                            {patternStats.sumRange.max}
                          </div>
                          <div style={{ fontSize: "10px", color: "#db2777" }}>최대</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 트렌드 분석 */}
              {activeTab === 'trends' && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "16px" }}>📈</div>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>
                    트렌드 분석
                  </h3>
                  <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
                    시기별 변화 추이 분석 기능을 준비 중입니다
                  </p>
                </div>
              )}

              {/* 당첨금 분석 */}
              {activeTab === 'prizes' && prizeStats && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>
                    💰 당첨금 통계 분석
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669" }}>
                        {(prizeStats.avgPrize / 100000000).toFixed(1)}억
                      </div>
                      <div style={{ fontSize: "12px", color: "#16a34a" }}>평균 당첨금</div>
                    </div>
                    
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      border: "1px solid #fcd34d",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#92400e" }}>
                        {(prizeStats.maxPrize / 100000000).toFixed(1)}억
                      </div>
                      <div style={{ fontSize: "12px", color: "#a16207" }}>최고 당첨금</div>
                    </div>
                  </div>

                  <div style={{
                    padding: "16px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0", textAlign: "center" }}>
                      ⚠️ 당첨금 데이터는 임시값입니다. 실제 구현시 CSV의 당첨금 컬럼을 활용하세요.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CSS 애니메이션 */}
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

export default Stats;
