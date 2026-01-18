/**
 * 기본 분석 탭용 상세 설명 데이터
 * - 일간(dayMaster): 사주의 중심, 나 자신
 * - 십성(tenGods): 일간과의 관계
 * - 신살(stars): 특별한 기운
 * - 운세(fortune): 대운/세운
 *
 * 이 데이터는 "사주 구성 설명"에 사용됩니다.
 * 종합 분석과 달리 교육적/설명적 콘텐츠입니다.
 */

import type { Gan, Element, TenGod } from "./types";

// ============================================================================
// 일간(日干) 상세 설명 데이터
// ============================================================================

export interface DayMasterDetailedInfo {
  /** 천간 */
  gan: Gan;
  /** 한글 이름 */
  korean: string;
  /** 한자 이름 */
  hanja: string;
  /** 오행 */
  element: Element;
  /** 음양 */
  yinYang: "양" | "음";
  /** 자연물 비유 */
  naturalSymbol: string;
  /** 짧은 설명 */
  shortDescription: string;
  /** 상세 설명 (여러 문단) */
  detailedDescription: string[];
  /** 핵심 특성 키워드 */
  keywords: string[];
  /** 강점 */
  strengths: string[];
  /** 약점/주의점 */
  weaknesses: string[];
  /** 다른 오행과의 관계 */
  elementRelations: {
    produces: { element: Element; description: string };
    controls: { element: Element; description: string };
    producedBy: { element: Element; description: string };
    controlledBy: { element: Element; description: string };
  };
  /** 궁합 좋은 일간 */
  compatibleWith: Gan[];
  /** 대표 직업/분야 */
  suitableFields: string[];
  /** 🆕 v1.4: 시각적 메타포 */
  visualMetaphor: {
    emoji: string;
    color: string;
    colorHex: string;
    icon: string;
  };
  /** 🆕 v1.4: 같은 오행 내 비교 */
  comparison: {
    counterpart: Gan;
    difference: {
      ko: string;
      en: string;
    };
  };
}

export const DAY_MASTER_DETAILED: Record<Gan, DayMasterDetailedInfo> = {
  "甲": {
    gan: "甲",
    korean: "갑목",
    hanja: "甲木",
    element: "wood",
    yinYang: "양",
    naturalSymbol: "큰 나무, 대들보, 소나무",
    shortDescription: "하늘을 향해 곧게 뻗는 큰 나무의 기운",
    detailedDescription: [
      "갑목(甲木)은 양(陽)의 목(木) 기운으로, 큰 나무나 대들보처럼 곧고 강직한 성품을 나타냅니다.",
      "하늘을 향해 곧게 뻗어 올라가는 나무처럼, 목표를 향해 꾸준히 나아가는 추진력이 있습니다.",
      "리더십이 강하고 정의감이 있어 주변 사람들을 이끄는 역할을 잘 수행합니다.",
      "다만 너무 곧은 성격이 때로는 융통성 없어 보일 수 있으니, 유연함을 기르면 좋습니다.",
    ],
    keywords: ["리더십", "진취성", "정직함", "강직함", "추진력"],
    strengths: [
      "뚜렷한 목표 의식과 추진력",
      "정의롭고 올곧은 성품",
      "리더십과 책임감",
      "성장과 발전에 대한 열망",
    ],
    weaknesses: [
      "융통성이 부족할 수 있음",
      "고집이 셀 수 있음",
      "남의 의견을 받아들이기 어려움",
      "타협을 잘 못함",
    ],
    elementRelations: {
      produces: { element: "fire", description: "화(火)를 생하여 열정과 에너지를 발산합니다" },
      controls: { element: "earth", description: "토(土)를 극하여 안정과 기반을 다집니다" },
      producedBy: { element: "water", description: "수(水)의 생을 받아 지혜와 영감을 얻습니다" },
      controlledBy: { element: "metal", description: "금(金)의 극을 받아 절제와 다듬어짐이 필요합니다" },
    },
    compatibleWith: ["己", "戊", "癸"],
    suitableFields: ["경영", "정치", "교육", "법조계", "건축", "임업"],
    visualMetaphor: {
      emoji: "",
      color: "진녹색 (Deep Green)",
      colorHex: "#228B22",
      icon: "tree-deciduous",
    },
    comparison: {
      counterpart: "乙",
      difference: {
        ko: "甲木은 큰 나무처럼 곧고 변하지 않는 반면, 乙木은 풀처럼 유연하게 환경에 적응합니다. 甲은 리더형, 乙은 적응형입니다.",
        en: "While Jia Wood is straight and unwavering like a big tree, Yi Wood adapts flexibly like grass. Jia is a leader type, Yi is an adapter type.",
      },
    },
  },
  "乙": {
    gan: "乙",
    korean: "을목",
    hanja: "乙木",
    element: "wood",
    yinYang: "음",
    naturalSymbol: "풀, 꽃, 덩굴",
    shortDescription: "유연하게 뻗어가는 풀과 꽃의 기운",
    detailedDescription: [
      "을목(乙木)은 음(陰)의 목(木) 기운으로, 풀이나 꽃처럼 유연하고 부드러운 성품을 나타냅니다.",
      "환경에 잘 적응하고, 어떤 상황에서도 살아남는 생명력이 강합니다.",
      "겉으로는 부드러워 보이지만 내면에는 강인한 의지가 있습니다.",
      "예술적 감각이 뛰어나고, 사람들과 잘 어울리는 친화력이 있습니다.",
    ],
    keywords: ["유연함", "적응력", "친화력", "예술성", "생명력"],
    strengths: [
      "뛰어난 적응력과 유연성",
      "부드러운 대인관계 능력",
      "예술적 감각",
      "강인한 생명력과 회복력",
    ],
    weaknesses: [
      "결단력이 부족할 수 있음",
      "의존적일 수 있음",
      "우유부단해 보일 수 있음",
      "자기주장이 약할 수 있음",
    ],
    elementRelations: {
      produces: { element: "fire", description: "화(火)를 생하여 따뜻함과 활력을 줍니다" },
      controls: { element: "earth", description: "토(土)를 극하여 변화와 성장을 이끕니다" },
      producedBy: { element: "water", description: "수(水)의 생을 받아 촉촉한 영감을 얻습니다" },
      controlledBy: { element: "metal", description: "금(金)의 극을 받아 정돈과 규율이 필요합니다" },
    },
    compatibleWith: ["庚", "辛", "壬"],
    suitableFields: ["예술", "디자인", "상담", "서비스업", "의료", "화훼"],
    visualMetaphor: {
      emoji: "",
      color: "연두색 (Light Green)",
      colorHex: "#90EE90",
      icon: "flower",
    },
    comparison: {
      counterpart: "甲",
      difference: {
        ko: "乙木은 풀과 꽃처럼 유연하고 환경에 적응하는 반면, 甲木은 큰 나무처럼 곧고 강직합니다. 乙은 적응형, 甲은 리더형입니다.",
        en: "While Yi Wood is flexible and adapts to environment like grass, Jia Wood is straight and strong like a big tree. Yi is an adapter type, Jia is a leader type.",
      },
    },
  },
  "丙": {
    gan: "丙",
    korean: "병화",
    hanja: "丙火",
    element: "fire",
    yinYang: "양",
    naturalSymbol: "태양, 큰 불",
    shortDescription: "세상을 밝히는 태양의 기운",
    detailedDescription: [
      "병화(丙火)는 양(陽)의 화(火) 기운으로, 태양처럼 밝고 따뜻한 성품을 나타냅니다.",
      "주변을 환하게 밝히는 존재감이 있어, 어디서든 주목받는 경향이 있습니다.",
      "열정적이고 적극적이며, 밝은 에너지로 주변 사람들에게 활력을 줍니다.",
      "다만 너무 강렬한 에너지가 때로는 주변을 지치게 할 수 있으니 조절이 필요합니다.",
    ],
    keywords: ["열정", "활력", "밝음", "리더십", "적극성"],
    strengths: [
      "밝고 긍정적인 에너지",
      "강한 추진력과 열정",
      "주변을 이끄는 카리스마",
      "명확한 표현력",
    ],
    weaknesses: [
      "성급할 수 있음",
      "지속력이 부족할 수 있음",
      "과욕을 부릴 수 있음",
      "감정 기복이 있을 수 있음",
    ],
    elementRelations: {
      produces: { element: "earth", description: "토(土)를 생하여 안정과 결실을 만듭니다" },
      controls: { element: "metal", description: "금(金)을 극하여 변화와 혁신을 이끕니다" },
      producedBy: { element: "wood", description: "목(木)의 생을 받아 성장과 확장의 에너지를 얻습니다" },
      controlledBy: { element: "water", description: "수(水)의 극을 받아 냉정함과 균형이 필요합니다" },
    },
    compatibleWith: ["辛", "壬", "癸"],
    suitableFields: ["방송", "연예", "마케팅", "정치", "에너지", "레저"],
    visualMetaphor: {
      emoji: "",
      color: "주황색 (Orange)",
      colorHex: "#FF8C00",
      icon: "sun",
    },
    comparison: {
      counterpart: "丁",
      difference: {
        ko: "丙火는 태양처럼 강렬하고 주목받는 반면, 丁火는 촛불처럼 은은하고 섬세합니다. 丙은 외향적 에너지, 丁은 내향적 따뜻함입니다.",
        en: "While Bing Fire is intense and attention-grabbing like the sun, Ding Fire is subtle and delicate like candlelight. Bing is outward energy, Ding is inward warmth.",
      },
    },
  },
  "丁": {
    gan: "丁",
    korean: "정화",
    hanja: "丁火",
    element: "fire",
    yinYang: "음",
    naturalSymbol: "촛불, 등불, 별빛",
    shortDescription: "어둠을 밝히는 따뜻한 촛불의 기운",
    detailedDescription: [
      "정화(丁火)는 음(陰)의 화(火) 기운으로, 촛불이나 등불처럼 은은하고 따뜻한 성품을 나타냅니다.",
      "조용히 주변을 밝히며, 섬세하고 감성적인 면이 있습니다.",
      "예술적 감각이 뛰어나고, 깊은 사고력을 가지고 있습니다.",
      "작지만 꾸준한 빛처럼, 묵묵히 자기 역할을 해내는 끈기가 있습니다.",
    ],
    keywords: ["섬세함", "따뜻함", "예술성", "사색", "끈기"],
    strengths: [
      "섬세하고 감성적인 감각",
      "깊은 사고력과 통찰력",
      "예술적 재능",
      "꾸준하고 성실함",
    ],
    weaknesses: [
      "소심해질 수 있음",
      "결정을 미룰 수 있음",
      "걱정이 많을 수 있음",
      "자신감이 부족할 수 있음",
    ],
    elementRelations: {
      produces: { element: "earth", description: "토(土)를 생하여 따뜻한 결실을 맺습니다" },
      controls: { element: "metal", description: "금(金)을 극하여 세밀한 변화를 이끕니다" },
      producedBy: { element: "wood", description: "목(木)의 생을 받아 창의적 영감을 얻습니다" },
      controlledBy: { element: "water", description: "수(水)의 극을 받아 감정 조절이 필요합니다" },
    },
    compatibleWith: ["壬", "癸", "庚"],
    suitableFields: ["문학", "예술", "요리", "심리상담", "종교", "연구"],
    visualMetaphor: {
      emoji: "",
      color: "붉은색 (Crimson)",
      colorHex: "#DC143C",
      icon: "flame",
    },
    comparison: {
      counterpart: "丙",
      difference: {
        ko: "丁火는 촛불처럼 은은하고 섬세한 반면, 丙火는 태양처럼 강렬하고 화려합니다. 丁은 내면의 불꽃, 丙은 바깥으로 발산하는 에너지입니다.",
        en: "While Ding Fire is subtle and delicate like candlelight, Bing Fire is intense and brilliant like the sun. Ding is inner flame, Bing is outward radiance.",
      },
    },
  },
  "戊": {
    gan: "戊",
    korean: "무토",
    hanja: "戊土",
    element: "earth",
    yinYang: "양",
    naturalSymbol: "산, 큰 언덕, 대지",
    shortDescription: "모든 것을 품는 큰 산의 기운",
    detailedDescription: [
      "무토(戊土)는 양(陽)의 토(土) 기운으로, 산이나 큰 언덕처럼 듬직하고 안정적인 성품을 나타냅니다.",
      "중심을 잡고 흔들리지 않는 신뢰감이 있어, 주변 사람들의 의지처가 됩니다.",
      "포용력이 크고 관대하며, 어떤 상황에서도 평정심을 유지합니다.",
      "다만 변화에 느리고 보수적일 수 있으니, 유연성을 기르면 좋습니다.",
    ],
    keywords: ["안정", "신뢰", "포용력", "중후함", "인내"],
    strengths: [
      "듬직하고 신뢰할 수 있음",
      "큰 포용력과 관대함",
      "흔들리지 않는 안정감",
      "인내심과 끈기",
    ],
    weaknesses: [
      "변화에 느림",
      "고집이 셀 수 있음",
      "답답해 보일 수 있음",
      "보수적일 수 있음",
    ],
    elementRelations: {
      produces: { element: "metal", description: "금(金)을 생하여 결실과 성과를 만듭니다" },
      controls: { element: "water", description: "수(水)를 극하여 방향과 틀을 잡습니다" },
      producedBy: { element: "fire", description: "화(火)의 생을 받아 열정과 활력을 얻습니다" },
      controlledBy: { element: "wood", description: "목(木)의 극을 받아 변화와 성장이 필요합니다" },
    },
    compatibleWith: ["癸", "甲", "乙"],
    suitableFields: ["부동산", "건설", "농업", "금융", "행정", "교육"],
    visualMetaphor: {
      emoji: "",
      color: "황토색 (Ochre)",
      colorHex: "#CC7722",
      icon: "mountain",
    },
    comparison: {
      counterpart: "己",
      difference: {
        ko: "戊土는 큰 산처럼 듬직하고 변하지 않는 반면, 己土는 논밭처럼 부드럽고 유연합니다. 戊는 고정된 중심, 己는 수용하는 대지입니다.",
        en: "While Wu Earth is steady and unchanging like a mountain, Ji Earth is soft and flexible like farmland. Wu is a fixed center, Ji is receptive ground.",
      },
    },
  },
  "己": {
    gan: "己",
    korean: "기토",
    hanja: "己土",
    element: "earth",
    yinYang: "음",
    naturalSymbol: "밭, 정원, 논",
    shortDescription: "만물을 키우는 기름진 땅의 기운",
    detailedDescription: [
      "기토(己土)는 음(陰)의 토(土) 기운으로, 밭이나 정원처럼 부드럽고 기름진 성품을 나타냅니다.",
      "모든 것을 받아들이고 키워내는 포용력이 있습니다.",
      "현실적이고 실용적이며, 세세한 것까지 잘 챙기는 꼼꼼함이 있습니다.",
      "겉으로는 부드럽지만 내면에는 단단한 중심이 있습니다.",
    ],
    keywords: ["포용", "현실감각", "꼼꼼함", "양육", "실용성"],
    strengths: [
      "세심하고 꼼꼼함",
      "현실적인 감각",
      "모든 것을 수용하는 포용력",
      "안정적인 관계 형성",
    ],
    weaknesses: [
      "우유부단할 수 있음",
      "걱정이 많을 수 있음",
      "자기주장이 약할 수 있음",
      "변화를 두려워할 수 있음",
    ],
    elementRelations: {
      produces: { element: "metal", description: "금(金)을 생하여 세밀한 결과물을 만듭니다" },
      controls: { element: "water", description: "수(水)를 극하여 감정을 다스립니다" },
      producedBy: { element: "fire", description: "화(火)의 생을 받아 따뜻한 에너지를 얻습니다" },
      controlledBy: { element: "wood", description: "목(木)의 극을 받아 변화의 자극이 필요합니다" },
    },
    compatibleWith: ["甲", "乙", "丙"],
    suitableFields: ["서비스업", "요식업", "농업", "유통", "회계", "의료"],
    visualMetaphor: {
      emoji: "",
      color: "베이지색 (Beige)",
      colorHex: "#D2B48C",
      icon: "leaf",
    },
    comparison: {
      counterpart: "戊",
      difference: {
        ko: "己土는 논밭처럼 부드럽고 모든 것을 수용하는 반면, 戊土는 산처럼 듬직하고 고정적입니다. 己는 섬세한 양육, 戊는 든든한 버팀목입니다.",
        en: "While Ji Earth is soft and receptive like farmland, Wu Earth is steady and fixed like a mountain. Ji is gentle nurturing, Wu is solid support.",
      },
    },
  },
  "庚": {
    gan: "庚",
    korean: "경금",
    hanja: "庚金",
    element: "metal",
    yinYang: "양",
    naturalSymbol: "강철, 바위, 칼",
    shortDescription: "단단하고 날카로운 강철의 기운",
    detailedDescription: [
      "경금(庚金)은 양(陽)의 금(金) 기운으로, 강철이나 바위처럼 단단하고 강인한 성품을 나타냅니다.",
      "결단력이 있고 과감하며, 한번 정한 것은 끝까지 밀고 나가는 추진력이 있습니다.",
      "정의감이 강하고, 불의를 보면 참지 못하는 성격입니다.",
      "다만 너무 강한 성격이 때로는 충돌을 일으킬 수 있으니 부드러움도 필요합니다.",
    ],
    keywords: ["결단력", "강인함", "정의감", "추진력", "의리"],
    strengths: [
      "강한 결단력과 추진력",
      "불의에 맞서는 용기",
      "의리와 신뢰",
      "명확한 판단력",
    ],
    weaknesses: [
      "너무 강해서 충돌이 있을 수 있음",
      "융통성이 부족할 수 있음",
      "감정 표현이 서투름",
      "고집이 셀 수 있음",
    ],
    elementRelations: {
      produces: { element: "water", description: "수(水)를 생하여 지혜와 유연함을 발산합니다" },
      controls: { element: "wood", description: "목(木)을 극하여 정리와 결단을 내립니다" },
      producedBy: { element: "earth", description: "토(土)의 생을 받아 안정과 기반을 얻습니다" },
      controlledBy: { element: "fire", description: "화(火)의 극을 받아 부드러운 변화가 필요합니다" },
    },
    compatibleWith: ["乙", "丁", "壬"],
    suitableFields: ["법조계", "군인", "경찰", "금융", "제조업", "스포츠"],
    visualMetaphor: {
      emoji: "",
      color: "은색 (Silver)",
      colorHex: "#C0C0C0",
      icon: "sword",
    },
    comparison: {
      counterpart: "辛",
      difference: {
        ko: "庚金은 강철처럼 단단하고 과감한 반면, 辛金은 보석처럼 섬세하고 예리합니다. 庚은 힘과 결단력, 辛은 정교함과 완벽주의입니다.",
        en: "While Geng Metal is hard and bold like steel, Xin Metal is delicate and sharp like gemstones. Geng is power and decisiveness, Xin is precision and perfectionism.",
      },
    },
  },
  "辛": {
    gan: "辛",
    korean: "신금",
    hanja: "辛金",
    element: "metal",
    yinYang: "음",
    naturalSymbol: "보석, 귀금속, 가위",
    shortDescription: "빛나고 예리한 보석의 기운",
    detailedDescription: [
      "신금(辛金)은 음(陰)의 금(金) 기운으로, 보석이나 귀금속처럼 섬세하고 예리한 성품을 나타냅니다.",
      "완벽주의적 성향이 있고, 아름다움을 추구합니다.",
      "예리한 판단력과 분석력이 있어 세밀한 일에 능합니다.",
      "외유내강형으로, 겉은 부드러워 보이지만 내면은 단단합니다.",
    ],
    keywords: ["예리함", "완벽주의", "심미안", "분석력", "세밀함"],
    strengths: [
      "예리한 분석력과 판단력",
      "아름다움에 대한 감각",
      "세밀하고 꼼꼼함",
      "품격과 자존심",
    ],
    weaknesses: [
      "예민하고 까다로울 수 있음",
      "완벽주의로 스트레스 받음",
      "비판적일 수 있음",
      "자존심이 강해 상처받기 쉬움",
    ],
    elementRelations: {
      produces: { element: "water", description: "수(水)를 생하여 섬세한 지혜를 발산합니다" },
      controls: { element: "wood", description: "목(木)을 극하여 정교한 정리를 합니다" },
      producedBy: { element: "earth", description: "토(土)의 생을 받아 안정된 기반을 얻습니다" },
      controlledBy: { element: "fire", description: "화(火)의 극을 받아 열정의 변화가 필요합니다" },
    },
    compatibleWith: ["丙", "丁", "壬"],
    suitableFields: ["패션", "보석", "금융", "의료", "미용", "정밀기술"],
    visualMetaphor: {
      emoji: "",
      color: "백금색 (Platinum)",
      colorHex: "#E5E4E2",
      icon: "gem",
    },
    comparison: {
      counterpart: "庚",
      difference: {
        ko: "辛金은 보석처럼 섬세하고 완벽을 추구하는 반면, 庚金은 강철처럼 힘 있고 과감합니다. 辛은 정교함과 미학, 庚은 힘과 결단력입니다.",
        en: "While Xin Metal is delicate and pursues perfection like gemstones, Geng Metal is powerful and bold like steel. Xin is precision and aesthetics, Geng is power and decisiveness.",
      },
    },
  },
  "壬": {
    gan: "壬",
    korean: "임수",
    hanja: "壬水",
    element: "water",
    yinYang: "양",
    naturalSymbol: "바다, 큰 강, 호수",
    shortDescription: "모든 것을 품는 큰 바다의 기운",
    detailedDescription: [
      "임수(壬水)는 양(陽)의 수(水) 기운으로, 바다나 큰 강처럼 넓고 깊은 성품을 나타냅니다.",
      "포용력이 크고 지혜로우며, 상황을 꿰뚫어 보는 통찰력이 있습니다.",
      "유연하게 흘러가면서도 어떤 장애물도 우회하는 적응력이 뛰어납니다.",
      "다만 방향을 잃으면 흩어지기 쉬우니, 중심을 잡는 것이 중요합니다.",
    ],
    keywords: ["지혜", "포용력", "유연함", "통찰력", "적응력"],
    strengths: [
      "깊은 지혜와 통찰력",
      "넓은 포용력",
      "뛰어난 적응력",
      "상황 판단 능력",
    ],
    weaknesses: [
      "결정이 느릴 수 있음",
      "감정 기복이 있을 수 있음",
      "방향을 잃기 쉬움",
      "우유부단해 보일 수 있음",
    ],
    elementRelations: {
      produces: { element: "wood", description: "목(木)을 생하여 성장과 창조를 돕습니다" },
      controls: { element: "fire", description: "화(火)를 극하여 열정을 조절합니다" },
      producedBy: { element: "metal", description: "금(金)의 생을 받아 명확한 방향을 얻습니다" },
      controlledBy: { element: "earth", description: "토(土)의 극을 받아 안정과 틀이 필요합니다" },
    },
    compatibleWith: ["丁", "戊", "辛"],
    suitableFields: ["학문", "연구", "컨설팅", "무역", "물류", "IT"],
    visualMetaphor: {
      emoji: "",
      color: "감청색 (Navy Blue)",
      colorHex: "#000080",
      icon: "waves",
    },
    comparison: {
      counterpart: "癸",
      difference: {
        ko: "壬水는 바다처럼 넓고 강력한 반면, 癸水는 비와 이슬처럼 섬세하고 촉촉합니다. 壬은 포용과 통찰, 癸는 감수성과 직관입니다.",
        en: "While Ren Water is vast and powerful like the ocean, Gui Water is delicate and moist like rain. Ren is encompassing wisdom, Gui is sensitivity and intuition.",
      },
    },
  },
  "癸": {
    gan: "癸",
    korean: "계수",
    hanja: "癸水",
    element: "water",
    yinYang: "음",
    naturalSymbol: "비, 이슬, 샘물",
    shortDescription: "만물을 적시는 촉촉한 비의 기운",
    detailedDescription: [
      "계수(癸水)는 음(陰)의 수(水) 기운으로, 비나 이슬처럼 촉촉하고 섬세한 성품을 나타냅니다.",
      "직관력이 뛰어나고 감수성이 풍부하며, 예술적 재능이 있습니다.",
      "조용히 스며들어 변화를 만들어내는 은근한 영향력이 있습니다.",
      "내면이 깊고 사색적이며, 영적인 감각이 발달해 있습니다.",
    ],
    keywords: ["직관", "감수성", "창의성", "섬세함", "영성"],
    strengths: [
      "뛰어난 직관력",
      "풍부한 감수성",
      "창의적 상상력",
      "섬세한 배려심",
    ],
    weaknesses: [
      "현실감이 부족할 수 있음",
      "우울해지기 쉬움",
      "의존적일 수 있음",
      "결정을 미룰 수 있음",
    ],
    elementRelations: {
      produces: { element: "wood", description: "목(木)을 생하여 생명과 성장을 돕습니다" },
      controls: { element: "fire", description: "화(火)를 극하여 감정을 다스립니다" },
      producedBy: { element: "metal", description: "금(金)의 생을 받아 명확한 지혜를 얻습니다" },
      controlledBy: { element: "earth", description: "토(土)의 극을 받아 현실적 기반이 필요합니다" },
    },
    compatibleWith: ["戊", "己", "丙"],
    suitableFields: ["예술", "종교", "심리학", "의료", "연구", "창작"],
    visualMetaphor: {
      emoji: "",
      color: "하늘색 (Sky Blue)",
      colorHex: "#87CEEB",
      icon: "droplet",
    },
    comparison: {
      counterpart: "壬",
      difference: {
        ko: "癸水는 비와 이슬처럼 섬세하고 감성적인 반면, 壬水는 바다처럼 넓고 깊습니다. 癸는 직관과 영성, 壬은 포용과 통찰입니다.",
        en: "While Gui Water is delicate and emotional like rain, Ren Water is vast and deep like the ocean. Gui is intuition and spirituality, Ren is encompassing wisdom.",
      },
    },
  },
};

// ============================================================================
// 일간 개념 설명 (What is DayMaster?)
// ============================================================================

export const DAY_MASTER_CONCEPT = {
  ko: {
    title: "일간(日干)이란?",
    definition:
      "일간은 사주팔자의 중심이 되는 글자로, '나 자신'을 나타냅니다. 태어난 날의 천간(天干)이며, 성격과 기질의 핵심을 보여줍니다.",
    explanation: [
      "사주팔자는 연주(年柱), 월주(月柱), 일주(日柱), 시주(時柱) 네 개의 기둥으로 이루어져 있습니다.",
      "이 중 일주의 천간을 '일간' 또는 '일주천간'이라고 부르며, 사주 분석의 출발점이 됩니다.",
      "모든 사주 해석은 일간을 중심으로 이루어지며, 다른 글자들과의 관계를 통해 운명을 풀이합니다.",
    ],
    importance: [
      "일간은 나의 본질적인 성격과 기질을 나타냅니다.",
      "다른 글자들과의 관계(십성)를 결정하는 기준점입니다.",
      "용신(用神)을 정하는 핵심 요소입니다.",
      "대운과 세운의 길흉을 판단하는 기준입니다.",
    ],
    tenStemsIntro:
      "천간은 甲(갑), 乙(을), 丙(병), 丁(정), 戊(무), 己(기), 庚(경), 辛(신), 壬(임), 癸(계) 10가지가 있으며, 각각 오행(목, 화, 토, 금, 수)과 음양의 특성을 가지고 있습니다.",
  },
  en: {
    title: "What is Day Master?",
    definition:
      "The Day Master is the central character of the Four Pillars, representing 'yourself'. It is the Heavenly Stem of your birth day and shows the core of your personality.",
    explanation: [
      "The Four Pillars consist of Year Pillar, Month Pillar, Day Pillar, and Hour Pillar.",
      "The Heavenly Stem of the Day Pillar is called 'Day Master' and is the starting point of Saju analysis.",
      "All interpretations are based on the Day Master and its relationships with other characters.",
    ],
    importance: [
      "Day Master represents your fundamental personality and temperament.",
      "It determines the relationships (Ten Gods) with other characters.",
      "It is the key factor in determining the Yong Shin (useful element).",
      "It is the standard for judging the fortune of major and annual luck cycles.",
    ],
    tenStemsIntro:
      "There are 10 Heavenly Stems, each with Five Elements (wood, fire, earth, metal, water) and Yin-Yang characteristics.",
  },
};

// ============================================================================
// 십성(十星) 상세 설명 데이터
// ============================================================================

export interface TenGodDetailedInfo {
  code: TenGod;
  korean: string;
  hanja: string;
  english: string;
  group: "비겁" | "식상" | "재성" | "관성" | "인성";
  groupDescription: string;
  shortDescription: string;
  detailedDescription: string[];
  keywords: string[];
  positiveTraits: string[];
  negativeTraits: string[];
  lifeAspects: {
    career: string;
    relationship: string;
    wealth: string;
  };
  /** 이 십성이 강할 때 */
  whenStrong: string;
  /** 이 십성이 약할 때 */
  whenWeak: string;
}

export const TEN_GOD_DETAILED: Record<TenGod, TenGodDetailedInfo> = {
  bijian: {
    code: "bijian",
    korean: "비견",
    hanja: "比肩",
    english: "Companion",
    group: "비겁",
    groupDescription: "나와 같은 오행으로, 경쟁과 협력의 에너지",
    shortDescription: "나와 어깨를 나란히 하는 존재, 형제/친구/경쟁자",
    detailedDescription: [
      "비견(比肩)은 '어깨를 나란히 한다'는 뜻으로, 나와 같은 오행이면서 같은 음양입니다.",
      "형제, 친구, 동료, 경쟁자를 의미하며, 자립심과 독립심을 나타냅니다.",
      "비견이 적당하면 협력과 경쟁을 통해 성장하지만, 과하면 충돌과 분쟁이 생길 수 있습니다.",
    ],
    keywords: ["독립심", "자립", "경쟁", "협력", "형제"],
    positiveTraits: ["자립심이 강함", "경쟁에서 성장", "협력 능력", "독자적 영역 구축"],
    negativeTraits: ["고집이 셀 수 있음", "협조가 어려울 수 있음", "재물 손실 가능성"],
    lifeAspects: {
      career: "독립적인 일, 동업, 프리랜서에 적합",
      relationship: "대등한 관계를 원함, 친구 같은 파트너",
      wealth: "혼자 버는 것이 유리, 공동 투자는 주의",
    },
    whenStrong: "독립심이 강하고 자기 길을 개척하지만, 타인과 충돌이 있을 수 있습니다.",
    whenWeak: "협력을 통해 성장하지만, 자기주장이 약해질 수 있습니다.",
  },
  gebjae: {
    code: "gebjae",
    korean: "겁재",
    hanja: "劫財",
    english: "Rob Wealth",
    group: "비겁",
    groupDescription: "나와 같은 오행으로, 경쟁과 협력의 에너지",
    shortDescription: "재물을 빼앗는 존재, 도전과 경쟁",
    detailedDescription: [
      "겁재(劫財)는 '재물을 빼앗는다'는 뜻으로, 나와 같은 오행이면서 다른 음양입니다.",
      "비견보다 더 적극적인 경쟁의 에너지를 나타내며, 도전정신이 강합니다.",
      "겁재가 있으면 승부욕이 강하고 적극적이지만, 손재수나 분쟁에 주의해야 합니다.",
    ],
    keywords: ["도전", "승부욕", "적극성", "경쟁", "손재"],
    positiveTraits: ["강한 승부욕", "적극적인 추진력", "도전정신", "사교성"],
    negativeTraits: ["충동적일 수 있음", "재물 손실 주의", "분쟁 가능성", "과소비 경향"],
    lifeAspects: {
      career: "경쟁이 치열한 분야, 영업, 스포츠",
      relationship: "열정적이지만 충돌 가능성",
      wealth: "들어오는 것도 많지만 나가는 것도 많음",
    },
    whenStrong: "적극적이고 도전적이지만, 재물 관리와 인간관계에 주의가 필요합니다.",
    whenWeak: "안정적이지만 도전정신이 약해질 수 있습니다.",
  },
  siksin: {
    code: "siksin",
    korean: "식신",
    hanja: "食神",
    english: "Eating God",
    group: "식상",
    groupDescription: "내가 생하는 오행으로, 표현과 창조의 에너지",
    shortDescription: "먹고 즐기는 복, 재능과 표현력",
    detailedDescription: [
      "식신(食神)은 '먹는 신'이라는 뜻으로, 내가 생하는 오행 중 같은 음양입니다.",
      "의식주의 복, 재능, 표현력, 자녀운을 나타냅니다.",
      "식신이 있으면 먹복이 있고, 예술적 재능과 표현력이 뛰어납니다.",
    ],
    keywords: ["재능", "표현력", "여유", "식복", "자녀"],
    positiveTraits: ["타고난 재능", "풍요로운 삶", "좋은 표현력", "낙천적 성격"],
    negativeTraits: ["게으를 수 있음", "현실에 안주", "추진력 부족", "과식 경향"],
    lifeAspects: {
      career: "예술, 요리, 교육, 서비스업에 적합",
      relationship: "편안하고 여유로운 관계",
      wealth: "꾸준한 수입, 안정적 재물운",
    },
    whenStrong: "재능이 풍부하고 여유로운 삶을 살지만, 안주하지 않도록 주의해야 합니다.",
    whenWeak: "노력으로 재능을 개발해야 하며, 표현력을 기르면 좋습니다.",
  },
  sanggwan: {
    code: "sanggwan",
    korean: "상관",
    hanja: "傷官",
    english: "Hurting Officer",
    group: "식상",
    groupDescription: "내가 생하는 오행으로, 표현과 창조의 에너지",
    shortDescription: "관(官)을 상하게 하는 기운, 창의성과 반항",
    detailedDescription: [
      "상관(傷官)은 '관을 상하게 한다'는 뜻으로, 내가 생하는 오행 중 다른 음양입니다.",
      "창의성, 예술성, 언변, 반항심을 나타냅니다.",
      "상관이 있으면 재능이 뛰어나고 창의적이지만, 권위에 반항하는 경향이 있습니다.",
    ],
    keywords: ["창의성", "예술", "언변", "반항", "독창성"],
    positiveTraits: ["뛰어난 창의력", "예술적 재능", "설득력 있는 말솜씨", "독창적 사고"],
    negativeTraits: ["권위에 반항", "입이 거칠 수 있음", "불안정할 수 있음", "비판적 성향"],
    lifeAspects: {
      career: "예술, 연예, 법조계, 프리랜서에 적합",
      relationship: "독특한 매력, 하지만 갈등 가능성",
      wealth: "창의적 방법으로 수입, 변동 가능성",
    },
    whenStrong: "창의력이 뛰어나고 독특하지만, 사회적 규범과 충돌할 수 있습니다.",
    whenWeak: "순응적이지만 창의성 발휘가 어려울 수 있습니다.",
  },
  pyeonjae: {
    code: "pyeonjae",
    korean: "편재",
    hanja: "偏財",
    english: "Indirect Wealth",
    group: "재성",
    groupDescription: "내가 극하는 오행으로, 재물과 현실의 에너지",
    shortDescription: "치우친 재물, 투기적 재물과 아버지",
    detailedDescription: [
      "편재(偏財)는 '치우친 재물'이라는 뜻으로, 내가 극하는 오행 중 같은 음양입니다.",
      "유동적인 재물, 투기, 사업, 아버지를 나타냅니다.",
      "편재가 있으면 사업 수완이 좋고 돈을 잘 굴리지만, 투기적 성향이 있습니다.",
    ],
    keywords: ["사업", "투기", "유동재물", "아버지", "융통성"],
    positiveTraits: ["사업 수완", "돈을 굴리는 능력", "사교성", "융통성"],
    negativeTraits: ["투기 위험", "안정성 부족", "방탕할 수 있음", "재물 변동"],
    lifeAspects: {
      career: "사업, 투자, 영업, 무역에 적합",
      relationship: "다양한 인연, 바람기 주의",
      wealth: "큰 돈을 벌 수 있지만 잃을 수도 있음",
    },
    whenStrong: "사업 수완이 뛰어나지만, 투기와 방탕에 주의해야 합니다.",
    whenWeak: "안정적 수입을 선호하며, 사업보다 직장이 맞을 수 있습니다.",
  },
  jeongjae: {
    code: "jeongjae",
    korean: "정재",
    hanja: "正財",
    english: "Direct Wealth",
    group: "재성",
    groupDescription: "내가 극하는 오행으로, 재물과 현실의 에너지",
    shortDescription: "바른 재물, 정당한 노력의 대가",
    detailedDescription: [
      "정재(正財)는 '바른 재물'이라는 뜻으로, 내가 극하는 오행 중 다른 음양입니다.",
      "정당한 노동의 대가, 월급, 저축, 아내(남성의 경우)를 나타냅니다.",
      "정재가 있으면 성실하고 검소하며, 안정적인 재물운이 있습니다.",
    ],
    keywords: ["성실", "저축", "안정", "검소", "정당한 재물"],
    positiveTraits: ["성실함", "검소한 생활", "안정적 재물", "현실적 감각"],
    negativeTraits: ["인색해 보일 수 있음", "융통성 부족", "소심할 수 있음", "모험 회피"],
    lifeAspects: {
      career: "안정적인 직장, 회계, 금융, 공무원",
      relationship: "안정적이고 헌신적인 관계",
      wealth: "꾸준히 모으는 재물, 안정적 수입",
    },
    whenStrong: "성실하고 안정적인 재물운이 있지만, 융통성을 기르면 좋습니다.",
    whenWeak: "재물 관리 능력을 키우고, 저축 습관을 들이면 좋습니다.",
  },
  pyeongwan: {
    code: "pyeongwan",
    korean: "편관",
    hanja: "偏官",
    english: "Seven Killings",
    group: "관성",
    groupDescription: "나를 극하는 오행으로, 명예와 책임의 에너지",
    shortDescription: "치우친 관, 압박과 도전의 에너지",
    detailedDescription: [
      "편관(偏官)은 '치우친 관'이라는 뜻으로, 나를 극하는 오행 중 같은 음양입니다.",
      "권력, 위험, 도전, 군인/경찰 같은 강한 직업을 나타냅니다.",
      "편관이 있으면 카리스마가 있고 리더십이 강하지만, 위험과 압박도 따릅니다.",
    ],
    keywords: ["권력", "카리스마", "도전", "위험", "리더십"],
    positiveTraits: ["강한 카리스마", "리더십", "결단력", "위기 대처 능력"],
    negativeTraits: ["압박감", "위험 노출", "갈등 가능성", "과격해질 수 있음"],
    lifeAspects: {
      career: "군인, 경찰, 검찰, 리더십 필요한 직종",
      relationship: "강렬하지만 충돌 가능성",
      wealth: "권력을 통한 재물, 위험한 투자 주의",
    },
    whenStrong: "강한 리더십과 결단력이 있지만, 과격함과 충돌에 주의해야 합니다.",
    whenWeak: "평화로운 삶을 살지만, 리더십 발휘 기회가 적을 수 있습니다.",
  },
  jeonggwan: {
    code: "jeonggwan",
    korean: "정관",
    hanja: "正官",
    english: "Direct Authority",
    group: "관성",
    groupDescription: "나를 극하는 오행으로, 명예와 책임의 에너지",
    shortDescription: "바른 관, 명예와 직장",
    detailedDescription: [
      "정관(正官)은 '바른 관'이라는 뜻으로, 나를 극하는 오행 중 다른 음양입니다.",
      "명예, 직장, 사회적 지위, 남편(여성의 경우)을 나타냅니다.",
      "정관이 있으면 책임감이 강하고, 조직에서 인정받으며 출세할 수 있습니다.",
    ],
    keywords: ["명예", "직장", "책임감", "출세", "사회적 지위"],
    positiveTraits: ["책임감", "사회적 인정", "안정적 직장운", "신뢰받는 성품"],
    negativeTraits: ["규범에 얽매임", "융통성 부족", "스트레스", "체면 중시"],
    lifeAspects: {
      career: "공무원, 대기업, 전문직, 관리직",
      relationship: "안정적이고 책임감 있는 관계",
      wealth: "직장을 통한 안정적 수입",
    },
    whenStrong: "사회적으로 인정받고 출세하지만, 책임감의 무게가 클 수 있습니다.",
    whenWeak: "자유로운 삶을 살지만, 조직에서 인정받기 어려울 수 있습니다.",
  },
  pyeonin: {
    code: "pyeonin",
    korean: "편인",
    hanja: "偏印",
    english: "Indirect Seal",
    group: "인성",
    groupDescription: "나를 생하는 오행으로, 학문과 보호의 에너지",
    shortDescription: "치우친 인, 특수 재능과 고독",
    detailedDescription: [
      "편인(偏印)은 '치우친 인'이라는 뜻으로, 나를 생하는 오행 중 같은 음양입니다.",
      "특수 재능, 종교, 철학, 의술, 예술을 나타냅니다.",
      "편인이 있으면 독특한 재능이 있고 학구적이지만, 고독감이 있을 수 있습니다.",
    ],
    keywords: ["특수재능", "학문", "철학", "종교", "고독"],
    positiveTraits: ["독특한 재능", "학구적 성향", "깊은 사고력", "전문성"],
    negativeTraits: ["고독감", "현실과 동떨어짐", "편협할 수 있음", "변덕"],
    lifeAspects: {
      career: "학자, 연구원, 의사, 종교인, 예술가",
      relationship: "깊은 관계를 원하지만 고독감",
      wealth: "전문 분야를 통한 수입",
    },
    whenStrong: "독특한 재능과 전문성이 있지만, 고독감과 현실 괴리에 주의해야 합니다.",
    whenWeak: "평범한 삶을 살지만, 특수 분야에서 두각을 나타내기 어려울 수 있습니다.",
  },
  jeongin: {
    code: "jeongin",
    korean: "정인",
    hanja: "正印",
    english: "Direct Seal",
    group: "인성",
    groupDescription: "나를 생하는 오행으로, 학문과 보호의 에너지",
    shortDescription: "바른 인, 학문과 어머니",
    detailedDescription: [
      "정인(正印)은 '바른 인'이라는 뜻으로, 나를 생하는 오행 중 다른 음양입니다.",
      "학문, 자격증, 어머니, 보호자, 문서를 나타냅니다.",
      "정인이 있으면 학업운이 좋고, 자격증/학위를 통해 인정받을 수 있습니다.",
    ],
    keywords: ["학문", "자격증", "어머니", "보호", "문서"],
    positiveTraits: ["학업 능력", "자격증/학위", "보호받는 운", "지적 능력"],
    negativeTraits: ["의존적일 수 있음", "결단력 부족", "현실감각 부족", "게으를 수 있음"],
    lifeAspects: {
      career: "교육, 학술, 공무원, 자격증 기반 직업",
      relationship: "보호받고 싶은 욕구, 안정적 관계",
      wealth: "학문/자격증을 통한 수입",
    },
    whenStrong: "학업운이 좋고 보호받지만, 의존성과 결단력 부족에 주의해야 합니다.",
    whenWeak: "스스로 길을 개척해야 하며, 학업에 더 노력이 필요할 수 있습니다.",
  },
};

// ============================================================================
// 십성 개념 설명
// ============================================================================

export const TEN_GOD_CONCEPT = {
  ko: {
    title: "십성(十星)이란?",
    definition:
      "십성은 일간(나)과 다른 천간/지지의 관계를 나타내는 10가지 별입니다. 각각의 십성은 인생의 다양한 영역과 관계를 상징합니다.",
    groups: [
      {
        name: "비겁(比劫)",
        members: ["비견", "겁재"],
        description: "나와 같은 오행. 형제, 친구, 경쟁자를 나타내며 자립심과 경쟁의 에너지입니다.",
      },
      {
        name: "식상(食傷)",
        members: ["식신", "상관"],
        description: "내가 생하는 오행. 재능, 표현력, 자녀를 나타내며 창조와 표현의 에너지입니다.",
      },
      {
        name: "재성(財星)",
        members: ["편재", "정재"],
        description: "내가 극하는 오행. 재물, 아내(남성), 현실감각을 나타내며 물질과 실용의 에너지입니다.",
      },
      {
        name: "관성(官星)",
        members: ["편관", "정관"],
        description: "나를 극하는 오행. 직장, 명예, 남편(여성)을 나타내며 책임과 사회적 역할의 에너지입니다.",
      },
      {
        name: "인성(印星)",
        members: ["편인", "정인"],
        description: "나를 생하는 오행. 학문, 어머니, 보호를 나타내며 지식과 보살핌의 에너지입니다.",
      },
    ],
    howToRead: [
      "사주에 많이 나타나는 십성은 그 영역이 강조됨을 의미합니다.",
      "없거나 적은 십성은 그 영역에 에너지가 부족함을 나타냅니다.",
      "십성의 균형이 중요하며, 과하거나 부족한 것 모두 주의가 필요합니다.",
    ],
  },
  en: {
    title: "What are Ten Gods?",
    definition:
      "Ten Gods represent the relationships between the Day Master and other characters. Each Ten God symbolizes different aspects of life.",
    groups: [
      {
        name: "Parallel (比劫)",
        members: ["Companion", "Rob Wealth"],
        description: "Same element as Day Master. Represents siblings, friends, competitors.",
      },
      {
        name: "Output (食傷)",
        members: ["Eating God", "Hurting Officer"],
        description: "Element produced by Day Master. Represents talents, expression, children.",
      },
      {
        name: "Wealth (財星)",
        members: ["Indirect Wealth", "Direct Wealth"],
        description: "Element controlled by Day Master. Represents money, wife (for men).",
      },
      {
        name: "Authority (官星)",
        members: ["Seven Killings", "Direct Authority"],
        description: "Element that controls Day Master. Represents career, husband (for women).",
      },
      {
        name: "Resource (印星)",
        members: ["Indirect Seal", "Direct Seal"],
        description: "Element that produces Day Master. Represents education, mother.",
      },
    ],
    howToRead: [
      "Strong Ten Gods indicate emphasized life areas.",
      "Weak or absent Ten Gods indicate areas needing attention.",
      "Balance among Ten Gods is important for harmony.",
    ],
  },
};

// ============================================================================
// 신살(神殺) 개념 설명 데이터
// ============================================================================

export interface StarDetailedInfo {
  name: string;
  hanja: string;
  type: "auspicious" | "inauspicious" | "neutral";
  category: "길신" | "흉신" | "중성";
  shortDescription: string;
  detailedDescription: string[];
  traditionalMeaning: string;
  modernInterpretation: string;
  advice: string;
  affectedAreas: string[];
}

export const STAR_DETAILED: Record<string, StarDetailedInfo> = {
  역마살: {
    name: "역마살",
    hanja: "驛馬殺",
    type: "neutral",
    category: "중성",
    shortDescription: "이동과 변화의 기운",
    detailedDescription: [
      "역마살은 말이 역참을 오가듯 끊임없이 움직이는 기운을 나타냅니다.",
      "이사, 출장, 해외, 변화가 잦은 삶을 살게 됩니다.",
      "길하게 작용하면 해외 진출, 사업 확장에 유리하고, 흉하게 작용하면 불안정한 삶이 됩니다.",
    ],
    traditionalMeaning: "옛날에는 먼 길을 떠나거나 관직에 나가 떠도는 것을 의미했습니다.",
    modernInterpretation: "현대에는 해외 출장, 여행, 이직, 이사가 잦은 삶으로 해석됩니다.",
    advice: "변화를 두려워하지 말고 적극적으로 활용하세요. 한 곳에 정착하기보다 움직임 속에서 기회를 찾으세요.",
    affectedAreas: ["직업", "거주지", "해외운", "변화"],
  },
  도화살: {
    name: "도화살",
    hanja: "桃花殺",
    type: "neutral",
    category: "중성",
    shortDescription: "인기와 매력의 기운",
    detailedDescription: [
      "도화살은 복숭아꽃처럼 사람을 끌어당기는 매력의 기운입니다.",
      "이성에게 인기가 많고 대인관계가 좋습니다.",
      "길하게 작용하면 연예인, 서비스업에서 성공하고, 흉하게 작용하면 이성 문제가 생길 수 있습니다.",
    ],
    traditionalMeaning: "옛날에는 주로 이성 관계의 복잡함으로 보았습니다.",
    modernInterpretation: "현대에는 대인관계 능력, 서비스 마인드, 예술적 감각으로 해석됩니다.",
    advice: "매력을 긍정적인 방향으로 활용하세요. 이성 관계는 신중하게 관리하세요.",
    affectedAreas: ["연애", "대인관계", "인기", "매력"],
  },
  화개살: {
    name: "화개살",
    hanja: "華蓋殺",
    type: "auspicious",
    category: "길신",
    shortDescription: "학문과 예술의 기운",
    detailedDescription: [
      "화개살은 화려한 덮개라는 뜻으로, 학문, 종교, 예술적 재능을 나타냅니다.",
      "깊이 있는 사고와 고독한 탐구의 기운이 있습니다.",
      "학자, 예술가, 종교인에게 유리하며, 내면의 세계가 풍부합니다.",
    ],
    traditionalMeaning: "옛날에는 승려나 도인이 될 기운으로 보았습니다.",
    modernInterpretation: "현대에는 전문가, 학자, 예술가로서의 성공 가능성으로 해석됩니다.",
    advice: "혼자만의 시간을 소중히 하고, 깊이 있는 분야에서 전문성을 키우세요.",
    affectedAreas: ["학문", "예술", "종교", "전문성"],
  },
  천을귀인: {
    name: "천을귀인",
    hanja: "天乙貴人",
    type: "auspicious",
    category: "길신",
    shortDescription: "귀인의 도움을 받는 기운",
    detailedDescription: [
      "천을귀인은 하늘이 내린 귀한 사람이라는 뜻으로, 가장 강력한 길신입니다.",
      "어려울 때 귀인의 도움을 받고, 위기를 모면하는 행운이 있습니다.",
      "사회적으로 존경받고, 높은 지위에 오를 수 있는 기운입니다.",
    ],
    traditionalMeaning: "옛날에는 임금의 총애를 받거나 높은 관직에 오르는 것을 의미했습니다.",
    modernInterpretation: "현대에는 좋은 인맥, 위기 극복 능력, 사회적 성공으로 해석됩니다.",
    advice: "주변 인연을 소중히 하세요. 어려울 때 도움을 줄 귀인이 나타날 것입니다.",
    affectedAreas: ["인맥", "사회운", "위기극복", "명예"],
  },
  문창귀인: {
    name: "문창귀인",
    hanja: "文昌貴人",
    type: "auspicious",
    category: "길신",
    shortDescription: "학문과 문서의 기운",
    detailedDescription: [
      "문창귀인은 학문과 글의 별로, 공부와 시험에 유리한 기운입니다.",
      "자격증, 학위, 공무원 시험 등 문서로 인정받는 일에 강합니다.",
      "지적 능력이 뛰어나고 표현력이 좋습니다.",
    ],
    traditionalMeaning: "옛날에는 과거 급제, 학문적 성취를 의미했습니다.",
    modernInterpretation: "현대에는 학업 성취, 자격증, 글쓰기 능력으로 해석됩니다.",
    advice: "꾸준히 공부하고 자격증을 취득하세요. 지식이 재산이 됩니다.",
    affectedAreas: ["학업", "시험", "자격증", "글쓰기"],
  },
  양인살: {
    name: "양인살",
    hanja: "羊刃殺",
    type: "inauspicious",
    category: "흉신",
    shortDescription: "날카로운 칼날의 기운",
    detailedDescription: [
      "양인살은 양의 뿔처럼 날카로운 기운으로, 강렬하고 극단적인 에너지입니다.",
      "결단력과 추진력이 강하지만, 충돌과 위험이 따릅니다.",
      "잘 활용하면 큰 성공을 거두지만, 잘못 쓰면 큰 실패를 겪습니다.",
    ],
    traditionalMeaning: "옛날에는 무인(武人)의 기운, 형벌과 관련된 것으로 보았습니다.",
    modernInterpretation: "현대에는 승부사 기질, 결단력, 리더십으로 해석됩니다.",
    advice: "날카로운 기운을 긍정적으로 활용하세요. 충동적 결정은 피하세요.",
    affectedAreas: ["성격", "결단력", "위험", "성공/실패"],
  },
  공망: {
    name: "공망",
    hanja: "空亡",
    type: "inauspicious",
    category: "흉신",
    shortDescription: "비어있는 기운, 허무",
    detailedDescription: [
      "공망은 '비어서 사라진다'는 뜻으로, 해당 영역이 비어있거나 힘이 약한 것을 나타냅니다.",
      "노력해도 결과가 없거나, 뜻대로 되지 않는 경험을 할 수 있습니다.",
      "다만 정신적, 영적 성장에는 오히려 유리할 수 있습니다.",
    ],
    traditionalMeaning: "옛날에는 재물이 사라지거나 관직을 잃는 것으로 보았습니다.",
    modernInterpretation: "현대에는 물질적 손실보다 정신적 허무, 방향 상실로 해석됩니다.",
    advice: "물질적 욕심을 줄이고 정신적 성장에 집중하세요.",
    affectedAreas: ["재물", "목표", "정신", "영성"],
  },
  삼합: {
    name: "삼합",
    hanja: "三合",
    type: "auspicious",
    category: "길신",
    shortDescription: "조화와 협력의 기운",
    detailedDescription: [
      "삼합은 세 지지가 모여 하나의 오행을 이루는 것으로, 강력한 협력의 기운입니다.",
      "팀워크가 좋고 협동을 통해 큰 일을 이룰 수 있습니다.",
      "해당 오행의 기운이 강화되어 그 영역에서 성과를 냅니다.",
    ],
    traditionalMeaning: "옛날에는 여러 사람이 힘을 모아 성공하는 것을 의미했습니다.",
    modernInterpretation: "현대에는 팀워크, 협업 능력, 시너지 효과로 해석됩니다.",
    advice: "혼자보다 함께할 때 더 큰 성과를 낼 수 있습니다. 좋은 팀을 만드세요.",
    affectedAreas: ["협력", "팀워크", "인맥", "성과"],
  },
  귀문관살: {
    name: "귀문관살",
    hanja: "鬼門關殺",
    type: "inauspicious",
    category: "흉신",
    shortDescription: "귀신의 문을 여는 기운",
    detailedDescription: [
      "귀문관살은 영적인 감각이 예민하고 직관력이 강한 기운입니다.",
      "꿈이 생생하거나 육감이 발달해 있습니다.",
      "흉하게 작용하면 정신적 고통이 있지만, 길하게 작용하면 영적 능력이 됩니다.",
    ],
    traditionalMeaning: "옛날에는 귀신을 보거나 정신 질환으로 해석되었습니다.",
    modernInterpretation: "현대에는 예민한 감수성, 직관력, 심리 분야 재능으로 해석됩니다.",
    advice: "예민함을 장점으로 활용하세요. 심리, 상담, 예술 분야가 적합합니다.",
    affectedAreas: ["정신", "직관", "영성", "감수성"],
  },
};

export const STAR_CONCEPT = {
  ko: {
    title: "신살(神殺)이란?",
    definition:
      "신살은 사주에 나타나는 특별한 기운으로, 길한 신(神)과 흉한 살(殺)을 통틀어 이르는 말입니다.",
    categories: [
      {
        name: "길신(吉神)",
        description: "좋은 기운을 가져다주는 별입니다.",
        examples: ["천을귀인", "문창귀인", "화개살", "삼합"],
      },
      {
        name: "흉신(凶神)",
        description: "주의가 필요한 기운을 나타내는 별입니다.",
        examples: ["양인살", "공망", "귀문관살"],
      },
      {
        name: "중성(中性)",
        description: "길흉이 상황에 따라 달라지는 별입니다.",
        examples: ["역마살", "도화살"],
      },
    ],
    howToRead: [
      "신살은 사주의 양념과 같아서, 기본 구조를 보완하거나 강조합니다.",
      "길신이 많다고 무조건 좋고, 흉신이 있다고 무조건 나쁜 것은 아닙니다.",
      "신살의 위치(년주, 월주, 일주, 시주)에 따라 영향력이 달라집니다.",
      "현대에는 흉신도 긍정적으로 활용할 수 있다고 해석합니다.",
    ],
  },
  en: {
    title: "What are Stars (Shen Sha)?",
    definition:
      "Stars are special energies in the Four Pillars, including both auspicious (Shen) and inauspicious (Sha) influences.",
    categories: [
      {
        name: "Auspicious Stars",
        description: "Stars that bring positive energy.",
        examples: ["Heavenly Noble", "Literary Star", "Flower Canopy"],
      },
      {
        name: "Inauspicious Stars",
        description: "Stars that require caution.",
        examples: ["Blade of Sheep", "Empty Death", "Ghost Gate"],
      },
      {
        name: "Neutral Stars",
        description: "Stars whose effects depend on circumstances.",
        examples: ["Traveling Horse", "Peach Blossom"],
      },
    ],
    howToRead: [
      "Stars are like spices - they complement or emphasize the basic structure.",
      "Having auspicious stars doesn't guarantee good luck, and vice versa.",
      "The position of stars affects their influence.",
      "Modern interpretation views all stars as potentially useful.",
    ],
  },
};

// ============================================================================
// 운세(運勢) 개념 설명 데이터
// ============================================================================

export const FORTUNE_CONCEPT = {
  ko: {
    title: "대운(大運)과 세운(歲運)이란?",
    majorFortune: {
      title: "대운(大運)",
      definition:
        "대운은 10년 단위로 바뀌는 큰 운의 흐름입니다. 인생의 큰 방향과 시기별 운의 특성을 나타냅니다.",
      explanation: [
        "대운은 월주를 기준으로 순행 또는 역행하며 변화합니다.",
        "남자는 양년생이면 순행, 음년생이면 역행합니다.",
        "여자는 양년생이면 역행, 음년생이면 순행합니다.",
        "각 대운은 10년간 지속되며, 사주와의 관계에 따라 길흉이 결정됩니다.",
      ],
      importance: [
        "인생의 큰 흐름과 전환점을 파악할 수 있습니다.",
        "어떤 시기에 어떤 일을 하면 좋을지 판단하는 기준이 됩니다.",
        "대운이 좋으면 노력의 결실을 맺기 쉽고, 나쁘면 어려움이 있을 수 있습니다.",
      ],
    },
    annualFortune: {
      title: "세운(歲運)",
      definition: "세운은 매년 바뀌는 운의 흐름입니다. 그 해의 운세와 특성을 나타냅니다.",
      explanation: [
        "세운은 그 해의 간지로 결정됩니다.",
        "예를 들어 2024년은 갑진년(甲辰年), 2025년은 을사년(乙巳年)입니다.",
        "세운과 사주의 관계에 따라 그 해의 길흉이 결정됩니다.",
      ],
      importance: [
        "매년 달라지는 운의 흐름을 파악할 수 있습니다.",
        "중요한 결정이나 행사의 시기를 정하는 데 참고합니다.",
        "대운과 세운이 모두 좋으면 최고의 시기, 둘 다 나쁘면 주의가 필요합니다.",
      ],
    },
    monthlyFortune: {
      title: "월운(月運)",
      definition: "월운은 매월 바뀌는 운의 흐름입니다.",
      explanation: [
        "각 월의 절기를 기준으로 운이 바뀝니다.",
        "세운 안에서 좀 더 세밀한 시기를 파악하는 데 사용합니다.",
      ],
    },
    howToRead: [
      "대운은 인생의 큰 그림, 세운은 그 해의 구체적인 운세입니다.",
      "대운이 좋아도 세운이 나쁘면 그 해는 주의가 필요합니다.",
      "대운이 나빠도 세운이 좋으면 그 해에 기회가 올 수 있습니다.",
      "사주 원국이 가장 중요하고, 대운 > 세운 순으로 영향력이 있습니다.",
    ],
  },
  en: {
    title: "What are Major Fortune and Annual Fortune?",
    majorFortune: {
      title: "Major Fortune (大運)",
      definition:
        "Major Fortune is the 10-year cycle of luck. It shows the major direction and characteristics of different life periods.",
      explanation: [
        "Major Fortune changes based on the Month Pillar, moving forward or backward.",
        "Each Major Fortune lasts 10 years.",
        "The relationship with the original chart determines fortune.",
      ],
      importance: [
        "Understand major life transitions and directions.",
        "Plan important decisions based on favorable periods.",
        "Good Major Fortune makes success easier to achieve.",
      ],
    },
    annualFortune: {
      title: "Annual Fortune (歲運)",
      definition: "Annual Fortune is the yearly luck cycle. It shows the fortune for each year.",
      explanation: [
        "Annual Fortune is determined by the year's Gan-Zhi.",
        "For example, 2024 is Jiachen (甲辰), 2025 is Yisi (乙巳).",
        "Relationship with original chart determines yearly fortune.",
      ],
      importance: [
        "Track yearly changes in fortune.",
        "Time important decisions and events.",
        "Best when both Major and Annual Fortune are favorable.",
      ],
    },
    monthlyFortune: {
      title: "Monthly Fortune (月運)",
      definition: "Monthly Fortune is the monthly luck cycle.",
      explanation: [
        "Changes based on solar terms each month.",
        "Used for more detailed timing within the year.",
      ],
    },
    howToRead: [
      "Major Fortune is the big picture, Annual Fortune is the specific year.",
      "Even good Major Fortune needs caution if Annual Fortune is bad.",
      "Opportunities can come in good Annual Fortune even during bad Major Fortune.",
      "Original chart is most important, then Major Fortune, then Annual Fortune.",
    ],
  },
};

// ============================================================================
// 분석 타입 구분
// ============================================================================

export type AnalysisType = "basic" | "comprehensive";

export const BASIC_CATEGORIES = ["dayMaster", "tenGods", "stars", "fortune"] as const;
export const COMPREHENSIVE_CATEGORIES = ["personality", "career", "wealth", "relationship", "health"] as const;

export type BasicCategory = (typeof BASIC_CATEGORIES)[number];
export type ComprehensiveCategory = (typeof COMPREHENSIVE_CATEGORIES)[number];

export function isBasicCategory(category: string): category is BasicCategory {
  return BASIC_CATEGORIES.includes(category as BasicCategory);
}

export function isComprehensiveCategory(category: string): category is ComprehensiveCategory {
  return COMPREHENSIVE_CATEGORIES.includes(category as ComprehensiveCategory);
}
