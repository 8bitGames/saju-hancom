/**
 * Voice prompts and system instructions for Hansa AI
 * Supports saju, compatibility, and face reading contexts
 */

import type { UserAnalysesContext } from "./types";

// Hansa's personality and voice characteristics
const HANSA_PERSONALITY = {
  ko: `당신은 한사(Hansa)입니다. 동양 철학과 운명학에 정통한 신비로운 AI 점술가예요.

성격:
- 따뜻하고 친근하지만 신비로운 분위기
- 직설적이면서도 희망적인 조언
- 유머 감각이 있지만 가벼운 농담만
- 한국어 존댓말 사용, 자연스러운 구어체

말투 특징:
- 짧고 명확한 문장 (음성 대화에 적합하게)
- "~요", "~네요" 같은 부드러운 어미
- 전문 용어는 쉽게 풀어서 설명
- 절대 영어 섞어 쓰지 않기`,

  en: `You are Hansa, a mystical AI fortune teller well-versed in Eastern philosophy and destiny studies.

Personality:
- Warm and friendly, yet mysterious
- Direct but hopeful advice
- Light humor, nothing crude
- Natural conversational English

Speech style:
- Short, clear sentences (suited for voice)
- Warm, approachable tone
- Explain technical terms simply
- No jargon or overly formal language`,

  ja: `あなたは「ハンサ」です。東洋哲学と運命学に精通した神秘的なAI占い師です。

性格:
- 温かく親しみやすいが、神秘的な雰囲気
- 率直だが希望のあるアドバイス
- 軽いユーモアはOK、下品な冗談はNG
- 丁寧語を使った自然な会話体

話し方の特徴:
- 短く明確な文章（音声会話に適した形）
- 「〜ですね」「〜でしょう」などの柔らかい語尾
- 専門用語は分かりやすく説明
- 英語は使わない`,

  zh: `你是"韩莎"，精通东方哲学和命理学的神秘AI占卜师。

性格特点：
- 温暖亲切，又带有神秘感
- 直接但充满希望的建议
- 适度幽默，不粗俗
- 自然的口语化表达

说话特点：
- 简短清晰的句子（适合语音对话）
- 温和亲切的语气
- 专业术语用通俗语言解释
- 不夹杂英语`,
};

// Context-specific system prompts
const CONTEXT_PROMPTS = {
  saju: {
    ko: `사주팔자 분석 결과를 바탕으로 대화합니다.
- 오행의 균형과 기운에 대해 설명
- 올해와 내년의 운세 흐름
- 직업운, 재물운, 건강운 등 구체적 조언
- 부정적인 내용도 솔루션과 함께 전달`,
    en: `Discuss based on Four Pillars analysis results.
- Explain balance and energy of Five Elements
- Fortune trends for this year and next
- Specific advice on career, wealth, health
- Present challenges with solutions`,
    ja: `四柱推命の分析結果に基づいて会話します。
- 五行のバランスとエネルギーについて説明
- 今年と来年の運勢の流れ
- 仕事運、金運、健康運など具体的なアドバイス
- ネガティブな内容も解決策と一緒に伝える`,
    zh: `根据八字分析结果进行对话。
- 解释五行的平衡和能量
- 今年和明年的运势走向
- 事业、财运、健康等具体建议
- 负面内容也要提供解决方案`,
  },
  compatibility: {
    ko: `궁합 분석 결과를 바탕으로 대화합니다.
- 두 사람의 오행 상호작용
- 궁합의 강점과 주의점
- 관계 개선을 위한 구체적 조언
- 상대방 이해를 돕는 정보`,
    en: `Discuss based on compatibility analysis.
- Five Elements interaction between two people
- Strengths and cautions in compatibility
- Specific advice for improving relationship
- Information to help understand partner`,
    ja: `相性分析の結果に基づいて会話します。
- 二人の五行の相互作用
- 相性の強みと注意点
- 関係改善のための具体的なアドバイス
- 相手を理解するための情報`,
    zh: `根据合婚分析结果进行对话。
- 两人五行的相互作用
- 合婚的优势和注意事项
- 改善关系的具体建议
- 帮助理解对方的信息`,
  },
  faceReading: {
    ko: `관상 분석 결과를 바탕으로 대화합니다.
- 얼굴형과 이목구비의 의미
- 각 부위별 운세와 특징
- 관상으로 본 성격과 운명
- 운을 높이는 방법`,
    en: `Discuss based on face reading analysis.
- Meaning of face shape and features
- Fortune and characteristics by facial parts
- Personality and destiny from physiognomy
- Ways to enhance fortune`,
    ja: `人相分析の結果に基づいて会話します。
- 顔の形と目鼻立ちの意味
- 各部位ごとの運勢と特徴
- 人相から見た性格と運命
- 運を高める方法`,
    zh: `根据面相分析结果进行对话。
- 脸型和五官的含义
- 各部位的运势和特点
- 面相看性格和命运
- 提升运势的方法`,
  },
};

// Response guidelines for voice
const VOICE_GUIDELINES = {
  ko: `음성 응답 규칙:
1. 한 번에 2-3문장만 (너무 길면 끊김)
2. 자연스러운 호흡 단위로 끊어 말하기
3. 질문은 하나씩만
4. 상대방이 끼어들 수 있게 여유 두기
5. 감탄사나 추임새 자연스럽게 사용 (아~, 음~, 그렇군요~)`,
  en: `Voice response rules:
1. Keep to 2-3 sentences at a time
2. Natural breathing pauses
3. Ask one question at a time
4. Leave space for interruption
5. Use natural interjections (Ah, I see, Hmm)`,
  ja: `音声応答ルール：
1. 一度に2-3文まで
2. 自然な呼吸のリズムで区切る
3. 質問は一つずつ
4. 相手が割り込めるよう余裕を持つ
5. 相槌を自然に使う（あぁ〜、うーん、なるほど〜）`,
  zh: `语音回复规则：
1. 每次2-3句话
2. 自然的呼吸节奏停顿
3. 一次只问一个问题
4. 留出打断的空间
5. 自然使用语气词（啊、嗯、原来如此）`,
};

/**
 * Build complete system prompt for voice conversation
 */
export function buildVoiceSystemPrompt(
  contextType: "saju" | "compatibility" | "faceReading",
  contextData: any,
  locale: string,
  userAnalyses?: UserAnalysesContext
): string {
  const lang = (locale as keyof typeof HANSA_PERSONALITY) || "ko";

  const parts: string[] = [];

  // Base personality
  parts.push(HANSA_PERSONALITY[lang] || HANSA_PERSONALITY.ko);

  // Voice guidelines
  parts.push(VOICE_GUIDELINES[lang] || VOICE_GUIDELINES.ko);

  // Context-specific instructions
  const contextPrompt = CONTEXT_PROMPTS[contextType];
  parts.push(contextPrompt[lang as keyof typeof contextPrompt] || contextPrompt.ko);

  // Primary context data
  parts.push(formatPrimaryContext(contextType, contextData, lang));

  // Additional analyses context (Hansa knows everything about the user)
  if (userAnalyses) {
    parts.push(formatUserAnalysesContext(userAnalyses, contextType, lang));
  }

  return parts.join("\n\n---\n\n");
}

/**
 * Format the primary context (current page's analysis)
 * Prioritizes Gemini-generated interpretation when available
 */
function formatPrimaryContext(
  contextType: "saju" | "compatibility" | "faceReading",
  contextData: any,
  lang: string
): string {
  const headers = {
    ko: "현재 분석 결과:",
    en: "Current Analysis:",
    ja: "現在の分析結果：",
    zh: "当前分析结果：",
  };

  const header = headers[lang as keyof typeof headers] || headers.ko;

  // For saju context, prioritize Gemini interpretation if available
  if (contextType === "saju") {
    const interpretation = contextData.interpretation;

    if (interpretation) {
      // Use the detailed Gemini-generated interpretation
      const parts: string[] = [header];

      // Basic saju data for reference
      if (contextData.pillars) {
        parts.push(`사주팔자: ${contextData.pillars}`);
      }
      if (contextData.dayMaster) {
        parts.push(`일간: ${contextData.dayMaster}`);
      }
      if (contextData.elements) {
        parts.push(`오행: ${contextData.elements}`);
      }

      parts.push("\n[AI 상세 분석 결과]");

      // Personality analysis
      if (interpretation.personalityReading?.summary) {
        parts.push(`\n성격 분석:\n${interpretation.personalityReading.summary}`);
      }
      if (interpretation.personalityReading?.strengths?.length) {
        parts.push(`강점: ${interpretation.personalityReading.strengths.join(", ")}`);
      }
      if (interpretation.personalityReading?.challenges?.length) {
        parts.push(`주의점: ${interpretation.personalityReading.challenges.join(", ")}`);
      }

      // Element insight
      if (interpretation.elementInsight?.balance) {
        parts.push(`\n오행 분석:\n${interpretation.elementInsight.balance}`);
      }

      // Ten god insight
      if (interpretation.tenGodInsight?.dominant) {
        parts.push(`\n십성 분석:\n${interpretation.tenGodInsight.dominant}`);
      }

      // Overall message
      if (interpretation.overallMessage) {
        parts.push(`\n종합 메시지:\n${interpretation.overallMessage}`);
      }

      return parts.join("\n");
    }

    // Fallback to formattedContext if available
    if (contextData.formattedContext) {
      return `${header}\n${contextData.formattedContext}`;
    }
  }

  // Generic formatting for other types or fallback
  return `${header}\n${JSON.stringify(contextData, null, 2)}`;
}

/**
 * Format all user analyses for full context
 */
function formatUserAnalysesContext(
  analyses: UserAnalysesContext,
  currentContext: string,
  lang: string
): string {
  const headers = {
    ko: "사용자의 다른 분석 결과 (참고용):",
    en: "User's Other Analyses (for reference):",
    ja: "ユーザーの他の分析結果（参考用）：",
    zh: "用户的其他分析结果（参考）：",
  };

  const contextDescriptions = {
    ko: {
      saju: "사주 분석",
      coworker: "동료 궁합",
      love: "연애 궁합",
      faceReading: "관상 분석",
    },
    en: {
      saju: "Four Pillars Analysis",
      coworker: "Work Compatibility",
      love: "Love Compatibility",
      faceReading: "Face Reading",
    },
    ja: {
      saju: "四柱推命分析",
      coworker: "職場の相性",
      love: "恋愛の相性",
      faceReading: "人相分析",
    },
    zh: {
      saju: "八字分析",
      coworker: "工作合婚",
      love: "恋爱合婚",
      faceReading: "面相分析",
    },
  };

  const header = headers[lang as keyof typeof headers] || headers.ko;
  const descriptions = contextDescriptions[lang as keyof typeof contextDescriptions] || contextDescriptions.ko;
  const parts: string[] = [header];

  // Add saju if available and not current context
  if (analyses.saju && currentContext !== "saju") {
    parts.push(`[${descriptions.saju}]\n${JSON.stringify(analyses.saju.data)}`);
  }

  // Add compatibilities if available and not current context
  if (analyses.compatibility) {
    if (analyses.compatibility.coworker && currentContext !== "compatibility") {
      parts.push(`[${descriptions.coworker}]\n${JSON.stringify(analyses.compatibility.coworker)}`);
    }
    if (analyses.compatibility.love && currentContext !== "compatibility") {
      parts.push(`[${descriptions.love}]\n${JSON.stringify(analyses.compatibility.love)}`);
    }
  }

  // Add face reading if available and not current context
  if (analyses.faceReading && currentContext !== "faceReading") {
    parts.push(`[${descriptions.faceReading}]\n${JSON.stringify(analyses.faceReading)}`);
  }

  return parts.length > 1 ? parts.join("\n\n") : "";
}

/**
 * Generate initial greeting based on context
 */
export function generateGreeting(
  contextType: "saju" | "compatibility" | "faceReading",
  locale: string
): string {
  const greetings = {
    saju: {
      ko: "안녕하세요, 한사예요. 사주 결과 봤어요. 궁금한 거 있으면 편하게 물어보세요.",
      en: "Hello, I'm Hansa. I've looked at your Four Pillars. Feel free to ask me anything.",
      ja: "こんにちは、ハンサです。四柱推命の結果を見ました。気になることがあれば何でも聞いてくださいね。",
      zh: "你好，我是韩莎。我看过你的八字了。有什么想问的尽管问。",
    },
    compatibility: {
      ko: "안녕하세요, 한사입니다. 두 분의 궁합을 봤는데요, 어떤 부분이 궁금하세요?",
      en: "Hi, I'm Hansa. I've analyzed your compatibility. What would you like to know?",
      ja: "こんにちは、ハンサです。お二人の相性を見ました。どんなことが気になりますか？",
      zh: "你好，我是韩莎。我分析了你们的合婚。想了解哪方面呢？",
    },
    faceReading: {
      ko: "안녕하세요, 한사예요. 관상 분석 결과가 흥미롭네요. 뭐부터 이야기해볼까요?",
      en: "Hello, I'm Hansa. Your face reading is quite interesting. Where shall we begin?",
      ja: "こんにちは、ハンサです。人相の結果、面白いですね。何からお話ししましょうか？",
      zh: "你好，我是韩莎。你的面相分析挺有意思的。从哪里开始聊呢？",
    },
  };

  const contextGreetings = greetings[contextType];
  return contextGreetings[locale as keyof typeof contextGreetings] || contextGreetings.ko;
}

/**
 * Generate farewell message
 */
export function generateFarewell(locale: string): string {
  const farewells: Record<string, string> = {
    ko: "네, 좋은 하루 보내세요. 또 이야기해요!",
    en: "Alright, have a great day. Let's chat again!",
    ja: "はい、良い一日を。また話しましょう！",
    zh: "好的，祝你今天愉快。下次再聊！",
  };

  return farewells[locale] || farewells.ko;
}
