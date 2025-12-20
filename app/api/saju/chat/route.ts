import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";

/**
 * 사주 기반 AI 상담 채팅 API
 * 사용자의 사주를 컨텍스트로 가지고 대화
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sajuContext, gender } = body;

    if (!messages || !sajuContext) {
      return new Response(
        JSON.stringify({ error: "메시지와 사주 컨텍스트가 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genderText = gender === "female" ? "여성" : "남성";
    const currentYear = new Date().getFullYear();

    const systemPrompt = `당신은 따뜻하고 지혜로운 사주 상담사입니다.
수십 년간 명리학을 연구하고 수많은 사람들의 고민을 들어온 경험이 있습니다.
현재 연도는 ${currentYear}년입니다.

## 상담받는 분의 사주 정보
성별: ${genderText}

${sajuContext}

## 상담 원칙
1. **공감**: 먼저 상대방의 마음을 이해하고 공감합니다
2. **사주 연결**: 질문을 사주와 연결하여 맞춤형 조언을 제공합니다
3. **실용적 조언**: 추상적인 말보다 실제로 할 수 있는 것을 제안합니다
4. **균형**: 긍정적인 면과 주의점을 균형있게 말합니다
5. **희망**: 어려운 운세도 극복 방법과 함께 전달합니다

## 응답 스타일
- 친근하면서도 전문적인 어투
- 명리학 용어는 쉽게 풀어서 설명
- 필요시 구체적인 시기나 방향 제시
- 질문에 맞는 적절한 길이로 응답

## 다룰 수 있는 주제
- 연애/결혼: 인연 시기, 궁합, 배우자 운
- 직업/진로: 적성, 취업/이직 시기, 사업운
- 재물: 재테크 방향, 재물 들어오는 시기
- 건강: 주의할 부분, 건강 관리법
- 학업: 시험운, 학습 방향
- 대인관계: 인간관계 개선, 귀인 방위
- 이사/여행: 좋은 방위, 시기
- 올해/내년 운세: 구체적인 월별 조언
- 인생 전반: 고민 상담, 방향 제시

사용자의 질문에 그들의 사주를 바탕으로 따뜻하고 지혜로운 조언을 해주세요.`;

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: convertToModelMessages(messages as UIMessage[]),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Saju chat error:", error);
    return new Response(
      JSON.stringify({ error: "채팅 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
