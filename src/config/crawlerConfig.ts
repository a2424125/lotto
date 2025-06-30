// src/config/crawlerConfig.ts
// 크롤링 관련 설정 및 환경 변수

export interface CrawlerConfig {
  // 요청 설정
  requestDelay: number;          // 요청 간격 (밀리초)
  maxRetries: number;            // 최대 재시도 횟수
  timeout: number;               // 타임아웃 (밀리초)
  
  // 캐시 설정
  cacheExpiry: number;           // 캐시 만료 시간 (밀리초)
  maxCacheSize: number;          // 최대 캐시 크기
  
  // 업데이트 설정
  updateInterval: number;        // 자동 업데이트 간격 (밀리초)
  batchSize: number;             // 배치 처리 크기
  
  // 안전 설정
  respectRobotsTxt: boolean;     // robots.txt 준수 여부
  userAgent: string;             // User-Agent 문자열
  
  // API 엔드포인트
  endpoints: {
    drawResult: string;          // 당첨번호 조회
    drawList: string;            // 회차 목록
  };
}

// 개발 환경 설정
const developmentConfig: CrawlerConfig = {
  requestDelay: 3000,            // 3초 간격 (개발용)
  maxRetries: 2,
  timeout: 10000,
  cacheExpiry: 10 * 60 * 1000,   // 10분
  maxCacheSize: 50,
  updateInterval: 15 * 60 * 1000, // 15분
  batchSize: 2,
  respectRobotsTxt: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  endpoints: {
    drawResult: 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=',
    drawList: 'https://www.dhlottery.co.kr/gameResult.do?method=byWin'
  }
};

// 프로덕션 환경 설정
const productionConfig: CrawlerConfig = {
  requestDelay: 5000,            // 5초 간격 (안전)
  maxRetries: 3,
  timeout: 15000,
  cacheExpiry: 30 * 60 * 1000,   // 30분
  maxCacheSize: 100,
  updateInterval: 30 * 60 * 1000, // 30분
  batchSize: 3,
  respectRobotsTxt: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  endpoints: {
    drawResult: 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=',
    drawList: 'https://www.dhlottery.co.kr/gameResult.do?method=byWin'
  }
};

// 테스트 환경 설정
const testConfig: CrawlerConfig = {
  requestDelay: 1000,            // 1초 간격 (빠른 테스트)
  maxRetries: 1,
  timeout: 5000,
  cacheExpiry: 5 * 60 * 1000,    // 5분
  maxCacheSize: 10,
  updateInterval: 5 * 60 * 1000, // 5분
  batchSize: 1,
  respectRobotsTxt: false,       // 테스트에서는 무시
  userAgent: 'LottoApp-Test/1.0.0',
  endpoints: {
    drawResult: 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=',
    drawList: 'https://www.dhlottery.co.kr/gameResult.do?method=byWin'
  }
};

// 환경별 설정 선택
const getConfig = (): CrawlerConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

// 설정 검증
const validateConfig = (config: CrawlerConfig): void => {
  if (config.requestDelay < 1000) {
    console.warn('⚠️ 요청 간격이 1초 미만입니다. 서버 부하를 고려하세요.');
  }
  
  if (config.maxRetries > 5) {
    console.warn('⚠️ 재시도 횟수가 5회를 초과합니다. IP 차단 위험이 있습니다.');
  }
  
  if (config.batchSize > 5) {
    console.warn('⚠️ 배치 크기가 5를 초과합니다. 동시 요청으로 인한 차단 위험이 있습니다.');
  }
};

// 크롤링 에티켓 가이드
export const CRAWLING_ETHICS = {
  DO: [
    '적절한 요청 간격 유지 (최소 3초)',
    'robots.txt 파일 확인 및 준수',
    '정상적인 User-Agent 사용',
    '에러 시 재시도 간격 늘리기',
    '필요한 데이터만 수집',
    '캐싱으로 중복 요청 방지'
  ],
  DONT: [
    '1초 미만의 빠른 연속 요청',
    'robots.txt 정책 무시',
    '가짜 User-Agent 사용',
    '무한 재시도',
    '불필요한 데이터 수집',
    '동시 다중 요청',
    '서버 부하 시에도 계속 요청'
  ]
};

// 법적 고지사항
export const LEGAL_NOTICE = `
⚖️ 크롤링 관련 법적 고지사항

1. 이 코드는 교육 및 개인 사용 목적으로만 제공됩니다.
2. 상업적 이용 시 저작권자의 허가가 필요할 수 있습니다.
3. 과도한 요청으로 인한 서버 부하 발생 시 법적 책임이 있을 수 있습니다.
4. 사이트 이용약관을 반드시 확인하고 준수하세요.
5. IP 차단이나 법적 문제 발생 시 사용자 책임입니다.

📚 참고 자료:
- 저작권법 제35조의3 (저작물의 공정한 이용)
- 정보통신망법 제48조 (시설이용의 제한)
- 대법원 판례 2009다17417 (웹사이트 정보 수집 관련)
`;

export const config = getConfig();
validateConfig(config);

export default config;
