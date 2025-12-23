/**
 * Age Agent (연령 축 에이전트)
 *
 * 역할: 사용자의 연령 및 생애 단계 분석
 * - 만 나이 계산
 * - 생애 단계 결정 (청년기, 장년기 등)
 * - 연령대별 관심사 및 고민 분석
 * - 민감 주제 판별
 */

import type { AgeAgentInput, AgeAgentOutput, LifeStage } from "./types";

/**
 * 연령대 문자열 생성
 */
function getAgeGroupString(age: number, locale: "ko" | "en"): string {
  const decade = Math.floor(age / 10) * 10;
  const position = age % 10;

  let positionText: string;
  if (locale === "ko") {
    if (position <= 3) positionText = "초반";
    else if (position <= 6) positionText = "중반";
    else positionText = "후반";
    return `${decade}대 ${positionText}`;
  } else {
    if (position <= 3) positionText = "early";
    else if (position <= 6) positionText = "mid";
    else positionText = "late";
    return `${positionText} ${decade}s`;
  }
}

/**
 * 생애 단계 결정
 */
function determineLifeStage(age: number): LifeStage {
  if (age < 30) return "청년기";
  if (age < 40) return "장년초기";
  if (age < 50) return "장년중기";
  if (age < 60) return "장년후기";
  if (age < 70) return "중년기";
  return "노년기";
}

/**
 * 생애 단계별 관심사 및 고민
 */
interface LifeStageContext {
  primaryConcerns: string[];
  typicalGoals: string[];
  commonChallenges: string[];
}

function getLifeStageContext(lifeStage: LifeStage, locale: "ko" | "en"): LifeStageContext {
  const contextMap: Record<LifeStage, { ko: LifeStageContext; en: LifeStageContext }> = {
    "청년기": {
      ko: {
        primaryConcerns: ["취업", "연애", "자기계발", "독립", "진로"],
        typicalGoals: ["첫 직장 안정", "결혼 준비", "경제적 독립", "자아실현"],
        commonChallenges: ["취업 경쟁", "주거 문제", "연애 고민", "미래 불안"]
      },
      en: {
        primaryConcerns: ["career", "dating", "self-development", "independence", "career path"],
        typicalGoals: ["stable first job", "marriage preparation", "financial independence", "self-realization"],
        commonChallenges: ["job competition", "housing issues", "relationship concerns", "future anxiety"]
      }
    },
    "장년초기": {
      ko: {
        primaryConcerns: ["결혼", "출산", "커리어 성장", "재테크", "내 집 마련"],
        typicalGoals: ["가정 형성", "직장 안정", "자산 형성", "전문성 확보"],
        commonChallenges: ["워라밸", "육아 스트레스", "경력 정체", "경제적 부담"]
      },
      en: {
        primaryConcerns: ["marriage", "childbirth", "career growth", "investment", "home ownership"],
        typicalGoals: ["family formation", "job stability", "asset building", "expertise development"],
        commonChallenges: ["work-life balance", "parenting stress", "career plateau", "financial burden"]
      }
    },
    "장년중기": {
      ko: {
        primaryConcerns: ["자녀 교육", "건강 관리", "커리어 전환", "노후 준비", "부모 부양"],
        typicalGoals: ["자녀 성장 지원", "건강 유지", "재정 안정", "제2의 커리어"],
        commonChallenges: ["중년의 위기", "건강 문제", "가족 갈등", "경제적 압박"]
      },
      en: {
        primaryConcerns: ["children's education", "health management", "career transition", "retirement prep", "elderly care"],
        typicalGoals: ["supporting children", "maintaining health", "financial stability", "second career"],
        commonChallenges: ["midlife crisis", "health issues", "family conflicts", "economic pressure"]
      }
    },
    "장년후기": {
      ko: {
        primaryConcerns: ["자녀 독립", "건강", "은퇴 준비", "노후 자금", "인생 2막"],
        typicalGoals: ["자녀 독립 지원", "건강한 노후", "은퇴 후 계획", "인생 정리"],
        commonChallenges: ["빈둥지 증후군", "건강 악화", "은퇴 불안", "정체성 변화"]
      },
      en: {
        primaryConcerns: ["children independence", "health", "retirement prep", "retirement fund", "second life"],
        typicalGoals: ["supporting children's independence", "healthy aging", "post-retirement plans", "life organization"],
        commonChallenges: ["empty nest syndrome", "health decline", "retirement anxiety", "identity change"]
      }
    },
    "중년기": {
      ko: {
        primaryConcerns: ["건강", "은퇴 생활", "손주", "여가", "사회 참여"],
        typicalGoals: ["건강 관리", "여유로운 생활", "가족 화합", "취미 생활"],
        commonChallenges: ["건강 문제", "경제적 불안", "외로움", "역할 상실감"]
      },
      en: {
        primaryConcerns: ["health", "retirement life", "grandchildren", "leisure", "social participation"],
        typicalGoals: ["health management", "comfortable life", "family harmony", "hobbies"],
        commonChallenges: ["health issues", "financial insecurity", "loneliness", "loss of role"]
      }
    },
    "노년기": {
      ko: {
        primaryConcerns: ["건강", "가족", "삶의 의미", "죽음 준비", "유산"],
        typicalGoals: ["건강 유지", "가족과의 시간", "평화로운 노후", "삶의 정리"],
        commonChallenges: ["건강 악화", "고독", "경제적 어려움", "의존성 증가"]
      },
      en: {
        primaryConcerns: ["health", "family", "meaning of life", "end-of-life prep", "legacy"],
        typicalGoals: ["maintaining health", "time with family", "peaceful retirement", "life organization"],
        commonChallenges: ["health decline", "loneliness", "financial difficulties", "increased dependency"]
      }
    }
  };

  return contextMap[lifeStage]?.[locale] || contextMap["장년중기"][locale];
}

/**
 * 연령 기반 컨텍스트 메시지 생성
 */
function generateAgeContext(
  age: number,
  lifeStage: LifeStage,
  gender: "male" | "female",
  locale: "ko" | "en"
): string {
  const genderText = locale === "ko"
    ? (gender === "male" ? "남성" : "여성")
    : (gender === "male" ? "man" : "woman");

  const ageGroup = getAgeGroupString(age, locale);

  const lifeStageNames: Record<LifeStage, { ko: string; en: string }> = {
    "청년기": { ko: "청년기", en: "young adulthood" },
    "장년초기": { ko: "장년 초기", en: "early middle age" },
    "장년중기": { ko: "장년 중기", en: "middle age" },
    "장년후기": { ko: "장년 후기", en: "late middle age" },
    "중년기": { ko: "중년기", en: "senior years" },
    "노년기": { ko: "노년기", en: "elderly years" }
  };

  if (locale === "ko") {
    return `${ageGroup} ${genderText}으로, 현재 ${lifeStageNames[lifeStage].ko}에 해당합니다. 이 시기의 특성과 관심사를 고려하여 조언드리겠습니다.`;
  } else {
    return `As a ${genderText} in your ${ageGroup}, you are currently in ${lifeStageNames[lifeStage].en}. I will provide advice considering the characteristics and interests of this life stage.`;
  }
}

/**
 * 연령대별 민감 주제 판별
 */
function getSensitivities(
  age: number,
  lifeStage: LifeStage,
  gender: "male" | "female",
  locale: "ko" | "en"
): string[] {
  const sensitivities: string[] = [];

  if (locale === "ko") {
    // 20대 후반~30대 미혼에게 결혼 압박 주의
    if (age >= 27 && age <= 39) {
      sensitivities.push("결혼/출산 압박성 발언 주의");
    }

    // 40대 이상 건강 관련 불안감 주의
    if (age >= 40) {
      sensitivities.push("건강 불안 과도하게 자극 주의");
    }

    // 50대 이상 은퇴/노화 민감
    if (age >= 50) {
      sensitivities.push("은퇴/노화 관련 부정적 표현 주의");
    }

    // 40대 중반 이후 자녀 관련
    if (age >= 45) {
      sensitivities.push("자녀 성공/실패 비교 주의");
    }

    // 60대 이상 죽음/질병 표현 주의
    if (age >= 60) {
      sensitivities.push("죽음/질병 관련 직접적 표현 주의");
    }
  } else {
    if (age >= 27 && age <= 39) {
      sensitivities.push("Avoid pressuring about marriage/children");
    }
    if (age >= 40) {
      sensitivities.push("Avoid excessive health anxiety triggers");
    }
    if (age >= 50) {
      sensitivities.push("Avoid negative expressions about retirement/aging");
    }
    if (age >= 45) {
      sensitivities.push("Avoid comparing children's success/failure");
    }
    if (age >= 60) {
      sensitivities.push("Avoid direct expressions about death/illness");
    }
  }

  return sensitivities;
}

/**
 * Age Agent 메인 함수
 */
export async function runAgeAgent(input: AgeAgentInput): Promise<AgeAgentOutput> {
  // 만 나이 계산
  const age = input.currentYear - input.birthYear;

  // 연령대 문자열
  const ageGroup = getAgeGroupString(age, input.locale);

  // 생애 단계
  const lifeStage = determineLifeStage(age);

  // 생애 단계별 관심사
  const lifeStageContext = getLifeStageContext(lifeStage, input.locale);

  // 연령 기반 컨텍스트 메시지
  const ageContext = generateAgeContext(age, lifeStage, input.gender, input.locale);

  // 민감 주제
  const sensitivities = getSensitivities(age, lifeStage, input.gender, input.locale);

  return {
    age,
    ageGroup,
    lifeStage,
    lifeStageContext,
    ageContext,
    sensitivities
  };
}

export default runAgeAgent;
