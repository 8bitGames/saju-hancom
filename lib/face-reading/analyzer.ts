/**
 * 관상 분석기
 * 실제 AI 분석 전 데모용 분석 로직
 */

import type {
  FaceReadingResult,
  FaceReadingGrade,
  FaceShape,
  FaceShapeType,
  ForeheadAnalysis,
  EyeAnalysis,
  NoseAnalysis,
  MouthAnalysis,
  EarAnalysis,
} from "./types";

// 얼굴형 데이터
const FACE_SHAPES: Record<FaceShapeType, Omit<FaceShape, "type">> = {
  oval: {
    koreanName: "계란형",
    description: "이상적인 얼굴형으로 균형잡힌 인상을 줍니다.",
    characteristics: ["조화로운 이미지", "다양한 스타일 소화", "첫인상이 좋음"],
  },
  round: {
    koreanName: "둥근형",
    description: "친근하고 복스러운 인상을 주는 얼굴형입니다.",
    characteristics: ["친근한 이미지", "복을 부르는 상", "사교성이 좋음"],
  },
  square: {
    koreanName: "사각형",
    description: "강인하고 의지가 강한 인상을 줍니다.",
    characteristics: ["리더십 있음", "의지가 강함", "신뢰감을 줌"],
  },
  heart: {
    koreanName: "하트형",
    description: "지적이고 예술적인 감각이 뛰어난 상입니다.",
    characteristics: ["지적인 이미지", "예술적 감각", "창의력이 뛰어남"],
  },
  long: {
    koreanName: "긴형",
    description: "품위있고 고상한 인상을 주는 얼굴형입니다.",
    characteristics: ["품위 있음", "섬세함", "귀족적 인상"],
  },
  diamond: {
    koreanName: "다이아몬드형",
    description: "개성이 강하고 독특한 매력이 있는 상입니다.",
    characteristics: ["개성이 강함", "독특한 매력", "카리스마 있음"],
  },
};

// 이마 분석 데이터
const FOREHEAD_TYPES: Record<string, Omit<ForeheadAnalysis, "type" | "score">> = {
  wide: {
    koreanName: "넓은 이마",
    description: "지혜롭고 총명한 상입니다. 학문이나 예술 분야에서 두각을 나타냅니다.",
    fortune: "초년운이 좋고, 학업이나 시험에서 좋은 성과를 거둘 수 있습니다.",
  },
  narrow: {
    koreanName: "좁은 이마",
    description: "실용적이고 현실적인 성향입니다.",
    fortune: "중년 이후 운이 트이며, 꾸준한 노력으로 성공합니다.",
  },
  high: {
    koreanName: "높은 이마",
    description: "야망이 크고 이상이 높습니다.",
    fortune: "큰 뜻을 품고 높은 목표를 향해 나아갈 수 있습니다.",
  },
  low: {
    koreanName: "낮은 이마",
    description: "인내심이 강하고 착실합니다.",
    fortune: "차근차근 쌓아가는 것에 강점이 있습니다.",
  },
  balanced: {
    koreanName: "균형잡힌 이마",
    description: "조화로운 사고와 안정적인 성품을 가집니다.",
    fortune: "전체적으로 균형 잡힌 운세를 가집니다.",
  },
};

// 눈 분석 데이터
const EYE_TYPES: Record<string, Omit<EyeAnalysis, "type" | "score">> = {
  phoenix: {
    koreanName: "봉황안 (鳳眼)",
    description: "눈꼬리가 올라간 형태로, 지혜롭고 날카로운 판단력을 가집니다.",
    fortune: "귀인의 도움으로 성공하며, 사회적 지위가 높아집니다.",
  },
  dragon: {
    koreanName: "용안 (龍眼)",
    description: "크고 위엄있는 눈으로, 카리스마와 리더십이 뛰어납니다.",
    fortune: "권력과 명예를 얻을 수 있는 귀한 상입니다.",
  },
  round: {
    koreanName: "둥근 눈",
    description: "순수하고 호기심이 많으며, 감성이 풍부합니다.",
    fortune: "예술적 재능이 있고, 좋은 인연을 많이 만납니다.",
  },
  almond: {
    koreanName: "아몬드형 눈",
    description: "매력적이고 이성에게 인기가 많습니다.",
    fortune: "연애운과 대인관계가 좋습니다.",
  },
  narrow: {
    koreanName: "가는 눈",
    description: "신중하고 깊은 생각을 하는 성향입니다.",
    fortune: "지략이 뛰어나 어려운 일도 잘 해결합니다.",
  },
  wide: {
    koreanName: "넓은 눈",
    description: "시야가 넓고 대범한 성격입니다.",
    fortune: "큰 그림을 그리며 큰 일을 이룹니다.",
  },
};

// 코 분석 데이터
const NOSE_TYPES: Record<string, Omit<NoseAnalysis, "type" | "score">> = {
  straight: {
    koreanName: "곧은 코",
    description: "정직하고 원칙을 중시하는 성격입니다.",
    fortune: "신뢰를 바탕으로 한 사업이나 직장에서 성공합니다.",
  },
  aquiline: {
    koreanName: "매부리코",
    description: "의지가 강하고 추진력이 있습니다.",
    fortune: "사업가 기질이 있으며 재물복이 있습니다.",
  },
  button: {
    koreanName: "낮은 코",
    description: "친근하고 소탈한 성격입니다.",
    fortune: "주변 사람들의 도움으로 복을 받습니다.",
  },
  wide: {
    koreanName: "넓은 코",
    description: "재물 복이 있고 안정적인 삶을 삽니다.",
    fortune: "중년 이후 재물운이 크게 트입니다.",
  },
  pointed: {
    koreanName: "뾰족한 코",
    description: "예민하고 섬세한 감각을 가집니다.",
    fortune: "전문 분야에서 두각을 나타냅니다.",
  },
  balanced: {
    koreanName: "균형잡힌 코",
    description: "조화로운 성품과 안정적인 재운을 가집니다.",
    fortune: "꾸준한 재물 운과 좋은 건강운을 가집니다.",
  },
};

// 입 분석 데이터
const MOUTH_TYPES: Record<string, Omit<MouthAnalysis, "type" | "score">> = {
  full: {
    koreanName: "두꺼운 입술",
    description: "정이 많고 애정이 깊습니다.",
    fortune: "사랑과 가정에서 행복을 찾습니다.",
  },
  thin: {
    koreanName: "얇은 입술",
    description: "이성적이고 논리적입니다.",
    fortune: "전문직이나 분석이 필요한 분야에서 성공합니다.",
  },
  wide: {
    koreanName: "넓은 입",
    description: "대범하고 포용력이 있습니다.",
    fortune: "리더로서 많은 사람을 이끄는 역할을 합니다.",
  },
  small: {
    koreanName: "작은 입",
    description: "섬세하고 조심스러운 성격입니다.",
    fortune: "꼼꼼함이 필요한 일에서 성공합니다.",
  },
  balanced: {
    koreanName: "균형잡힌 입",
    description: "말솜씨가 좋고 대인관계가 원만합니다.",
    fortune: "좋은 인연을 많이 만나고 복이 들어옵니다.",
  },
};

// 귀 분석 데이터
const EAR_TYPES: Record<string, Omit<EarAnalysis, "type" | "score">> = {
  large: {
    koreanName: "큰 귀",
    description: "복이 많고 장수할 상입니다.",
    fortune: "재물복과 건강운이 좋습니다.",
  },
  small: {
    koreanName: "작은 귀",
    description: "섬세하고 예민한 감각을 가집니다.",
    fortune: "예술적 재능으로 성공할 수 있습니다.",
  },
  attached: {
    koreanName: "붙은 귀",
    description: "현실적이고 실용적인 성향입니다.",
    fortune: "안정적인 직장생활에서 성공합니다.",
  },
  detached: {
    koreanName: "떨어진 귀",
    description: "독립적이고 개성이 강합니다.",
    fortune: "자유로운 직업이나 창업에서 성공합니다.",
  },
  balanced: {
    koreanName: "균형잡힌 귀",
    description: "지혜롭고 분별력이 있습니다.",
    fortune: "어떤 상황에서도 좋은 판단을 합니다.",
  },
};

/**
 * 랜덤 점수 생성 (최소값 보장)
 */
function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 배열에서 랜덤 선택
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 등급 결정
 */
function getGrade(score: number): { grade: FaceReadingGrade; text: string } {
  if (score >= 85) return { grade: "excellent", text: "대길 (大吉)" };
  if (score >= 70) return { grade: "good", text: "길 (吉)" };
  if (score >= 55) return { grade: "normal", text: "보통 (普通)" };
  if (score >= 40) return { grade: "caution", text: "주의 (注意)" };
  return { grade: "challenging", text: "노력 필요 (努力)" };
}

/**
 * 관상 분석 실행 (데모)
 */
export function analyzeFace(gender: "male" | "female"): FaceReadingResult {
  // 얼굴형 선택
  const faceShapeTypes: FaceShapeType[] = ["oval", "round", "square", "heart", "long", "diamond"];
  const selectedFaceShape = randomChoice(faceShapeTypes);
  const faceShape: FaceShape = {
    type: selectedFaceShape,
    ...FACE_SHAPES[selectedFaceShape],
  };

  // 이마 분석
  const foreheadTypes = ["wide", "narrow", "high", "low", "balanced"] as const;
  const selectedForehead = randomChoice([...foreheadTypes]);
  const forehead: ForeheadAnalysis = {
    type: selectedForehead,
    score: randomScore(60, 95),
    ...FOREHEAD_TYPES[selectedForehead],
  };

  // 눈 분석
  const eyeTypes = ["phoenix", "dragon", "round", "almond", "narrow", "wide"] as const;
  const selectedEye = randomChoice([...eyeTypes]);
  const eyes: EyeAnalysis = {
    type: selectedEye,
    score: randomScore(60, 95),
    ...EYE_TYPES[selectedEye],
  };

  // 코 분석
  const noseTypes = ["straight", "aquiline", "button", "wide", "pointed", "balanced"] as const;
  const selectedNose = randomChoice([...noseTypes]);
  const nose: NoseAnalysis = {
    type: selectedNose,
    score: randomScore(60, 95),
    ...NOSE_TYPES[selectedNose],
  };

  // 입 분석
  const mouthTypes = ["full", "thin", "wide", "small", "balanced"] as const;
  const selectedMouth = randomChoice([...mouthTypes]);
  const mouth: MouthAnalysis = {
    type: selectedMouth,
    score: randomScore(60, 95),
    ...MOUTH_TYPES[selectedMouth],
  };

  // 귀 분석
  const earTypes = ["large", "small", "attached", "detached", "balanced"] as const;
  const selectedEar = randomChoice([...earTypes]);
  const ears: EarAnalysis = {
    type: selectedEar,
    score: randomScore(60, 95),
    ...EAR_TYPES[selectedEar],
  };

  // 운세 영역 점수
  const fortuneAreas = {
    wealth: {
      score: randomScore(55, 95),
      description: randomChoice([
        "재물을 모으는 능력이 뛰어납니다.",
        "중년 이후 재물운이 크게 상승합니다.",
        "꾸준히 모으는 재물이 큰 복이 됩니다.",
        "투자보다는 저축이 유리합니다.",
      ]),
    },
    career: {
      score: randomScore(55, 95),
      description: randomChoice([
        "리더십이 있어 높은 자리에 오를 수 있습니다.",
        "전문 분야에서 인정받을 상입니다.",
        "창업보다는 조직생활이 유리합니다.",
        "여러 분야에서 능력을 발휘할 수 있습니다.",
      ]),
    },
    relationship: {
      score: randomScore(55, 95),
      description: randomChoice([
        "귀인을 많이 만나 도움을 받습니다.",
        "대인관계가 원만하여 인기가 많습니다.",
        "신뢰를 쌓으면 좋은 인연이 찾아옵니다.",
        "진심을 보이면 좋은 관계를 맺습니다.",
      ]),
    },
    health: {
      score: randomScore(55, 95),
      description: randomChoice([
        "기본적으로 건강한 체질입니다.",
        "스트레스 관리가 중요합니다.",
        "규칙적인 생활이 건강의 비결입니다.",
        "운동을 통해 건강을 유지하세요.",
      ]),
    },
    love: {
      score: randomScore(55, 95),
      description: randomChoice([
        "진실된 사랑을 만날 수 있는 상입니다.",
        "이성에게 매력적으로 보입니다.",
        "인연이 많아 좋은 배우자를 만납니다.",
        "한 번 사랑하면 오래가는 성향입니다.",
      ]),
    },
  };

  // 전체 점수 계산
  const avgFeatureScore = (forehead.score + eyes.score + nose.score + mouth.score + ears.score) / 5;
  const avgFortuneScore = (
    fortuneAreas.wealth.score +
    fortuneAreas.career.score +
    fortuneAreas.relationship.score +
    fortuneAreas.health.score +
    fortuneAreas.love.score
  ) / 5;
  const overallScore = Math.round((avgFeatureScore + avgFortuneScore) / 2);

  const { grade, text: gradeText } = getGrade(overallScore);

  // 강점과 조언
  const strengths: string[] = [];
  const advice: string[] = [];

  if (forehead.score >= 80) strengths.push(`${forehead.koreanName}로 지혜가 뛰어납니다.`);
  if (eyes.score >= 80) strengths.push(`${eyes.koreanName}로 통찰력이 있습니다.`);
  if (nose.score >= 80) strengths.push(`${nose.koreanName}로 재물운이 좋습니다.`);
  if (mouth.score >= 80) strengths.push(`${mouth.koreanName}로 인복이 있습니다.`);
  if (ears.score >= 80) strengths.push(`${ears.koreanName}로 복이 많습니다.`);

  if (strengths.length === 0) {
    strengths.push("전체적으로 균형 잡힌 관상입니다.");
    strengths.push("꾸준한 노력으로 운을 높일 수 있습니다.");
  }

  advice.push("밝은 표정을 유지하면 운이 상승합니다.");
  advice.push("긍정적인 마음가짐이 좋은 기운을 불러옵니다.");

  if (fortuneAreas.wealth.score < 70) {
    advice.push("재물을 모으려면 절약 습관이 중요합니다.");
  }
  if (fortuneAreas.relationship.score < 70) {
    advice.push("먼저 다가가는 자세가 좋은 인연을 만듭니다.");
  }

  // 행운의 요소
  const luckyElements = [
    randomChoice(["파란색", "초록색", "빨간색", "노란색", "흰색"]),
    randomChoice(["동쪽", "서쪽", "남쪽", "북쪽"]),
    randomChoice(["3", "7", "8", "9"]) + "번",
  ];

  return {
    overallScore,
    overallGrade: grade,
    gradeText,
    faceShape,
    features: {
      forehead,
      eyes,
      nose,
      mouth,
      ears,
    },
    fortuneAreas,
    strengths,
    advice,
    luckyElements,
  };
}
