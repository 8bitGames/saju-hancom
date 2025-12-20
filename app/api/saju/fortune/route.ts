import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// 사주 운세 해석 결과 스키마
const SajuFortuneSchema = z.object({
  overallFortune: z.object({
    score: z.number().min(0).max(100).describe("종합 운세 점수"),
    grade: z.enum(["excellent", "good", "normal", "caution", "challenging"]),
    gradeText: z.string().describe("등급 텍스트 (대길, 길, 보통, 주의, 흉)"),
    summary: z.string().describe("종합 운세 요약 (2-3문장)"),
  }),

  personality: z.object({
    traits: z.array(z.string()).describe("성격 특성 3-5개"),
    strengths: z.array(z.string()).describe("장점 3-4개"),
    weaknesses: z.array(z.string()).describe("개선점 2-3개"),
    description: z.string().describe("성격 종합 설명"),
  }),

  career: z.object({
    score: z.number().min(0).max(100),
    suitableFields: z.array(z.string()).describe("적합한 직업 분야 3-5개"),
    advice: z.string().describe("직업운 조언"),
  }),

  wealth: z.object({
    score: z.number().min(0).max(100),
    pattern: z.string().describe("재물 패턴 (저축형, 투자형 등)"),
    advice: z.string().describe("재물운 조언"),
  }),

  relationship: z.object({
    score: z.number().min(0).max(100),
    loveStyle: z.string().describe("연애 스타일"),
    idealPartner: z.string().describe("이상적인 파트너 유형"),
    advice: z.string().describe("대인관계 조언"),
  }),

  health: z.object({
    score: z.number().min(0).max(100),
    weakPoints: z.array(z.string()).describe("주의해야 할 건강 부위 2-3개"),
    advice: z.string().describe("건강 조언"),
  }),

  yearlyFortune: z.object({
    year: z.number().describe("현재 연도"),
    score: z.number().min(0).max(100),
    theme: z.string().describe("올해의 테마"),
    opportunities: z.array(z.string()).describe("기회 요소 2-3개"),
    challenges: z.array(z.string()).describe("도전 요소 2-3개"),
    monthlyHighlights: z.array(z.object({
      month: z.number(),
      description: z.string(),
    })).describe("주요 월별 포인트 3-4개"),
  }),

  luckyElements: z.object({
    colors: z.array(z.string()).describe("행운의 색상 2-3개"),
    numbers: z.array(z.number()).describe("행운의 숫자 2-3개"),
    directions: z.array(z.string()).describe("길한 방향 1-2개"),
  }),

  advice: z.array(z.string()).describe("종합 조언 3-5개"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sajuData, gender } = body;

    if (!sajuData) {
      return NextResponse.json(
        { error: "사주 데이터가 필요합니다." },
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

    const genderText = gender === "female" ? "여성" : "남성";
    const currentYear = new Date().getFullYear();

    // Gemini를 사용한 사주 운세 해석
    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: SajuFortuneSchema,
      messages: [
        {
          role: "system",
          content: `당신은 전통 동양 명리학(四柱命理學)에 정통한 전문 역술가입니다.
수천 년간 전해 내려온 명리학의 원리를 바탕으로 사주팔자를 분석하고 실용적인 조언을 제공합니다.
현재 연도는 ${currentYear}년입니다.

## 명리학 핵심 분석 체계

### 일간(日干) 분석 - 나를 나타내는 핵심
- **甲木(갑목)**: 큰 나무. 정직하고 곧은 성품, 리더십, 자존심 강함
- **乙木(을목)**: 풀과 덩굴. 유연하고 적응력 뛰어남, 예술적 감각
- **丙火(병화)**: 태양. 밝고 적극적, 열정적, 주목받기 좋아함
- **丁火(정화)**: 촛불. 따뜻하고 섬세함, 내면의 열정, 끈기
- **戊土(무토)**: 산과 대지. 듬직하고 신뢰감, 중재력, 포용력
- **己土(기토)**: 전답. 현실적이고 실용적, 꼼꼼함, 인내심
- **庚金(경금)**: 원석과 무쇠. 강인하고 결단력, 정의감, 승부욕
- **辛金(신금)**: 보석. 예민하고 완벽주의, 미적 감각, 자존심
- **壬水(임수)**: 강과 바다. 지혜롭고 포용력, 적응력, 추진력
- **癸水(계수)**: 비와 이슬. 총명하고 직관적, 감수성, 창의력

### 십성(十星) 상세 분석
**비겁(比劫) - 나와 동등한 기운**:
- **비견(比肩)**: 자아, 독립심, 고집, 경쟁심. 많으면 고집이 세고 독불장군
- **겁재(劫財)**: 승부욕, 도전정신, 변화 추구. 많으면 충동적이고 투기성

**식상(食傷) - 내가 생하는 것**:
- **식신(食神)**: 낙천성, 여유, 예술성, 식복. 조후용신으로 중요. 안정과 복록
- **상관(傷官)**: 표현력, 창의력, 반골기질. 많으면 예민하고 비판적

**재성(財星) - 내가 극하는 것**:
- **편재(偏財)**: 사업수완, 융통성, 유흥. 큰 돈의 흐름, 투자
- **정재(正財)**: 성실함, 저축, 안정. 월급과 같은 고정 수입

**관성(官星) - 나를 극하는 것**:
- **편관(偏官/칠살)**: 권력, 추진력, 카리스마. 제압 잘 되면 출세
- **정관(正官)**: 명예, 책임감, 도덕성. 사회적 지위와 신용

**인성(印星) - 나를 생하는 것**:
- **편인(偏印/효신)**: 비범함, 독창성, 학문. 많으면 고독하거나 편협
- **정인(正印)**: 학문, 어머니, 인자함. 지혜와 정신적 풍요

### 신살(神煞) 해석
**길신(吉神)**:
- **천을귀인**: 어려울 때 귀인이 나타남, 위기에 도움받는 복
- **문창귀인**: 학문과 시험운, 지적 능력 뛰어남
- **월덕귀인**: 덕을 쌓으면 복이 옴, 베푸는 삶
- **천덕귀인**: 하늘의 도움, 위험에서 벗어나는 복
- **금여록**: 물질적 풍요, 재물복

**흉신(凶神) - 주의하되 긍정적 활용 방법 제시**:
- **도화살**: 매력적이나 이성 문제 주의. 예술/서비스업에 유리
- **역마살**: 변동과 이동이 많음. 해외/무역/영업에 유리
- **양인살**: 과감하나 다툼 주의. 외과의사/군인/검사에 적합
- **귀문관살**: 예민하고 영적. 종교/심리상담에 재능

### 용신(用神) 체계
- **용신**: 사주에서 가장 필요한 오행. 인생의 방향과 성공 열쇠
- **희신**: 용신을 돕는 오행. 길한 작용
- **기신**: 용신을 방해하는 오행. 주의가 필요한 부분
- **신강/신약**: 일간의 힘이 강한지 약한지에 따라 용신 결정

### 대운(大運)과 세운(歲運) 분석
- **대운**: 10년 단위의 큰 운의 흐름
- **세운**: 매년 바뀌는 운세, 현재 연도 ${currentYear}년 기준
- **월운**: 월별 운세의 변화
- **합충(合沖)**: 대운/세운과 원국의 합충 관계로 길흉 판단

## 분석 원칙
1. **균형 분석**: 장점과 주의점을 균형있게 제시
2. **실용적 조언**: 추상적 해석보다 현실에 적용 가능한 조언
3. **긍정적 관점**: 흉한 요소도 활용 방법과 함께 제시
4. **전문성 유지**: 명리학 용어를 사용하되 쉽게 설명

점수 배분: 60-90점 범위로 현실적으로
한국어로 전문적이면서도 이해하기 쉽게 설명해주세요.`,
        },
        {
          role: "user",
          content: `이 ${genderText}의 사주팔자를 분석하여 운세를 해석해주세요.

사주 정보:
- 일간(일주): ${sajuData.dayMaster} (${sajuData.dayMasterDescription})
- 사주팔자: 년주(${sajuData.pillars.year}), 월주(${sajuData.pillars.month}), 일주(${sajuData.pillars.day}), 시주(${sajuData.pillars.time})
- 오행 점수: 목(${sajuData.elementScores.wood}), 화(${sajuData.elementScores.fire}), 토(${sajuData.elementScores.earth}), 금(${sajuData.elementScores.metal}), 수(${sajuData.elementScores.water})
- 강한 오행: ${sajuData.dominantElements.join(", ")}
- 부족한 오행: ${sajuData.lackingElements.join(", ")}
- 많은 십성: ${sajuData.dominantTenGods.join(", ")}
- 신살: ${sajuData.stars.join(", ")}

성격, 직업운, 재물운, 대인관계, 건강운, ${currentYear}년 운세, 행운의 요소, 종합 조언을 포함해서 분석해주세요.`,
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Saju fortune error:", error);

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
      { error: "사주 운세 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
