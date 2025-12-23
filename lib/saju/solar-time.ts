/**
 * 진태양시 (True Solar Time) 보정
 * AI 운세 마스터 - Solar Time Correction
 *
 * 한국 표준시는 동경 135도 기준이지만,
 * 실제 위치에 따라 태양 시간이 다릅니다.
 *
 * 진태양시 = 평균태양시 ± 경도보정 ± 균시차
 *
 * 1. 경도 보정: (표준경도 - 실제경도) × 4분/도
 *    서울(127도): (135 - 127) × 4 = 32분 빼야 함
 *
 * 2. 균시차 (Equation of Time):
 *    지구 공전궤도의 타원형과 자전축 기울기로 인한 시차
 *    - 11월 3일경: 최대 +16.5분
 *    - 2월 11일경: 최대 -14.5분
 */

import {
  KOREA_STANDARD_MERIDIAN,
  DEFAULT_LONGITUDE,
  CITY_LONGITUDES,
} from "./constants";

export interface SolarTimeResult {
  /** 원본 날짜/시간 */
  original: Date;
  /** 보정된 날짜/시간 */
  adjusted: Date;
  /** 적용된 경도 */
  longitude: number;
  /** 경도 보정 시간 (분) */
  longitudeOffset: number;
  /** 균시차 보정 시간 (분) */
  equationOfTime: number;
  /** 총 보정 시간 (분) */
  offsetMinutes: number;
  /** 표준시 기준 경도 */
  standardMeridian: number;
}

/**
 * 균시차 (Equation of Time) 계산
 *
 * 지구 공전궤도의 이심률과 자전축 기울기로 인해
 * 평균태양시와 진태양시 사이에 차이가 발생합니다.
 *
 * @param date - 날짜
 * @returns 균시차 (분 단위, 양수면 진태양이 빠름)
 *
 * @example
 * ```ts
 * // 11월 3일경: 약 +16.5분
 * calculateEquationOfTime(new Date(2024, 10, 3)); // ~16.5
 *
 * // 2월 11일경: 약 -14.5분
 * calculateEquationOfTime(new Date(2024, 1, 11)); // ~-14.5
 * ```
 */
export function calculateEquationOfTime(date: Date): number {
  // 연중 일수 계산 (1월 1일 = 1)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  // 균시차 공식 (Spencer 공식 기반 근사식)
  // B = 360/365 × (N - 81) degrees
  // EoT = 9.87 × sin(2B) - 7.53 × cos(B) - 1.5 × sin(B)
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180); // 라디안 변환

  const equationOfTime =
    9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  return Math.round(equationOfTime * 10) / 10; // 소수점 1자리
}

/**
 * 진태양시 보정
 *
 * @param date - 원본 날짜/시간 (표준시 기준)
 * @param longitude - 출생지 경도 (기본값: 서울 127.0도)
 * @param standardMeridian - 표준시 기준 경도 (기본값: 동경 135도)
 * @returns 보정된 시간 정보
 *
 * @example
 * ```ts
 * // 서울에서 1990년 1월 15일 오후 1시
 * const result = adjustToTrueSolarTime(
 *   new Date(1990, 0, 15, 13, 0, 0),
 *   127.0  // 서울
 * );
 * // result.adjusted = 1990-01-15 12:28 (약 32분 뺌)
 * ```
 */
export function adjustToTrueSolarTime(
  date: Date,
  longitude: number = DEFAULT_LONGITUDE,
  standardMeridian: number = KOREA_STANDARD_MERIDIAN
): SolarTimeResult {
  // 1도당 4분의 시차
  const MINUTES_PER_DEGREE = 4;

  // 1. 경도 보정: (표준경도 - 실제경도) × 4분/도
  const longitudeOffset = (standardMeridian - longitude) * MINUTES_PER_DEGREE;

  // 2. 균시차 계산 (지구 공전궤도 이심률 + 자전축 기울기)
  const equationOfTime = calculateEquationOfTime(date);

  // 3. 총 보정 시간 = 경도 보정 - 균시차
  // 진태양시 = 평균태양시 - 경도보정 + 균시차
  // 따라서 표준시에서 진태양시로 변환: 표준시 - 경도보정 + 균시차
  const totalOffset = longitudeOffset - equationOfTime;

  // 보정된 시간 계산
  const adjusted = new Date(date);
  adjusted.setMinutes(adjusted.getMinutes() - Math.round(totalOffset));

  return {
    original: date,
    adjusted,
    longitude,
    longitudeOffset: Math.round(longitudeOffset * 10) / 10,
    equationOfTime,
    offsetMinutes: Math.round(totalOffset),
    standardMeridian,
  };
}

/**
 * 도시 이름으로 경도 가져오기
 *
 * @param cityName - 도시 이름 (한국어)
 * @returns 경도 (없으면 서울 기본값)
 */
export function getLongitudeByCity(cityName: string): number {
  return CITY_LONGITUDES[cityName] ?? DEFAULT_LONGITUDE;
}

/**
 * 보정 시간 설명 문자열 생성
 *
 * @param result - 진태양시 보정 결과
 * @returns 설명 문자열
 */
export function formatSolarTimeDescription(result: SolarTimeResult): string {
  const sign = result.offsetMinutes >= 0 ? "-" : "+";
  const absOffset = Math.abs(result.offsetMinutes);

  const originalTime = result.original.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const adjustedTime = result.adjusted.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${originalTime} → ${adjustedTime} (${sign}${absOffset}분, 경도 ${result.longitude}°)`;
}

/**
 * 날짜 객체에서 시간 정보 추출
 *
 * @param date - 날짜 객체
 * @returns 년, 월, 일, 시, 분 객체
 */
export function extractDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 0-indexed → 1-indexed
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/**
 * 날짜 부분들로 Date 객체 생성
 *
 * @param year - 년도
 * @param month - 월 (1-12)
 * @param day - 일
 * @param hour - 시 (0-23)
 * @param minute - 분 (0-59)
 * @returns Date 객체
 */
export function createDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Date {
  return new Date(year, month - 1, day, hour, minute, 0);
}
