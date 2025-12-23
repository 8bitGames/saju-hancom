/**
 * Context Orchestrator (통합 오케스트레이터)
 *
 * 역할: 세 에이전트(Temporal, Age, Chart)의 출력을 통합하여
 * 최종 개인화 컨텍스트 생성
 *
 * - 시스템 프롬프트 추가 문구 생성
 * - 추천/피해야 할 토픽 결정
 * - 개인화 포인트 우선순위 정리
 * - Google Grounding 검색 쿼리 제안
 */

import type {
  OrchestratorInput,
  OrchestratorOutput,
  TemporalAgentOutput,
  AgeAgentOutput,
  ChartAgentOutput
} from "./types";
import type { Element, TenGod } from "../types";
import { ELEMENT_KEYWORDS, TEN_GOD_KEYWORDS } from "../personalized-keywords";

/**
 * 추천 토픽 결정
 * - 시간적 맥락 + 연령 관심사 + 사주 강조점 결합
 */
function determineRecommendedTopics(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const topics: string[] = [];

  // 1. 시즌별 관심사 (Google Grounding 결과)
  topics.push(...temporal.seasonalInterests.topics.slice(0, 3));

  // 2. 연령대 주요 관심사
  topics.push(...age.lifeStageContext.primaryConcerns.slice(0, 2));

  // 3. 사주 기반 강조 토픽
  const flags = chart.personalizationFlags;

  if (locale === "ko") {
    if (flags.emphasizeCareer) topics.push("직업운", "사업운");
    if (flags.emphasizeWealth) topics.push("재물운", "투자");
    if (flags.emphasizeMovement) topics.push("이직", "이사", "여행");
    if (flags.emphasizeStudy) topics.push("학업운", "자격증", "자기계발");
    if (flags.emphasizeLeadership) topics.push("리더십", "승진");
    if (flags.healthCaution) topics.push("건강운", "건강관리");
  } else {
    if (flags.emphasizeCareer) topics.push("career fortune", "business");
    if (flags.emphasizeWealth) topics.push("wealth fortune", "investment");
    if (flags.emphasizeMovement) topics.push("job change", "moving", "travel");
    if (flags.emphasizeStudy) topics.push("study fortune", "certifications", "self-improvement");
    if (flags.emphasizeLeadership) topics.push("leadership", "promotion");
    if (flags.healthCaution) topics.push("health fortune", "wellness");
  }

  // 중복 제거
  return Array.from(new Set(topics));
}

/**
 * 피해야 할 토픽 결정
 */
function determineAvoidTopics(
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const avoidTopics: string[] = [];

  // 연령대 민감 주제
  avoidTopics.push(...age.sensitivities);

  // 사주 기반 피해야 할 토픽
  const flags = chart.personalizationFlags;

  if (locale === "ko") {
    if (flags.avoidMarriageAdvice) {
      avoidTopics.push("결혼 압박", "출산 권유", "연애 조언");
    }
    if (flags.relationshipCaution) {
      avoidTopics.push("대인관계 과도한 낙관", "새로운 만남 권유");
    }
  } else {
    if (flags.avoidMarriageAdvice) {
      avoidTopics.push("marriage pressure", "childbirth advice", "dating advice");
    }
    if (flags.relationshipCaution) {
      avoidTopics.push("over-optimistic relationship outlook", "encouraging new meetings");
    }
  }

  return Array.from(new Set(avoidTopics));
}

/**
 * 삶의 경험 추론 생성 (콜드 리딩 스타일)
 * 사주 특성 + 나이를 기반으로 "이렇게 살아오셨을 것입니다" 추론
 */
function generateLifeExperienceInferences(
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const inferences: string[] = [];
  const flags = chart.personalizationFlags;
  const stars = chart.significantStars;
  const currentAge = age.age;

  if (locale === "ko") {
    // 신살 기반 삶의 경험 추론
    const starNames = stars.map(s => s.star.name.toLowerCase());

    // 역마살
    if (starNames.some(n => n.includes("역마"))) {
      inferences.push("한 자리에 오래 머무르기보다 새로운 환경을 찾아 움직였던 시기가 있으셨을 겁니다. 마음 한켠에는 늘 '어디론가 떠나고 싶다'는 생각이 있으셨을 거예요.");
    }

    // 도화살
    if (starNames.some(n => n.includes("도화"))) {
      inferences.push("주변에서 은근히 인기가 있으셨거나, 이성에게 관심을 받았던 경험이 있으셨을 겁니다. 본인은 모르셨어도 누군가 당신을 좋아했던 적이 있었을 거예요.");
    }

    // 화개살
    if (starNames.some(n => n.includes("화개"))) {
      inferences.push("어릴 때부터 혼자만의 시간을 중요하게 여기셨을 겁니다. 사람들과 어울리면서도 마음 한켠에는 '나만의 세계'가 따로 있으셨죠.");
    }

    // 천을귀인/귀인
    if (starNames.some(n => n.includes("귀인"))) {
      inferences.push("인생의 중요한 순간마다 누군가의 도움을 받으셨던 경험이 있으셨을 겁니다. 우연히 만난 인연이 큰 전환점이 되었던 적이 있으셨죠.");
    }

    // 십성 기반 삶의 경험 추론
    const dominantTenGods = chart.dominantTenGods.map(t => t.tenGod);

    // 관성이 강하면
    if (dominantTenGods.includes("jeonggwan") || dominantTenGods.includes("pyeongwan")) {
      inferences.push("어렸을 때부터 규칙이나 어른들의 기대에 맞추려고 노력하셨을 겁니다. 하고 싶은 말이 있어도 참았던 적이 많으셨을 거예요.");
    }

    // 식상이 강하면
    if (dominantTenGods.includes("siksin") || dominantTenGods.includes("sanggwan")) {
      inferences.push("어릴 때부터 표현력이 남달랐거나, 뭔가 만들고 창작하는 것을 좋아하셨을 겁니다. 가만히 있기보다는 뭔가 하고 있어야 편하셨던 분이시죠.");
    }

    // 재성이 강하면
    if (dominantTenGods.includes("jeongjae") || dominantTenGods.includes("pyeonjae")) {
      inferences.push("어릴 때부터 현실적인 감각이 발달하셨을 겁니다. 용돈을 모으거나, 이득이 되는 일에 관심이 많으셨던 기억이 있으실 거예요.");
    }

    // 비겁이 강하면
    if (dominantTenGods.includes("bijian") || dominantTenGods.includes("gebjae")) {
      inferences.push("어릴 때부터 친구들 사이에서 주도적인 역할을 하셨거나, 반대로 형제자매와 경쟁했던 경험이 있으셨을 겁니다.");
    }

    // 인성이 강하면
    if (dominantTenGods.includes("jeongin") || dominantTenGods.includes("pyeonin")) {
      inferences.push("어릴 때부터 책이나 공부에 관심이 많으셨거나, 부모님의 기대를 받고 자라셨을 겁니다. 생각이 많고 신중한 편이셨죠.");
    }

    // 개인화 플래그 기반
    if (flags.emphasizeCareer) {
      inferences.push("일에 대한 욕심이 있으셔서, 때로는 개인적인 것을 희생하면서까지 커리어에 집중하셨던 시기가 있으셨을 겁니다.");
    }

    if (flags.healthCaution) {
      inferences.push("몸이 보내는 신호를 무시하고 무리하셨던 적이 있으셨을 겁니다. '좀 쉬어야 하는데'라고 생각하면서도 그러지 못했던 시기가 있으셨죠.");
    }

    // 연령대별 삶의 경험 추론
    if (currentAge >= 30 && currentAge < 40) {
      inferences.push("20대에 진로를 고민하시면서 여러 선택지 앞에서 고민하셨던 적이 있으셨을 겁니다. 그때의 선택이 지금의 당신을 만들었죠.");
    } else if (currentAge >= 40 && currentAge < 50) {
      inferences.push("30대에 커리어와 가정 사이에서 균형을 잡느라 바쁘셨던 시기가 있으셨죠. 모든 것을 다 잘하려다 지쳤던 적도 있으셨을 거예요.");
    } else if (currentAge >= 50) {
      inferences.push("인생의 전환점을 몇 번 겪으시면서, '이게 정말 내가 원하는 삶인가' 돌아보셨던 적이 있으셨을 겁니다.");
    }

  } else {
    // English version
    const starNames = stars.map(s => s.star.name.toLowerCase());

    if (starNames.some(n => n.includes("역마") || n.includes("travel"))) {
      inferences.push("There have been times when you moved to new environments rather than staying in one place. Deep down, you've probably always had a desire to 'go somewhere else.'");
    }

    if (starNames.some(n => n.includes("도화") || n.includes("flower"))) {
      inferences.push("You've likely received attention from others, perhaps without even realizing it. Someone probably liked you at some point, even if you didn't know.");
    }

    if (flags.emphasizeCareer) {
      inferences.push("There have been times when you sacrificed personal matters to focus on your career. You've probably pushed yourself harder than most.");
    }

    if (currentAge >= 40) {
      inferences.push("In your 30s, you probably struggled to balance career and family. There were likely moments when you felt exhausted trying to do it all.");
    }
  }

  // 최대 3개로 제한
  return inferences.slice(0, 3);
}

/**
 * 과거 사건/고난 추론 생성 (콜드 리딩 스타일)
 * "이런저런 일들이 있으셨을 겁니다" 형태의 구체적 사건 추론
 */
function generatePastEventInferences(
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const events: string[] = [];
  const flags = chart.personalizationFlags;
  const stars = chart.significantStars;
  const currentAge = age.age;
  const dominantTenGods = chart.dominantTenGods.map(t => t.tenGod);

  if (locale === "ko") {
    const starNames = stars.map(s => s.star.name.toLowerCase());

    // 역마살 기반 과거 사건
    if (starNames.some(n => n.includes("역마"))) {
      events.push("직장이나 거주지를 옮겨야 했던 시기가 있으셨을 겁니다. 본인의 의지든 상황이든, 변화의 소용돌이 속에 계셨던 적이 있으시죠.");
      if (currentAge >= 35) {
        events.push("커리어에서 방향을 바꿔야 했던 결정적인 순간이 있으셨을 거예요. 쉽지 않은 선택이었지만, 결국 움직이셨죠.");
      }
    }

    // 도화살 기반 과거 사건
    if (starNames.some(n => n.includes("도화"))) {
      events.push("인간관계에서 복잡했던 시기가 있으셨을 겁니다. 마음이 여러 곳으로 흔들렸거나, 누군가 때문에 힘드셨던 적이 있으시죠.");
    }

    // 화개살 기반 과거 사건
    if (starNames.some(n => n.includes("화개"))) {
      events.push("깊이 고민하고 방황했던 시기가 있으셨을 겁니다. '나는 왜 이렇게 다른가' 하는 생각을 하셨던 적이 있으시죠.");
    }

    // 귀인 기반 과거 사건
    if (starNames.some(n => n.includes("귀인"))) {
      events.push("어려운 상황에서 예상치 못한 도움을 받으셨던 적이 있으셨을 겁니다. 그 인연이 인생의 방향을 바꿔놓았을 수도 있어요.");
    }

    // 관성 기반 과거 사건 (압박, 책임)
    if (dominantTenGods.includes("jeonggwan") || dominantTenGods.includes("pyeongwan")) {
      events.push("책임감 때문에 하고 싶은 것을 포기하셨던 적이 있으셨을 겁니다. 주변의 기대나 의무감이 무거웠던 시기가 있으셨죠.");
    }

    // 식상 기반 과거 사건 (표현, 좌절)
    if (dominantTenGods.includes("siksin") || dominantTenGods.includes("sanggwan")) {
      events.push("하고 싶은 말이나 표현하고 싶은 것이 있었는데 막혔던 경험이 있으셨을 겁니다. 그때의 답답함이 아직도 기억나실 거예요.");
    }

    // 재성 기반 과거 사건 (재물, 손실)
    if (dominantTenGods.includes("jeongjae") || dominantTenGods.includes("pyeonjae")) {
      events.push("재정적으로 어려웠거나, 투자나 사업에서 쓰라린 경험을 하셨던 적이 있으셨을 겁니다. 그 경험이 지금의 신중함을 만들었죠.");
    }

    // 비겁 기반 과거 사건 (경쟁, 배신)
    if (dominantTenGods.includes("bijian") || dominantTenGods.includes("gebjae")) {
      events.push("가까운 사람과의 경쟁이나 갈등이 있으셨던 적이 있으셨을 겁니다. 믿었던 사람에게 서운했던 경험도 있으실 거예요.");
    }

    // 인성 기반 과거 사건 (학업, 부모)
    if (dominantTenGods.includes("jeongin") || dominantTenGods.includes("pyeonin")) {
      events.push("공부나 자기계발을 위해 많은 시간을 투자하셨던 시기가 있으셨을 겁니다. 혼자서 묵묵히 노력하셨던 기억이 있으시죠.");
    }

    // 연령대별 과거 사건
    if (currentAge >= 30 && currentAge < 40) {
      events.push("20대 후반에 인생의 방향에 대해 진지하게 고민하셨던 시기가 있으셨을 겁니다. '이대로 괜찮은가' 하는 생각을 하셨죠.");
    } else if (currentAge >= 40 && currentAge < 50) {
      events.push("30대에 가정과 일 사이에서 균형을 잡느라 지치셨던 시기가 있으셨을 겁니다. 모든 걸 다 잘하려다 번아웃이 왔던 적도 있으셨을 거예요.");
    } else if (currentAge >= 50) {
      events.push("인생의 큰 전환점을 겪으셨던 시기가 있으셨을 겁니다. 건강이든 가족이든 커리어든, 삶을 다시 돌아보게 만든 사건이 있으셨죠.");
    }

    // 건강 관련 과거 사건
    if (flags.healthCaution) {
      events.push("몸이 보내는 경고 신호를 무시하고 무리하셨던 적이 있으셨을 겁니다. 그때 좀 더 쉬었어야 했다는 생각이 드실 거예요.");
    }

  } else {
    // English version
    const starNames = stars.map(s => s.star.name.toLowerCase());

    if (starNames.some(n => n.includes("역마") || n.includes("travel"))) {
      events.push("There was a time when you had to change jobs or move. Whether by choice or circumstance, you've been through significant transitions.");
    }

    if (starNames.some(n => n.includes("도화") || n.includes("flower"))) {
      events.push("You've had complicated times in relationships. Your heart may have been pulled in different directions, or someone caused you pain.");
    }

    if (dominantTenGods.includes("jeonggwan") || dominantTenGods.includes("pyeongwan")) {
      events.push("There were times when you gave up what you wanted due to responsibility. The weight of expectations was heavy at some point.");
    }

    if (currentAge >= 40) {
      events.push("In your 30s, you may have experienced burnout trying to balance everything. Family, career, personal growth - it was overwhelming at times.");
    }
  }

  // 최대 3개로 제한
  return events.slice(0, 3);
}

/**
 * 미래 방향 제시 생성
 * 사주 특성과 과거 경험을 바탕으로 "앞으로 이렇게 나아가세요" 조언
 */
function generateFutureDirectionAdvice(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const advice: string[] = [];
  const flags = chart.personalizationFlags;
  const stars = chart.significantStars;
  const currentAge = age.age;
  const dominantTenGods = chart.dominantTenGods.map(t => t.tenGod);
  const yearPillar = temporal.yearlyPillar;

  if (locale === "ko") {
    const starNames = stars.map(s => s.star.name.toLowerCase());

    // 역마살 → 미래 방향
    if (starNames.some(n => n.includes("역마"))) {
      advice.push(`역마의 에너지를 두려워하지 마시고 적극적으로 활용하세요. ${yearPillar.description}의 해에는 새로운 환경이나 기회를 찾아 움직이시면 좋은 결과가 있을 겁니다.`);
    }

    // 도화살 → 미래 방향
    if (starNames.some(n => n.includes("도화"))) {
      advice.push("대인관계의 매력을 긍정적인 방향으로 활용하세요. 네트워킹이나 사람을 만나는 일에서 좋은 기회가 올 수 있습니다.");
    }

    // 화개살 → 미래 방향
    if (starNames.some(n => n.includes("화개"))) {
      advice.push("내면의 깊이를 살려 전문성을 키우시면 좋겠습니다. 혼자서 깊이 파고드는 분야에서 성과를 내실 수 있는 분이세요.");
    }

    // 귀인 → 미래 방향
    if (starNames.some(n => n.includes("귀인"))) {
      advice.push(`귀인운이 있으시니 주변 사람들과의 인연을 소중히 하세요. ${yearPillar.description}의 해에는 특히 새로운 만남을 통해 좋은 기회가 올 수 있습니다.`);
    }

    // 관성 → 미래 방향
    if (dominantTenGods.includes("jeonggwan") || dominantTenGods.includes("pyeongwan")) {
      advice.push("책임감이 강하신 분이니, 이제는 자신을 위한 시간도 챙기세요. 남을 위해 희생만 하다 보면 지치실 수 있습니다.");
    }

    // 식상 → 미래 방향
    if (dominantTenGods.includes("siksin") || dominantTenGods.includes("sanggwan")) {
      advice.push("표현력과 창의성을 살릴 수 있는 방향으로 나아가세요. 글쓰기, 강의, 창작 등 본인의 생각을 표현하는 일에서 빛을 발하실 겁니다.");
    }

    // 재성 → 미래 방향
    if (dominantTenGods.includes("jeongjae") || dominantTenGods.includes("pyeonjae")) {
      advice.push("현실적 감각이 뛰어나시니 재테크나 사업에서 좋은 기회를 잡으실 수 있습니다. 단, 과욕은 금물이에요.");
    }

    // 비겁 → 미래 방향
    if (dominantTenGods.includes("bijian") || dominantTenGods.includes("gebjae")) {
      advice.push("협력보다는 독자적인 영역을 구축하시는 게 좋겠습니다. 파트너십보다는 본인이 주도하는 일에서 성과를 내실 분이세요.");
    }

    // 인성 → 미래 방향
    if (dominantTenGods.includes("jeongin") || dominantTenGods.includes("pyeonin")) {
      advice.push("학습과 자기계발을 꾸준히 하시면 좋겠습니다. 전문성을 쌓아가시면 나중에 큰 자산이 될 거예요.");
    }

    // 연령대별 미래 방향
    if (currentAge >= 30 && currentAge < 40) {
      advice.push("지금은 씨앗을 뿌리는 시기입니다. 당장 결과가 안 보여도 꾸준히 노력하시면 40대에 결실을 보실 겁니다.");
    } else if (currentAge >= 40 && currentAge < 50) {
      advice.push("지금까지 쌓아온 것을 정리하고 다음 단계를 준비하실 시기입니다. 새로운 도전보다는 깊이를 더하시는 게 좋겠습니다.");
    } else if (currentAge >= 50) {
      advice.push("이제는 쌓아온 경험을 나누고 전수하실 시기입니다. 후배를 키우거나 멘토 역할에서 보람을 찾으실 수 있습니다.");
    }

    // 건강 관련 미래 방향
    if (flags.healthCaution) {
      advice.push("건강이 모든 것의 기반입니다. 앞으로는 몸의 신호를 무시하지 마시고, 정기적인 관리를 습관화하세요.");
    }

    // 커리어 관련 미래 방향
    if (flags.emphasizeCareer) {
      advice.push(`${yearPillar.description}의 해는 커리어에서 중요한 변화가 있을 수 있습니다. 준비된 자에게 기회가 오니 꾸준히 실력을 쌓으세요.`);
    }

    // 이동/변화 관련 미래 방향
    if (flags.emphasizeMovement) {
      advice.push("변화의 기운이 있으시니 새로운 환경이나 기회가 오면 두려워하지 마세요. 움직임 속에서 더 큰 성장을 하실 분입니다.");
    }

  } else {
    // English version
    const starNames = stars.map(s => s.star.name.toLowerCase());

    if (starNames.some(n => n.includes("역마") || n.includes("travel"))) {
      advice.push(`Don't fear your mobility energy - use it actively. In the year of ${yearPillar.description}, moving toward new environments or opportunities will bring good results.`);
    }

    if (starNames.some(n => n.includes("귀인") || n.includes("noble"))) {
      advice.push(`You have noble person luck, so cherish your connections. New meetings in ${yearPillar.description} year could bring great opportunities.`);
    }

    if (dominantTenGods.includes("siksin") || dominantTenGods.includes("sanggwan")) {
      advice.push("Move in a direction that leverages your expressiveness and creativity. You'll shine in work that allows you to express your ideas - writing, teaching, creating.");
    }

    if (currentAge >= 40) {
      advice.push("It's time to organize what you've built and prepare for the next stage. Focus on deepening your expertise rather than starting entirely new ventures.");
    }

    if (flags.healthCaution) {
      advice.push("Health is the foundation of everything. Don't ignore your body's signals anymore, and make regular self-care a habit.");
    }
  }

  // 최대 3개로 제한
  return advice.slice(0, 3);
}

/**
 * 개인화 포인트 생성
 */
function generatePersonalizationPoints(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const points: string[] = [];

  if (locale === "ko") {
    // 시간 기반
    points.push(`현재 ${temporal.season}철, ${temporal.yearlyPillar.description}`);
    points.push(...temporal.timingAdvice.slice(0, 2));

    // 연령 기반
    points.push(`${age.ageGroup} (${age.lifeStage})`);
    points.push(age.ageContext);

    // 사주 기반
    points.push(chart.chartContext);

    // 건강 관련
    if (chart.healthFlags.watchAreas.length > 0) {
      points.push(`건강 주의: ${chart.healthFlags.watchAreas.join(", ")}`);
    }

    // 주요 신살
    if (chart.significantStars.length > 0) {
      const starNames = chart.significantStars.map(s => s.star.name).slice(0, 3);
      points.push(`주요 신살: ${starNames.join(", ")}`);
    }
  } else {
    // Time-based
    points.push(`Currently ${temporal.season}, ${temporal.yearlyPillar.description}`);
    points.push(...temporal.timingAdvice.slice(0, 2));

    // Age-based
    points.push(`${age.ageGroup} (${age.lifeStage})`);
    points.push(age.ageContext);

    // Chart-based
    points.push(chart.chartContext);

    // Health
    if (chart.healthFlags.watchAreas.length > 0) {
      points.push(`Health watch: ${chart.healthFlags.watchAreas.join(", ")}`);
    }

    // Stars
    if (chart.significantStars.length > 0) {
      const starNames = chart.significantStars.map(s => s.star.name).slice(0, 3);
      points.push(`Key stars: ${starNames.join(", ")}`);
    }
  }

  return points;
}

/**
 * 오행/십성 기반 추천 산업 및 투자 스타일 생성
 * 사주의 용신과 주요 십성을 기반으로 맞춤 추천 생성
 */
function generateCareerWealthRecommendations(
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): { industries: string[]; investmentStyles: string[]; careerTypes: string[] } {
  const industries: string[] = [];
  const investmentStyles: string[] = [];
  const careerTypes: string[] = [];

  // 용신(用神) 기반 추천 산업 - 가장 중요
  const yongShin = chart.yongShin;
  if (yongShin && ELEMENT_KEYWORDS[yongShin as Element]) {
    const elementKeywords = ELEMENT_KEYWORDS[yongShin as Element];
    industries.push(...elementKeywords.modernIndustries.slice(0, 3));
    investmentStyles.push(...elementKeywords.investmentStyles.slice(0, 2));
  }

  // 강한 오행 기반 추천 (용신이 없을 경우 보조)
  const dominantElements = chart.dominantElements || [];
  for (const element of dominantElements.slice(0, 1)) {
    if (ELEMENT_KEYWORDS[element as Element]) {
      const elementKeywords = ELEMENT_KEYWORDS[element as Element];
      // 이미 추가된 것 제외하고 추가
      const newIndustries = elementKeywords.modernIndustries.filter(i => !industries.includes(i));
      industries.push(...newIndustries.slice(0, 2));
    }
  }

  // 주요 십성 기반 직업군 추천
  const dominantTenGods = chart.dominantTenGods.map(t => t.tenGod);
  for (const tenGod of dominantTenGods.slice(0, 2)) {
    if (TEN_GOD_KEYWORDS[tenGod as TenGod]) {
      const tenGodKeywords = TEN_GOD_KEYWORDS[tenGod as TenGod];
      careerTypes.push(...tenGodKeywords.careerTypes.slice(0, 2));
    }
  }

  return {
    industries: Array.from(new Set(industries)).slice(0, 5),
    investmentStyles: Array.from(new Set(investmentStyles)).slice(0, 3),
    careerTypes: Array.from(new Set(careerTypes)).slice(0, 4),
  };
}

/**
 * 사주 기반 재물/직업 조언 섹션 생성
 */
function generateCareerWealthAdviceSection(
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string {
  const recommendations = generateCareerWealthRecommendations(chart, locale);
  const yongShin = chart.yongShin;
  const dominantTenGods = chart.dominantTenGods.map(t => t.tenGod);

  if (locale === "ko") {
    let section = `
### 💼 사주 기반 재물/직업 조언 (매우 중요!)

**이 분에게 맞는 산업/분야**:
- 용신(${yongShin || "분석 필요"}) 기반 추천 산업: ${recommendations.industries.join(", ") || "다양한 분야"}
- 적합 직업 유형: ${recommendations.careerTypes.join(", ") || "다양한 직업"}

**투자 스타일**:
- 이 분의 사주에 맞는 투자 방식: ${recommendations.investmentStyles.join(", ") || "안정적 투자"}

**중요 지침**:
- 재물이나 투자 이야기가 나오면, 절대로 "AI가 유망하다" 같은 뻔한 답변 금지
- 반드시 이 분의 용신(${yongShin || "오행"})과 십성(${dominantTenGods.slice(0, 2).join(", ") || "분석"})에 맞는 산업을 추천하세요
- 예: 용신이 木이면 ESG/바이오/헬스케어, 火면 AI/반도체/메타버스, 土면 부동산/인프라, 金이면 핀테크/로봇, 水면 글로벌 이커머스/물류
`;

    // 십성별 구체적 조언 추가
    if (dominantTenGods.includes("pyeonjae") || dominantTenGods.includes("gebjae")) {
      section += `- 편재/겁재가 강하므로: 적극적 투자 성향, 스타트업/성장주 관심 가능하나 리스크 관리 필수\n`;
    }
    if (dominantTenGods.includes("jeongjae") || dominantTenGods.includes("siksin")) {
      section += `- 정재/식신이 강하므로: 안정적 투자 선호, 배당주/채권/부동산 추천\n`;
    }
    if (dominantTenGods.includes("sanggwan")) {
      section += `- 상관이 강하므로: 창의적 분야, 콘텐츠/예술/미디어 관련 투자 고려\n`;
    }
    if (dominantTenGods.includes("jeonggwan") || dominantTenGods.includes("pyeongwan")) {
      section += `- 관성이 강하므로: 대기업/공기업/안정적 직장 선호, 우량주/인덱스 펀드 추천\n`;
    }

    return section;
  } else {
    let section = `
### 💼 Saju-Based Career/Wealth Advice (Very Important!)

**Industries Suited for This Person**:
- Based on Yongsin (${yongShin || "needs analysis"}): ${recommendations.industries.join(", ") || "various fields"}
- Suitable Career Types: ${recommendations.careerTypes.join(", ") || "various careers"}

**Investment Style**:
- Investment approaches for this chart: ${recommendations.investmentStyles.join(", ") || "stable investments"}

**Important Guidelines**:
- When discussing money or investments, NEVER give generic answers like "AI is promising"
- ALWAYS recommend industries based on their Yongsin (${yongShin || "element"}) and Ten Gods
- Example: Wood → ESG/Bio/Healthcare, Fire → AI/Semiconductor, Earth → Real Estate, Metal → Fintech/Robotics, Water → Global E-commerce
`;

    return section;
  }
}

/**
 * 시스템 프롬프트 추가 문구 생성
 */
function generateSystemPromptAddition(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  recommendedTopics: string[],
  avoidTopics: string[],
  lifeExperiences: string[],
  pastEvents: string[],
  futureDirection: string[],
  locale: "ko" | "en"
): string {
  if (locale === "ko") {
    // 2단계: 삶의 경험 섹션 생성
    const lifeExperienceSection = lifeExperiences.length > 0
      ? `
### 🔮 과거 삶의 경험 (2단계: 이렇게 살아오셨을 겁니다)
${lifeExperiences.map(exp => `- "${exp}"`).join("\n")}
`
      : "";

    // 3단계: 과거 사건 섹션 생성
    const pastEventSection = pastEvents.length > 0
      ? `
### 📖 과거 사건/고난 (3단계: 이런 일들이 있으셨을 겁니다)
${pastEvents.map(event => `- "${event}"`).join("\n")}
`
      : "";

    // 4단계: 미래 방향 섹션 생성
    const futureDirectionSection = futureDirection.length > 0
      ? `
### 🌟 미래 방향 (4단계: 앞으로 이렇게 나아가세요)
${futureDirection.map(advice => `- "${advice}"`).join("\n")}
`
      : "";

    return `
## 초개인화 컨텍스트

### 현재 시점
${temporal.temporalContext}

### 이 분의 프로필 (1단계: 사주 특성)
${age.ageContext}

${chart.chartContext}
${lifeExperienceSection}${pastEventSection}${futureDirectionSection}
### 이번 상담에서 다룰 주제
- 추천: ${recommendedTopics.slice(0, 5).join(", ")}
- 피해야 할 것: ${avoidTopics.slice(0, 3).join(", ")}

### 건강 관련 조언
${chart.healthFlags.recommendations.slice(0, 2).join("\n")}

### 시기별 조언
${temporal.timingAdvice.join("\n")}

### 🎯 대화 플로우 가이드 (매우 중요!)
**상담 시 아래 흐름을 자연스럽게 따라가세요:**
1. **사주 특성 설명** → "당신의 사주를 보니..."
2. **과거 경험 공감** → "그래서 이렇게 살아오셨을 거예요... 맞으시죠?"
3. **과거 사건 추론** → "이런 일들이 있으셨을 겁니다..."
4. **미래 방향 제시** → "그러니까 앞으로는..."

**활용 팁**:
- 위 내용을 그대로 읽지 말고, 대화 중 자연스럽게 풀어서 말하세요
- "~하셨던 적 있으시죠?", "~하셨을 거예요" 형태의 열린 표현 사용
- 너무 구체적인 숫자나 시점은 피하고, 공감을 이끌어내세요
- 마치 40년 경력의 역술가처럼 이 분의 상황을 꿰뚫어 보는 듯이 조언하세요

### 중요 지침
- 현재가 ${temporal.yearlyPillar.description}의 해임을 기억하세요
- ${age.ageGroup}의 관심사와 고민을 고려하세요
- 다음 주제는 피하세요: ${avoidTopics.slice(0, 3).join(", ")}

${generateCareerWealthAdviceSection(chart, locale)}
`;
  } else {
    // 2단계: Life experience section in English
    const lifeExperienceSection = lifeExperiences.length > 0
      ? `
### 🔮 Past Life Experiences (Step 2: How You've Lived)
${lifeExperiences.map(exp => `- "${exp}"`).join("\n")}
`
      : "";

    // 3단계: Past events section
    const pastEventSection = pastEvents.length > 0
      ? `
### 📖 Past Events/Challenges (Step 3: What You've Been Through)
${pastEvents.map(event => `- "${event}"`).join("\n")}
`
      : "";

    // 4단계: Future direction section
    const futureDirectionSection = futureDirection.length > 0
      ? `
### 🌟 Future Direction (Step 4: How to Move Forward)
${futureDirection.map(advice => `- "${advice}"`).join("\n")}
`
      : "";

    return `
## Hyper-Personalization Context

### Current Moment
${temporal.temporalContext}

### This Person's Profile (Step 1: Saju Characteristics)
${age.ageContext}

${chart.chartContext}
${lifeExperienceSection}${pastEventSection}${futureDirectionSection}
### Topics for This Session
- Recommended: ${recommendedTopics.slice(0, 5).join(", ")}
- Avoid: ${avoidTopics.slice(0, 3).join(", ")}

### Health Advice
${chart.healthFlags.recommendations.slice(0, 2).join("\n")}

### Timely Advice
${temporal.timingAdvice.join("\n")}

### 🎯 Conversation Flow Guide (Very Important!)
**Follow this natural flow during consultation:**
1. **Explain Saju characteristics** → "Looking at your saju..."
2. **Empathize with past experiences** → "So you've probably lived like this... right?"
3. **Infer past events** → "You've probably been through things like..."
4. **Present future direction** → "So going forward..."

**Tips**:
- Don't read these directly - weave them naturally into conversation
- Use open expressions like "You've probably...", "Haven't you?"
- Avoid specific numbers or dates, focus on creating empathy
- Advise as if you're a fortune teller with 40 years of experience

### Important Guidelines
- Remember this is the year of ${temporal.yearlyPillar.description}
- Consider the interests and concerns of ${age.ageGroup}
- Avoid these topics: ${avoidTopics.slice(0, 3).join(", ")}

${generateCareerWealthAdviceSection(chart, locale)}
`;
  }
}

/**
 * Google Grounding 검색 쿼리 제안
 */
function suggestSearchQueries(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  userQuery: string | undefined,
  locale: "ko" | "en"
): string[] {
  const queries: string[] = [];

  if (locale === "ko") {
    // 기본 쿼리
    queries.push(`${age.ageGroup} ${temporal.yearlyPillar.description} 운세`);

    // 관심사 기반 쿼리
    if (chart.personalizationFlags.emphasizeCareer) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()}년 직업운 이직`);
    }
    if (chart.personalizationFlags.emphasizeWealth) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()}년 재테크 투자 트렌드`);
    }
    if (chart.healthFlags.watchAreas.length > 0) {
      queries.push(`${age.ageGroup} ${chart.healthFlags.watchAreas[0]} 건강관리`);
    }

    // 사용자 쿼리 기반
    if (userQuery) {
      queries.push(`${age.ageGroup} ${userQuery} ${new Date().getFullYear()}년`);
    }
  } else {
    queries.push(`${age.ageGroup} ${temporal.yearlyPillar.description} fortune`);

    if (chart.personalizationFlags.emphasizeCareer) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()} career trends`);
    }
    if (chart.personalizationFlags.emphasizeWealth) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()} investment trends`);
    }
    if (chart.healthFlags.watchAreas.length > 0) {
      queries.push(`${age.ageGroup} ${chart.healthFlags.watchAreas[0]} health tips`);
    }

    if (userQuery) {
      queries.push(`${age.ageGroup} ${userQuery} ${new Date().getFullYear()}`);
    }
  }

  return Array.from(new Set(queries));
}

/**
 * Context Orchestrator 메인 함수
 */
export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const { temporal, age, chart, userQuery, locale } = input;

  // 추천 토픽
  const recommendedTopics = determineRecommendedTopics(temporal, age, chart, locale);

  // 피해야 할 토픽
  const avoidTopics = determineAvoidTopics(age, chart, locale);

  // 개인화 포인트
  const personalizationPoints = generatePersonalizationPoints(temporal, age, chart, locale);

  // 시기별 조언
  const timingAdvice = temporal.timingAdvice;

  // 2단계: 삶의 경험 추론 생성 (콜드 리딩 스타일)
  const lifeExperiences = generateLifeExperienceInferences(age, chart, locale);

  // 3단계: 과거 사건/고난 추론 생성
  const pastEvents = generatePastEventInferences(age, chart, locale);

  // 4단계: 미래 방향 제시 생성
  const futureDirection = generateFutureDirectionAdvice(temporal, age, chart, locale);

  // 시스템 프롬프트 추가 문구
  const systemPromptAddition = generateSystemPromptAddition(
    temporal,
    age,
    chart,
    recommendedTopics,
    avoidTopics,
    lifeExperiences,
    pastEvents,
    futureDirection,
    locale
  );

  // 검색 쿼리 제안
  const suggestedSearchQueries = suggestSearchQueries(temporal, age, chart, userQuery, locale);

  return {
    systemPromptAddition,
    recommendedTopics,
    avoidTopics,
    personalizationPoints,
    timingAdvice,
    suggestedSearchQueries
  };
}

export default runOrchestrator;
