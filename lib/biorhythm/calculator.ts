/**
 * 바이오리듬 계산기
 * Biorhythm Calculator
 *
 * 생년월일 기반 23/28/33일 주기의 신체/감성/지성 리듬 계산
 * - 신체(Physical): 23일 주기 - 체력, 조정력, 지구력
 * - 감성(Emotional): 28일 주기 - 감정, 기분, 창의력
 * - 지성(Intellectual): 33일 주기 - 사고력, 기억력, 분석력
 */

// ============================================================================
// Types
// ============================================================================

export interface BiorhythmPoint {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 신체 리듬 (-100 ~ 100) */
  physical: number;
  /** 감성 리듬 (-100 ~ 100) */
  emotional: number;
  /** 지성 리듬 (-100 ~ 100) */
  intellectual: number;
}

export interface BiorhythmResult {
  /** 오늘의 바이오리듬 */
  today: BiorhythmPoint;
  /** 예측 데이터 (지정된 일수) */
  forecast: BiorhythmPoint[];
  /** 임계일 목록 (0에 가까운 날) */
  criticalDays: CriticalDay[];
  /** 최고/최저 예측 */
  bestDays: BestDayInfo;
}

export interface CriticalDay {
  /** 날짜 */
  date: string;
  /** 임계 유형 (physical, emotional, intellectual) */
  type: "physical" | "emotional" | "intellectual";
  /** 임계 값 */
  value: number;
}

export interface BestDayInfo {
  /** 신체 최고일 */
  physicalBest: { date: string; value: number };
  /** 감성 최고일 */
  emotionalBest: { date: string; value: number };
  /** 지성 최고일 */
  intellectualBest: { date: string; value: number };
  /** 종합 최고일 (평균 점수 기준) */
  overallBest: { date: string; average: number };
}

// ============================================================================
// Constants
// ============================================================================

/** 바이오리듬 주기 (일) */
const CYCLES = {
  physical: 23,
  emotional: 28,
  intellectual: 33,
} as const;

/** 임계일 판단 기준 (절대값이 이 값 이하면 임계일) */
const CRITICAL_THRESHOLD = 10;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * 두 날짜 사이의 일수 계산
 */
function daysBetween(birthDate: Date, targetDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  // UTC 기준으로 계산하여 시간대 문제 방지
  const birth = Date.UTC(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const target = Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  return Math.floor((target - birth) / oneDay);
}

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 특정 날짜의 바이오리듬 계산
 *
 * @param birthDate - 생년월일
 * @param targetDate - 조회할 날짜
 * @returns 바이오리듬 포인트
 */
export function calculateBiorhythm(
  birthDate: Date,
  targetDate: Date
): BiorhythmPoint {
  const days = daysBetween(birthDate, targetDate);

  return {
    date: formatDate(targetDate),
    physical: Math.round(
      Math.sin((2 * Math.PI * days) / CYCLES.physical) * 100
    ),
    emotional: Math.round(
      Math.sin((2 * Math.PI * days) / CYCLES.emotional) * 100
    ),
    intellectual: Math.round(
      Math.sin((2 * Math.PI * days) / CYCLES.intellectual) * 100
    ),
  };
}

/**
 * 바이오리듬 예측 데이터 생성
 *
 * @param birthDate - 생년월일
 * @param days - 예측 일수 (기본: 30일)
 * @param startDate - 시작 날짜 (기본: 오늘)
 * @returns 바이오리듬 결과
 */
export function getBiorhythmForecast(
  birthDate: Date,
  days: number = 30,
  startDate: Date = new Date()
): BiorhythmResult {
  const forecast: BiorhythmPoint[] = [];
  const criticalDays: CriticalDay[] = [];

  // 최고/최저 추적용
  let physicalBest = { date: "", value: -101 };
  let emotionalBest = { date: "", value: -101 };
  let intellectualBest = { date: "", value: -101 };
  let overallBest = { date: "", average: -101 };

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const point = calculateBiorhythm(birthDate, date);
    forecast.push(point);

    // 임계일 감지 (0에 가까운 날)
    if (Math.abs(point.physical) <= CRITICAL_THRESHOLD) {
      criticalDays.push({ date: point.date, type: "physical", value: point.physical });
    }
    if (Math.abs(point.emotional) <= CRITICAL_THRESHOLD) {
      criticalDays.push({ date: point.date, type: "emotional", value: point.emotional });
    }
    if (Math.abs(point.intellectual) <= CRITICAL_THRESHOLD) {
      criticalDays.push({ date: point.date, type: "intellectual", value: point.intellectual });
    }

    // 최고일 추적
    if (point.physical > physicalBest.value) {
      physicalBest = { date: point.date, value: point.physical };
    }
    if (point.emotional > emotionalBest.value) {
      emotionalBest = { date: point.date, value: point.emotional };
    }
    if (point.intellectual > intellectualBest.value) {
      intellectualBest = { date: point.date, value: point.intellectual };
    }

    // 종합 최고일 (평균 기준)
    const average = Math.round(
      (point.physical + point.emotional + point.intellectual) / 3
    );
    if (average > overallBest.average) {
      overallBest = { date: point.date, average };
    }
  }

  return {
    today: forecast[0],
    forecast,
    criticalDays,
    bestDays: {
      physicalBest,
      emotionalBest,
      intellectualBest,
      overallBest,
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 바이오리듬 값에 따른 상태 텍스트 반환
 */
export function getStatusText(value: number): string {
  if (value > 70) return "최상";
  if (value > 30) return "양호";
  if (value > -30) return "보통";
  if (value > -70) return "주의";
  return "저조";
}

/**
 * 바이오리듬 값에 따른 상태 색상 클래스 반환
 */
export function getStatusColor(value: number): string {
  if (value > 70) return "text-green-500";
  if (value > 30) return "text-blue-500";
  if (value > -30) return "text-yellow-500";
  if (value > -70) return "text-orange-500";
  return "text-red-500";
}

/**
 * 바이오리듬 값에 따른 배경색 클래스 반환
 */
export function getStatusBgColor(value: number): string {
  if (value > 70) return "bg-green-500/10";
  if (value > 30) return "bg-blue-500/10";
  if (value > -30) return "bg-yellow-500/10";
  if (value > -70) return "bg-orange-500/10";
  return "bg-red-500/10";
}

/**
 * 바이오리듬 유형에 따른 한글명 반환
 */
export function getRhythmLabel(
  type: "physical" | "emotional" | "intellectual"
): string {
  const labels = {
    physical: "신체",
    emotional: "감성",
    intellectual: "지성",
  };
  return labels[type];
}

/**
 * 바이오리듬 유형에 따른 설명 반환
 */
export function getRhythmDescription(
  type: "physical" | "emotional" | "intellectual"
): string {
  const descriptions = {
    physical: "체력, 지구력, 조정력",
    emotional: "기분, 감정, 창의력",
    intellectual: "사고력, 기억력, 분석력",
  };
  return descriptions[type];
}

/**
 * 주기 정보 조회
 */
export function getCycleInfo(): typeof CYCLES {
  return CYCLES;
}
