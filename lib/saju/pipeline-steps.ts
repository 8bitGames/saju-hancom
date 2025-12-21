/**
 * 사주 분석 파이프라인 - 각 단계별 분석 함수
 * Gemini API를 사용한 6단계 분석 시스템
 */

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import {
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  Step6Schema,
  type Step1Result,
  type Step2Result,
  type Step3Result,
  type Step4Result,
  type Step5Result,
  type Step6Result,
} from "./pipeline-schemas";
import type { SajuAnalysisInput } from "./pipeline-types";
import { GEMINI_MODEL } from "@/lib/constants/ai";

// ============================================================================
// 공통 유틸리티
// ============================================================================

const getModel = () => google(GEMINI_MODEL);

const currentYear = new Date().getFullYear();

// ============================================================================
// Step 1: 기초 구조 분석
// ============================================================================

export async function analyzeStep1_Foundation(
  input: SajuAnalysisInput
): Promise<Step1Result> {
  const genderText = input.gender === "female" ? "여성" : "남성";

  const result = await generateObject({
    model: getModel(),
    schema: Step1Schema,
    messages: [
      {
        role: "system",
        content: `당신은 전통 동양 명리학(四柱命理學) 전문가입니다.
주어진 생년월일시를 바탕으로 사주팔자의 기초 구조를 분석합니다.

## 분석 과제
1. 만세력을 기반으로 정확한 년주, 월주, 일주, 시주를 도출
2. 각 기둥의 천간과 지지의 오행 배정
3. 오행 점수 계산 (천간 2점, 지지 본기 2점, 중기 1점, 여기 0.5점)
4. 천간 관계 파악 (천간합, 천간충)
5. 지지 관계 파악 (삼합, 육합, 방합, 충, 형, 파, 해)

## 오행 점수 계산 원칙
- 천간: 해당 오행 +2점
- 지지 본기: 해당 오행 +2점
- 지지 중기: 해당 오행 +1점
- 지지 여기: 해당 오행 +0.5점

## 천간 관계
- 천간합: 甲己合, 乙庚合, 丙辛合, 丁壬合, 戊癸合
- 천간충: 甲庚沖, 乙辛沖, 丙壬沖, 丁癸沖

## 지지 관계
- 삼합: 寅午戌(화), 巳酉丑(금), 申子辰(수), 亥卯未(목)
- 육합: 子丑合, 寅亥合, 卯戌合, 辰酉合, 巳申合, 午未合
- 충: 子午沖, 丑未沖, 寅申沖, 卯酉沖, 辰戌沖, 巳亥沖

정확하고 체계적으로 분석해주세요.`,
      },
      {
        role: "user",
        content: `다음 정보로 사주 기초 구조를 분석해주세요.

생년월일: ${input.birthDate}
태어난 시간: ${input.birthTime}
성별: ${genderText}
${input.isLunar ? "(음력)" : "(양력)"}

만세력 기준으로 정확한 사주팔자를 도출하고, 오행 분포와 간지 관계를 분석해주세요.`,
      },
    ],
  });

  return result.object;
}

// ============================================================================
// Step 2: 일간 심층 분석
// ============================================================================

export async function analyzeStep2_DayMaster(
  input: SajuAnalysisInput,
  step1: Step1Result
): Promise<Step2Result> {
  const genderText = input.gender === "female" ? "여성" : "남성";

  const result = await generateObject({
    model: getModel(),
    schema: Step2Schema,
    messages: [
      {
        role: "system",
        content: `당신은 전통 동양 명리학(四柱命理學) 전문가입니다.
일간(日干)을 중심으로 심층 분석을 수행합니다.

## 일간(日干) 상세 특성

### 甲木(갑목) - 큰 나무
- 성격: 정직하고 곧은 성품, 자존심 강함, 리더십
- 장점: 성장 지향, 도전정신, 정의로움
- 단점: 고집, 융통성 부족, 타협 어려움

### 乙木(을목) - 풀과 덩굴
- 성격: 유연하고 적응력 뛰어남, 예술적 감각
- 장점: 인내심, 끈기, 섬세함
- 단점: 우유부단, 의존적, 소극적

### 丙火(병화) - 태양
- 성격: 밝고 적극적, 열정적, 주목받기 좋아함
- 장점: 낙천적, 사교적, 표현력
- 단점: 성급함, 지구력 부족, 과시욕

### 丁火(정화) - 촛불
- 성격: 따뜻하고 섬세함, 내면의 열정
- 장점: 끈기, 직관력, 세심함
- 단점: 예민함, 소심함, 의심

### 戊土(무토) - 산과 대지
- 성격: 듬직하고 신뢰감, 중재력
- 장점: 포용력, 안정감, 신용
- 단점: 우둔함, 고집, 변화 거부

### 己土(기토) - 전답
- 성격: 현실적이고 실용적, 꼼꼼함
- 장점: 인내심, 성실함, 배려심
- 단점: 소심함, 걱정 많음, 이기적

### 庚金(경금) - 원석과 무쇠
- 성격: 강인하고 결단력, 정의감
- 장점: 승부욕, 추진력, 의리
- 단점: 냉정함, 과격함, 독선적

### 辛金(신금) - 보석
- 성격: 예민하고 완벽주의, 미적 감각
- 장점: 청결함, 분석력, 자존심
- 단점: 까다로움, 비판적, 신경질

### 壬水(임수) - 강과 바다
- 성격: 지혜롭고 포용력, 적응력
- 장점: 추진력, 활동성, 지략
- 단점: 변덕, 방종, 무책임

### 癸水(계수) - 비와 이슬
- 성격: 총명하고 직관적, 감수성
- 장점: 창의력, 관찰력, 연구심
- 단점: 음침함, 우울, 비밀주의

## 신강/신약 판단 기준
1. 월령 분석: 일간이 월지에서 득령(왕상)인지 실령(휴수사)인지
2. 통근 분석: 일간이 지지에 뿌리(통근)가 있는지
3. 투출 분석: 천간에 일간을 돕는 비겁, 인성이 있는지
4. 득지 여부: 일지가 일간을 생하거나 돕는지

## 용신 선정 원칙
- 신강: 식상, 재성, 관성으로 설기하거나 억제
- 신약: 비겁, 인성으로 일간을 도움
- 조후: 계절에 따른 한난조습 조절
- 억부용신: 과한 것은 억제, 부족한 것은 보충`,
      },
      {
        role: "user",
        content: `이 ${genderText}의 일간을 심층 분석해주세요.

사주 원국:
- 년주: ${step1.pillars.year.stem}${step1.pillars.year.branch}
- 월주: ${step1.pillars.month.stem}${step1.pillars.month.branch}
- 일주: ${step1.pillars.day.stem}${step1.pillars.day.branch}
- 시주: ${step1.pillars.time.stem}${step1.pillars.time.branch}

오행 점수:
- 목: ${step1.elementScores.wood}
- 화: ${step1.elementScores.fire}
- 토: ${step1.elementScores.earth}
- 금: ${step1.elementScores.metal}
- 수: ${step1.elementScores.water}

강한 오행: ${step1.dominantElements.join(", ")}
부족한 오행: ${step1.lackingElements.join(", ")}

천간 관계: ${step1.stemRelations.join(", ") || "없음"}
지지 관계: ${step1.branchRelations.join(", ") || "없음"}

일간의 특성, 월령 득실령, 신강/신약, 용신/희신/기신을 상세히 분석해주세요.`,
      },
    ],
  });

  return result.object;
}

// ============================================================================
// Step 3: 십성 분석
// ============================================================================

export async function analyzeStep3_TenGods(
  input: SajuAnalysisInput,
  step1: Step1Result,
  step2: Step2Result
): Promise<Step3Result> {
  const genderText = input.gender === "female" ? "여성" : "남성";

  const result = await generateObject({
    model: getModel(),
    schema: Step3Schema,
    messages: [
      {
        role: "system",
        content: `당신은 전통 동양 명리학(四柱命理學) 전문가입니다.
십성(十星) 분석을 통해 성격, 적성, 관계 스타일을 분석합니다.

## 십성(十星) 상세 해설

### 비겁(比劫) - 나와 동등한 기운
**비견(比肩)**: 자아, 독립심, 형제자매
- 많으면: 고집이 세고 독불장군, 경쟁심 강함
- 적당하면: 자립심, 추진력
- 직업: 독립사업, 전문직

**겁재(劫財)**: 승부욕, 도전정신, 변화
- 많으면: 충동적, 투기성, 재물 손실 가능
- 적당하면: 도전정신, 추진력
- 직업: 영업, 투자, 스포츠

### 식상(食傷) - 내가 생하는 것
**식신(食神)**: 낙천성, 여유, 예술성
- 많으면: 게으름, 식탐
- 적당하면: 안정, 복록, 장수
- 직업: 요식업, 예술, 교육

**상관(傷官)**: 표현력, 창의력, 반골기질
- 많으면: 예민함, 비판적, 권위에 도전
- 적당하면: 창의성, 언변
- 직업: 언론, 예술, 변호사

### 재성(財星) - 내가 극하는 것
**편재(偏財)**: 사업수완, 융통성, 유흥
- 많으면: 낭비, 바람기
- 적당하면: 사업수완, 재물복
- 직업: 사업가, 무역, 금융

**정재(正財)**: 성실함, 저축, 안정
- 많으면: 인색함, 소심함
- 적당하면: 저축, 안정적 재물
- 직업: 회계, 금융, 관리직

### 관성(官星) - 나를 극하는 것
**편관(偏官/칠살)**: 권력, 추진력, 카리스마
- 많으면: 폭력성, 권위주의
- 적당하면: 출세, 권력
- 직업: 군인, 경찰, 정치인

**정관(正官)**: 명예, 책임감, 도덕성
- 많으면: 소심함, 두려움
- 적당하면: 사회적 지위, 신용
- 직업: 공무원, 관리직, 법조계

### 인성(印星) - 나를 생하는 것
**편인(偏印/효신)**: 비범함, 독창성, 학문
- 많으면: 고독, 편협, 예술성
- 적당하면: 독창성, 영성
- 직업: 연구, 종교, 예술

**정인(正印)**: 학문, 어머니, 인자함
- 많으면: 의존적, 게으름
- 적당하면: 지혜, 학문
- 직업: 교육, 학술, 전문직

## 격국(格局) 판단
월지 장간을 기준으로 격국을 정하되, 투출된 천간을 우선합니다.`,
      },
      {
        role: "user",
        content: `이 ${genderText}의 십성을 분석해주세요.

사주 원국:
- 년주: ${step1.pillars.year.stem}${step1.pillars.year.branch}
- 월주: ${step1.pillars.month.stem}${step1.pillars.month.branch}
- 일주: ${step1.pillars.day.stem}${step1.pillars.day.branch}
- 시주: ${step1.pillars.time.stem}${step1.pillars.time.branch}

일간 정보:
- 일간: ${step2.dayMaster} (${step2.dayMasterKorean})
- 신강/신약: ${step2.bodyStrength}
- 용신: ${step2.usefulGod.primary}

각 기둥의 천간과 지지를 일간 기준으로 십성으로 변환하고,
격국, 성격 특성, 직업 적성, 대인관계 스타일을 분석해주세요.`,
      },
    ],
  });

  return result.object;
}

// ============================================================================
// Step 4: 신살 분석
// ============================================================================

export async function analyzeStep4_SpecialStars(
  input: SajuAnalysisInput,
  step1: Step1Result
): Promise<Step4Result> {
  const genderText = input.gender === "female" ? "여성" : "남성";

  const result = await generateObject({
    model: getModel(),
    schema: Step4Schema,
    messages: [
      {
        role: "system",
        content: `당신은 전통 동양 명리학(四柱命理學) 전문가입니다.
신살(神煞)을 분석하여 특별한 기운과 영향을 파악합니다.

## 주요 길신(吉神)

### 천을귀인(天乙貴人)
- 의미: 어려울 때 귀인이 나타남
- 활용: 사회활동, 대인관계에서 도움

### 문창귀인(文昌貴人)
- 의미: 학문과 시험운
- 활용: 학업, 자격증, 지적 활동

### 월덕귀인(月德貴人)
- 의미: 덕을 쌓으면 복이 옴
- 활용: 봉사, 나눔 활동

### 천덕귀인(天德貴人)
- 의미: 하늘의 도움
- 활용: 위험에서 보호받음

### 금여록(金輿祿)
- 의미: 물질적 풍요
- 활용: 재물 관련 활동

### 장성(將星)
- 의미: 리더십과 권위
- 활용: 조직 활동, 지도자 역할

### 화개(華蓋)
- 의미: 예술성, 종교성
- 활용: 창작 활동, 영성 수련

## 주요 흉신(凶神) - 긍정적 활용법 포함

### 도화살(桃花殺)
- 의미: 이성 매력, 예술성
- 주의: 이성 문제
- 긍정적 활용: 예술, 연예, 서비스업

### 역마살(驛馬殺)
- 의미: 이동과 변화
- 주의: 불안정
- 긍정적 활용: 해외, 무역, 영업

### 양인살(羊刃殺)
- 의미: 과감함, 결단력
- 주의: 다툼, 사고
- 긍정적 활용: 외과의사, 군인, 검사

### 귀문관살(鬼門關殺)
- 의미: 예민함, 영적 감각
- 주의: 정신건강
- 긍정적 활용: 종교, 심리상담

### 겁살(劫殺)
- 의미: 급변, 손실
- 주의: 재물 손실
- 긍정적 활용: 위기관리, 변화 주도

### 망신살(亡身殺)
- 의미: 명예 손상
- 주의: 평판 관리
- 긍정적 활용: 겸손, 신중함 계발

각 신살의 위치(년/월/일/시)와 영향력을 분석해주세요.`,
      },
      {
        role: "user",
        content: `이 ${genderText}의 신살을 분석해주세요.

사주 원국:
- 년주: ${step1.pillars.year.stem}${step1.pillars.year.branch}
- 월주: ${step1.pillars.month.stem}${step1.pillars.month.branch}
- 일주: ${step1.pillars.day.stem}${step1.pillars.day.branch}
- 시주: ${step1.pillars.time.stem}${step1.pillars.time.branch}

사주에 존재하는 길신과 흉신을 모두 찾아내고,
각각의 의미, 영향, 활용법을 설명해주세요.
흉신은 반드시 긍정적으로 활용하는 방법도 함께 제시해주세요.`,
      },
    ],
  });

  return result.object;
}

// ============================================================================
// Step 5: 대운/세운 분석
// ============================================================================

export async function analyzeStep5_FortuneTiming(
  input: SajuAnalysisInput,
  step1: Step1Result,
  step2: Step2Result
): Promise<Step5Result> {
  const genderText = input.gender === "female" ? "여성" : "남성";
  const birthYear = parseInt(input.birthDate.split("-")[0]);
  const currentAge = currentYear - birthYear + 1; // 한국 나이

  const result = await generateObject({
    model: getModel(),
    schema: Step5Schema,
    messages: [
      {
        role: "system",
        content: `당신은 전통 동양 명리학(四柱命理學) 전문가입니다.
대운(大運)과 세운(歲運)을 분석하여 현재와 미래의 운세 흐름을 파악합니다.

## 대운(大運) 분석
- 10년 단위의 큰 운의 흐름
- 월주를 기준으로 순행/역행 결정
- 남자 양년생, 여자 음년생: 순행
- 남자 음년생, 여자 양년생: 역행

## 세운(歲運) 분석 - ${currentYear}년 (을사년)
- 올해 세운: 乙巳 (을사)
- 을(乙): 음목, 유연함, 적응
- 사(巳): 화(火), 열정, 변화

## 합충 분석
### 원국과 대운의 관계
- 합이 많으면: 조화, 기회
- 충이 많으면: 변화, 도전

### 원국과 세운의 관계
- 합: 올해 좋은 인연, 기회
- 충: 변화, 새로운 시작
- 형: 갈등, 시련 후 성장

## 월별 운세 분석
각 월의 지지와 원국/대운과의 관계를 분석

현재 연도: ${currentYear}년
분석 대상 나이: 만 ${currentAge - 1}세 (한국 나이 ${currentAge}세)`,
      },
      {
        role: "user",
        content: `이 ${genderText}의 대운과 세운을 분석해주세요.

생년월일: ${input.birthDate}
현재 나이: 만 ${currentAge - 1}세 (한국 나이 ${currentAge}세)

사주 원국:
- 년주: ${step1.pillars.year.stem}${step1.pillars.year.branch}
- 월주: ${step1.pillars.month.stem}${step1.pillars.month.branch}
- 일주: ${step1.pillars.day.stem}${step1.pillars.day.branch}
- 시주: ${step1.pillars.time.stem}${step1.pillars.time.branch}

일간 정보:
- 일간: ${step2.dayMaster}
- 신강/신약: ${step2.bodyStrength}
- 용신: ${step2.usefulGod.primary}

1. 현재 대운 분석 (10년 운)
2. ${currentYear}년 세운 분석
3. 올해 주요 월별 운세 포인트
4. 시기별 조언을 제공해주세요.`,
      },
    ],
  });

  return result.object;
}

// ============================================================================
// Step 6: 종합 및 조언
// ============================================================================

export async function analyzeStep6_Synthesis(
  input: SajuAnalysisInput,
  step1: Step1Result,
  step2: Step2Result,
  step3: Step3Result,
  step4: Step4Result,
  step5: Step5Result
): Promise<Step6Result> {
  const genderText = input.gender === "female" ? "여성" : "남성";

  const result = await generateObject({
    model: getModel(),
    schema: Step6Schema,
    messages: [
      {
        role: "system",
        content: `당신은 전통 동양 명리학(四柱命理學) 전문가입니다.
모든 분석 결과를 종합하여 실용적인 조언과 함께 최종 결과를 제공합니다.

## 종합 분석 원칙

### 1. 균형 있는 평가
- 장점과 주의점을 모두 언급
- 지나치게 긍정적이거나 부정적이지 않게
- 점수는 60-90점 범위로 현실적으로

### 2. 실용적 조언
- 추상적 해석보다 현실에 적용 가능한 조언
- 즉시 실천할 수 있는 것 포함
- 장기적 방향성 제시

### 3. 등급 기준
- excellent (85-100): 대길, 매우 좋음
- good (70-84): 길, 좋음
- normal (55-69): 보통
- caution (40-54): 주의 필요
- challenging (0-39): 도전적

### 4. 영역별 분석
- 성격: 십성과 일간 기반
- 직업: 격국과 십성 기반
- 재물: 재성과 용신 기반
- 대인관계: 비겁과 관성 기반
- 건강: 오행 균형과 부족한 오행 기반

### 5. 행운 요소
- 용신/희신 오행의 색상
- 용신 관련 방향
- 용신 관련 활동

한국어로 전문적이면서도 따뜻하게 설명해주세요.`,
      },
      {
        role: "user",
        content: `이 ${genderText}의 사주 분석을 종합해주세요.

## 기초 분석 결과
- 강한 오행: ${step1.dominantElements.join(", ")}
- 부족한 오행: ${step1.lackingElements.join(", ")}
- 원국 요약: ${step1.summary}

## 일간 분석 결과
- 일간: ${step2.dayMaster} (${step2.dayMasterKorean})
- 신강/신약: ${step2.bodyStrength}
- 용신: ${step2.usefulGod.primary} (${step2.usefulGod.primaryElement})
- 희신: ${step2.usefulGod.supporting}
- 용신 선정 이유: ${step2.usefulGod.reasoning}

## 십성 분석 결과
- 격국: ${step3.structure}
- 주요 십성: ${step3.dominantGods.join(", ")}
- 성격: ${step3.personality.description}
- 직업 적성: ${step3.careerAptitude.suitableFields.join(", ")}

## 신살 분석 결과
- 길신: ${step4.auspiciousStars.map(s => s.koreanName).join(", ") || "없음"}
- 흉신: ${step4.inauspiciousStars.map(s => s.koreanName).join(", ") || "없음"}
- 신살 영향: ${step4.overallStarInfluence}

## 대운/세운 분석 결과
- 현재 대운: ${step5.currentMajorFortune.theme}
- 올해 운세: ${step5.yearlyFortune.theme}
- 올해 점수: ${step5.yearlyFortune.score}점

모든 분석을 종합하여:
1. 종합 점수와 등급
2. 영역별 (성격, 직업, 재물, 관계, 건강) 점수와 요약
3. 핵심 인사이트와 강점
4. 실용적 조언 (즉시/단기/장기)
5. 행운의 요소 (색상, 숫자, 방향, 활동)
6. 한줄 운세 메시지

를 제공해주세요.`,
      },
    ],
  });

  return result.object;
}
