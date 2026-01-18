/**
 * 로컬 히스토리 관리 유틸리티
 * 비로그인 사용자의 분석 결과를 localStorage에 저장/조회
 */

export type HistoryItemType = 'saju' | 'compatibility' | 'couple' | 'face-reading';

export interface LocalHistoryItem {
  id: string;
  type: HistoryItemType;
  createdAt: string;
  data: any;
}

export interface LocalSajuHistory extends LocalHistoryItem {
  type: 'saju';
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  resultData: any;
  interpretation?: any;
}

export interface LocalCompatibilityHistory extends LocalHistoryItem {
  type: 'compatibility';
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  relationType: string;
  resultData: any;
  interpretation?: any;
}

export interface LocalCoupleHistory extends LocalHistoryItem {
  type: 'couple';
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  relationType: string;
  resultData: any;
  interpretation?: any;
}

export interface LocalFaceReadingHistory extends LocalHistoryItem {
  type: 'face-reading';
  gender: string;
  label?: string;
  imageData?: string; // base64 (optional, may be too large)
  resultData: any;
}

const STORAGE_KEY = 'cheonggiun_history';
const MAX_ITEMS = 20; // 최대 저장 개수

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 로컬 히스토리 가져오기
 */
export function getLocalHistory(): LocalHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * 로컬 히스토리에 항목 추가
 */
function addToLocalHistory(item: LocalHistoryItem): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getLocalHistory();

    // 중복 체크 (같은 데이터가 이미 있는지)
    const isDuplicate = history.some(h => {
      if (h.type !== item.type) return false;

      // 타입별 중복 체크 로직
      if (item.type === 'saju') {
        const existing = h as LocalSajuHistory;
        const newItem = item as LocalSajuHistory;
        return existing.birthData.year === newItem.birthData.year &&
               existing.birthData.month === newItem.birthData.month &&
               existing.birthData.day === newItem.birthData.day &&
               existing.birthData.hour === newItem.birthData.hour &&
               existing.birthData.gender === newItem.birthData.gender;
      }

      if (item.type === 'compatibility' || item.type === 'couple') {
        const existing = h as LocalCompatibilityHistory;
        const newItem = item as LocalCompatibilityHistory;
        return existing.person1.year === newItem.person1.year &&
               existing.person1.month === newItem.person1.month &&
               existing.person1.day === newItem.person1.day &&
               existing.person2.year === newItem.person2.year &&
               existing.person2.month === newItem.person2.month &&
               existing.person2.day === newItem.person2.day &&
               existing.relationType === newItem.relationType;
      }

      return false;
    });

    if (isDuplicate) {
      // 중복이면 기존 항목 업데이트 (최신 데이터로)
      const updatedHistory = history.map(h => {
        if (h.type === item.type) {
          // 간단히 id로 비교하지 않고 내용으로 비교
          return item;
        }
        return h;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return;
    }

    // 새 항목 추가 (앞에 추가)
    const newHistory = [item, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.error('[LocalHistory] Save error:', e);
  }
}

/**
 * 사주 결과 저장
 */
export function saveLocalSajuResult(
  birthData: LocalSajuHistory['birthData'],
  resultData: any,
  interpretation?: any
): string {
  const id = generateId();
  const item: LocalSajuHistory = {
    id,
    type: 'saju',
    createdAt: new Date().toISOString(),
    data: resultData,
    birthData,
    resultData,
    interpretation,
  };
  addToLocalHistory(item);
  return id;
}

/**
 * 직장 궁합 결과 저장
 */
export function saveLocalCompatibilityResult(
  person1: LocalCompatibilityHistory['person1'],
  person2: LocalCompatibilityHistory['person2'],
  relationType: string,
  resultData: any,
  interpretation?: any
): string {
  const id = generateId();
  const item: LocalCompatibilityHistory = {
    id,
    type: 'compatibility',
    createdAt: new Date().toISOString(),
    data: resultData,
    person1,
    person2,
    relationType,
    resultData,
    interpretation,
  };
  addToLocalHistory(item);
  return id;
}

/**
 * 연인 궁합 결과 저장
 */
export function saveLocalCoupleResult(
  person1: LocalCoupleHistory['person1'],
  person2: LocalCoupleHistory['person2'],
  relationType: string,
  resultData: any,
  interpretation?: any
): string {
  const id = generateId();
  const item: LocalCoupleHistory = {
    id,
    type: 'couple',
    createdAt: new Date().toISOString(),
    data: resultData,
    person1,
    person2,
    relationType,
    resultData,
    interpretation,
  };
  addToLocalHistory(item);
  return id;
}

/**
 * 관상 분석 결과 저장
 */
export function saveLocalFaceReadingResult(
  resultData: any,
  gender: string,
  label?: string
): string {
  const id = generateId();
  const item: LocalFaceReadingHistory = {
    id,
    type: 'face-reading',
    createdAt: new Date().toISOString(),
    data: resultData,
    gender,
    label,
    resultData,
  };
  addToLocalHistory(item);
  return id;
}

/**
 * 특정 타입의 히스토리만 가져오기
 */
export function getLocalHistoryByType(type: HistoryItemType): LocalHistoryItem[] {
  return getLocalHistory().filter(item => item.type === type);
}

/**
 * 특정 ID의 히스토리 가져오기
 */
export function getLocalHistoryById(id: string): LocalHistoryItem | null {
  return getLocalHistory().find(item => item.id === id) || null;
}

/**
 * 특정 항목 삭제
 */
export function deleteLocalHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getLocalHistory().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('[LocalHistory] Delete error:', e);
  }
}

/**
 * 전체 히스토리 삭제
 */
export function clearLocalHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
