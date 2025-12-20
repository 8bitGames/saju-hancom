import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// 궁합 분석 결과 스키마
const CompatibilitySchema = z.object({
  overallScore: z.number().min(0).max(100).describe("종합 궁합 점수"),
  grade: z.enum(["excellent", "good", "normal", "caution", "challenging"]),
  gradeText: z.string().describe("등급 텍스트 (천생연분, 좋음, 보통, 주의, 어려움)"),
  summary: z.string().describe("궁합 종합 요약 (2-3문장)"),

  compatibility: z.object({
    communication: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("소통 스타일 분석"),
    }),
    collaboration: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("협업 능력 분석"),
    }),
    trust: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("신뢰 관계 분석"),
    }),
    growth: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("함께 성장 가능성"),
    }),
    emotionalConnection: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("정서적 교감"),
    }),
  }),

  elementAnalysis: z.object({
    person1Dominant: z.string().describe("첫 번째 사람의 주요 오행"),
    person2Dominant: z.string().describe("두 번째 사람의 주요 오행"),
    interaction: z.string().describe("두 오행의 상호작용 (상생/상극)"),
    balanceAdvice: z.string().describe("균형을 위한 조언"),
  }),

  strengths: z.array(z.string()).describe("관계의 강점 3-5개"),
  challenges: z.array(z.string()).describe("관계의 도전 과제 2-4개"),

  relationshipAdvice: z.object({
    doList: z.array(z.string()).describe("관계 발전을 위해 할 일 3-4개"),
    dontList: z.array(z.string()).describe("피해야 할 행동 2-3개"),
    communicationTips: z.array(z.string()).describe("소통 팁 2-3개"),
  }),

  timing: z.object({
    goodPeriods: z.array(z.string()).describe("함께 하기 좋은 시기 2-3개"),
    cautionPeriods: z.array(z.string()).describe("주의가 필요한 시기 1-2개"),
  }),

  luckyElements: z.object({
    colors: z.array(z.string()).describe("함께 할 때 좋은 색상 2개"),
    activities: z.array(z.string()).describe("함께 하면 좋은 활동 3-4개"),
    places: z.array(z.string()).describe("함께 가면 좋은 장소 2-3개"),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2, relationType } = body;

    if (!person1 || !person2) {
      return NextResponse.json(
        { error: "두 사람의 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // Google AI API 키 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const relationTypeText = getRelationTypeText(relationType);

    // Gemini를 사용한 궁합 분석
    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: CompatibilitySchema,
      messages: [
        {
          role: "system",
          content: `당신은 전통 동양 명리학(四柱命理學) 기반의 비즈니스/직장 궁합 분석 전문가입니다.
두 사람의 사주팔자를 비교하여 직장 동료, 파트너, 상하관계에서의 궁합을 분석합니다.

## 비즈니스 궁합 핵심 분석 체계

### 일간(日干) 궁합 - 기본 성향 조화
**천간합(天干合)**: 두 일간이 합이 되면 자연스러운 협력 관계
- 甲己合(갑기합): 리더와 실무자의 조화
- 乙庚合(을경합): 유연함과 추진력의 조화
- 丙辛合(병신합): 열정과 섬세함의 조화
- 丁壬合(정임합): 끈기와 지혜의 조화
- 戊癸合(무계합): 안정과 창의의 조화

**상생(相生) 관계**: 한 사람이 다른 사람을 돕는 구조
- 목생화: 아이디어 → 실행력 연결
- 화생토: 열정 → 안정적 결과
- 토생금: 계획 → 구체적 성과
- 금생수: 결단 → 유연한 적응
- 수생목: 지혜 → 새로운 시작

**상극(相剋) 관계**: 갈등 가능성 있으나 상호 보완 가능
- 적절한 긴장감이 성과 향상에 도움
- 역할 분담과 소통으로 시너지 창출

### 지지(地支) 합충 관계
**삼합(三合)**: 강력한 팀워크 형성
- 寅午戌(인오술): 화기, 열정적 추진력
- 巳酉丑(사유축): 금기, 체계적 실행력
- 申子辰(신자진): 수기, 유연한 대응력
- 亥卯未(해묘미): 목기, 창의적 기획력

**육합(六合)**: 일대일 협력 관계 양호
- 子丑合, 寅亥合, 卯戌合, 辰酉合, 巳申合, 午未合

**충(沖)**: 의견 충돌 가능, 역할 분리 필요
- 子午沖, 丑未沖, 寅申沖, 卯酉沖, 辰戌沖, 巳亥沖
- 충이 있어도 합이 많으면 건설적 갈등으로 발전 가능

**형(刑)**: 권력 다툼 주의
- 같은 목표 다른 방식으로 인한 마찰
- 명확한 역할 정의로 해결 가능

### 십성 조합 분석 (비즈니스 관점)
**최적의 조합**:
- 정관 + 정재: 조직력과 실무 능력 조화
- 식신 + 편재: 창의력과 사업 수완
- 정인 + 상관: 지식과 표현력
- 비견 + 편관: 동등한 경쟁과 리더십

**주의 필요 조합**:
- 상관 + 정관: 권위에 대한 도전
- 겁재 + 편재: 재물 경쟁
- 양인 + 칠살: 과격한 추진력

### 비즈니스 관계 유형별 분석
**동료 관계**:
- 오행 균형과 상호 보완성 중시
- 삼합/육합 여부로 팀워크 예측

**상사-부하 관계**:
- 인성-비겁 관계가 이상적 (지도-성장)
- 관성이 적절하면 건전한 권위 형성

**파트너/협력 관계**:
- 천간합이 있으면 자연스러운 협력
- 재성-관성 조합은 사업 파트너로 좋음

**멘토-멘티 관계**:
- 인성 구조가 학습과 성장에 유리
- 식신-정인 조합이 이상적

## 분석 원칙
1. **균형 있는 평가**: 장단점 모두 언급
2. **실용적 조언**: 관계 개선을 위한 구체적 방법 제시
3. **긍정적 관점**: 어려운 조합도 극복 방안 함께 제시
4. **전문성 유지**: 명리학 용어 사용하되 이해하기 쉽게

점수 배분: 55-90점 범위로 현실적으로
한국어로 전문적이면서도 친근하게 설명해주세요.`,
        },
        {
          role: "user",
          content: `두 사람의 ${relationTypeText} 궁합을 분석해주세요.

첫 번째 사람 (${person1.name}):
- 성별: ${person1.gender === "female" ? "여성" : "남성"}
- 일간: ${person1.dayMaster} (${person1.dayMasterDescription})
- 사주팔자: 년주(${person1.pillars.year}), 월주(${person1.pillars.month}), 일주(${person1.pillars.day}), 시주(${person1.pillars.time})
- 오행: 목(${person1.elementScores.wood}), 화(${person1.elementScores.fire}), 토(${person1.elementScores.earth}), 금(${person1.elementScores.metal}), 수(${person1.elementScores.water})
- 강한 오행: ${person1.dominantElements.join(", ")}
- 부족한 오행: ${person1.lackingElements.join(", ")}

두 번째 사람 (${person2.name}):
- 성별: ${person2.gender === "female" ? "여성" : "남성"}
- 일간: ${person2.dayMaster} (${person2.dayMasterDescription})
- 사주팔자: 년주(${person2.pillars.year}), 월주(${person2.pillars.month}), 일주(${person2.pillars.day}), 시주(${person2.pillars.time})
- 오행: 목(${person2.elementScores.wood}), 화(${person2.elementScores.fire}), 토(${person2.elementScores.earth}), 금(${person2.elementScores.metal}), 수(${person2.elementScores.water})
- 강한 오행: ${person2.dominantElements.join(", ")}
- 부족한 오행: ${person2.lackingElements.join(", ")}

소통, 협업, 신뢰, 성장, 정서적 교감 등 다양한 측면에서 분석하고,
관계의 강점, 도전 과제, 조언, 함께 하면 좋은 활동 등을 포함해주세요.`,
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Compatibility analysis error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("API_KEY")) {
        return NextResponse.json(
          { error: "API 키가 유효하지 않습니다." },
          { status: 401 }
        );
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "궁합 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function getRelationTypeText(type?: string): string {
  switch (type) {
    case "colleague": return "동료 관계";
    case "supervisor": return "상사-부하 관계";
    case "subordinate": return "부하-상사 관계";
    case "partner": return "파트너/협력자 관계";
    case "client": return "고객/거래처 관계";
    case "mentor": return "멘토-멘티 관계";
    case "mentee": return "멘티-멘토 관계";
    default: return "관계";
  }
}
