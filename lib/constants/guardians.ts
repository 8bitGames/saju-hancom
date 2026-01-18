/**
 * 청기운 (Cheong-Giun) Guardian System
 * 오방신 (Five Direction Gods) - 수호신 캐릭터 시스템
 */

export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface Guardian {
  id: ElementType;
  name: {
    ko: string;
    en: string;
  };
  element: {
    ko: string;
    en: string;
  };
  imagePath: string;
  color: string;
  colorLight: string;
  gradientFrom: string;
  gradientTo: string;
  description: {
    ko: string;
    en: string;
  };
  personality: {
    ko: string[];
    en: string[];
  };
  strengths: {
    ko: string[];
    en: string[];
  };
  direction: {
    ko: string;
    en: string;
  };
  season: {
    ko: string;
    en: string;
  };
  glowAnimation: string;
}

export const GUARDIANS: Record<ElementType, Guardian> = {
  wood: {
    id: 'wood',
    name: {
      ko: '청룡',
      en: 'Azure Dragon',
    },
    element: {
      ko: '목(木)',
      en: 'Wood',
    },
    imagePath: '/icons/guardians/wood.png',
    color: '#2D5A27',
    colorLight: '#4A7C43',
    gradientFrom: '#2D5A27',
    gradientTo: '#4A7C43',
    description: {
      ko: '동쪽을 수호하는 청룡은 성장과 창의력의 기운을 가지고 있습니다.',
      en: 'The Azure Dragon of the East brings energies of growth and creativity.',
    },
    personality: {
      ko: ['창의적', '진취적', '유연한', '성장지향'],
      en: ['Creative', 'Progressive', 'Flexible', 'Growth-oriented'],
    },
    strengths: {
      ko: ['새로운 시작', '창의적 해결', '리더십', '비전 제시'],
      en: ['New beginnings', 'Creative solutions', 'Leadership', 'Visionary'],
    },
    direction: {
      ko: '동쪽',
      en: 'East',
    },
    season: {
      ko: '봄',
      en: 'Spring',
    },
    glowAnimation: 'animate-wood-glow',
  },
  fire: {
    id: 'fire',
    name: {
      ko: '주작',
      en: 'Vermilion Bird',
    },
    element: {
      ko: '화(火)',
      en: 'Fire',
    },
    imagePath: '/icons/guardians/fire.png',
    color: '#B91C1C',
    colorLight: '#DC2626',
    gradientFrom: '#B91C1C',
    gradientTo: '#DC2626',
    description: {
      ko: '남쪽을 수호하는 주작은 열정과 활력의 기운을 가지고 있습니다.',
      en: 'The Vermilion Bird of the South brings energies of passion and vitality.',
    },
    personality: {
      ko: ['열정적', '활동적', '표현력 있는', '영감을 주는'],
      en: ['Passionate', 'Active', 'Expressive', 'Inspiring'],
    },
    strengths: {
      ko: ['열정 전달', '동기 부여', '빠른 실행', '카리스마'],
      en: ['Spreading passion', 'Motivation', 'Quick action', 'Charisma'],
    },
    direction: {
      ko: '남쪽',
      en: 'South',
    },
    season: {
      ko: '여름',
      en: 'Summer',
    },
    glowAnimation: 'animate-fire-glow',
  },
  earth: {
    id: 'earth',
    name: {
      ko: '황룡',
      en: 'Yellow Dragon',
    },
    element: {
      ko: '토(土)',
      en: 'Earth',
    },
    imagePath: '/icons/guardians/earth.png',
    color: '#C4A35A',
    colorLight: '#D4B86A',
    gradientFrom: '#C4A35A',
    gradientTo: '#D4B86A',
    description: {
      ko: '중앙을 수호하는 황룡은 안정과 중심의 기운을 가지고 있습니다.',
      en: 'The Yellow Dragon of the Center brings energies of stability and balance.',
    },
    personality: {
      ko: ['안정적', '신뢰할 수 있는', '중재하는', '현실적'],
      en: ['Stable', 'Reliable', 'Mediating', 'Realistic'],
    },
    strengths: {
      ko: ['균형 유지', '중재 능력', '실용적 해결', '기반 구축'],
      en: ['Maintaining balance', 'Mediation', 'Practical solutions', 'Building foundations'],
    },
    direction: {
      ko: '중앙',
      en: 'Center',
    },
    season: {
      ko: '환절기',
      en: 'Transitional seasons',
    },
    glowAnimation: 'animate-earth-glow',
  },
  metal: {
    id: 'metal',
    name: {
      ko: '백호',
      en: 'White Tiger',
    },
    element: {
      ko: '금(金)',
      en: 'Metal',
    },
    imagePath: '/icons/guardians/metal.png',
    color: '#6B7280',
    colorLight: '#9CA3AF',
    gradientFrom: '#6B7280',
    gradientTo: '#9CA3AF',
    description: {
      ko: '서쪽을 수호하는 백호는 결단력과 정의의 기운을 가지고 있습니다.',
      en: 'The White Tiger of the West brings energies of determination and justice.',
    },
    personality: {
      ko: ['결단력 있는', '정의로운', '분석적', '정밀한'],
      en: ['Decisive', 'Just', 'Analytical', 'Precise'],
    },
    strengths: {
      ko: ['빠른 결단', '공정한 판단', '세밀한 분석', '효율성'],
      en: ['Quick decisions', 'Fair judgment', 'Detailed analysis', 'Efficiency'],
    },
    direction: {
      ko: '서쪽',
      en: 'West',
    },
    season: {
      ko: '가을',
      en: 'Autumn',
    },
    glowAnimation: 'animate-metal-glow',
  },
  water: {
    id: 'water',
    name: {
      ko: '현무',
      en: 'Black Tortoise',
    },
    element: {
      ko: '수(水)',
      en: 'Water',
    },
    imagePath: '/icons/guardians/water.png',
    color: '#1E3A5F',
    colorLight: '#2563EB',
    gradientFrom: '#1E3A5F',
    gradientTo: '#2563EB',
    description: {
      ko: '북쪽을 수호하는 현무는 지혜와 인내의 기운을 가지고 있습니다.',
      en: 'The Black Tortoise of the North brings energies of wisdom and patience.',
    },
    personality: {
      ko: ['지혜로운', '인내심 있는', '깊이 있는', '적응력 있는'],
      en: ['Wise', 'Patient', 'Deep', 'Adaptable'],
    },
    strengths: {
      ko: ['깊은 통찰', '장기적 관점', '적응력', '직관력'],
      en: ['Deep insight', 'Long-term perspective', 'Adaptability', 'Intuition'],
    },
    direction: {
      ko: '북쪽',
      en: 'North',
    },
    season: {
      ko: '겨울',
      en: 'Winter',
    },
    glowAnimation: 'animate-water-glow',
  },
};

/**
 * 오행 순서 (상생/상극 순환)
 */
export const ELEMENT_ORDER: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/**
 * 상생 (생성) 관계: wood → fire → earth → metal → water → wood
 */
export const GENERATING_CYCLE: Record<ElementType, ElementType> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

/**
 * 상극 (제어) 관계: wood → earth → water → fire → metal → wood
 */
export const CONTROLLING_CYCLE: Record<ElementType, ElementType> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
};

/**
 * 주어진 오행 점수에서 가장 강한 오행을 결정
 */
export function getDominantElement(scores: Record<ElementType, number>): ElementType {
  let maxElement: ElementType = 'wood';
  let maxScore = scores.wood || 0;

  for (const element of ELEMENT_ORDER) {
    const score = scores[element] || 0;
    if (score > maxScore) {
      maxScore = score;
      maxElement = element;
    }
  }

  return maxElement;
}

/**
 * 주어진 오행에 해당하는 수호신 반환
 */
export function getGuardian(element: ElementType): Guardian {
  return GUARDIANS[element];
}

/**
 * 한글 오행 이름을 ElementType으로 변환
 */
export function koreanElementToType(korean: string): ElementType | null {
  const mapping: Record<string, ElementType> = {
    '목': 'wood',
    '木': 'wood',
    '화': 'fire',
    '火': 'fire',
    '토': 'earth',
    '土': 'earth',
    '금': 'metal',
    '金': 'metal',
    '수': 'water',
    '水': 'water',
  };

  return mapping[korean] || null;
}

/**
 * ElementType을 한글 오행 이름으로 변환
 */
export function elementTypeToKorean(element: ElementType): string {
  const mapping: Record<ElementType, string> = {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  };

  return mapping[element];
}

/**
 * 오행 배열 정보 (UI 표시용)
 */
export const ELEMENT_INFO = ELEMENT_ORDER.map((element) => ({
  id: element,
  guardian: GUARDIANS[element],
  korean: elementTypeToKorean(element),
}));

/**
 * 수호신 인사말
 */
export const GUARDIAN_GREETINGS: Record<ElementType, { ko: string; en: string }> = {
  wood: {
    ko: '안녕하세요, 저는 동쪽 녹차밭을 지키는 청룡입니다. 오늘도 성장의 기운을 전해드릴게요.',
    en: "Hello, I am Azure Dragon, guardian of the eastern green tea fields. Let me share the energy of growth with you today.",
  },
  fire: {
    ko: '반갑습니다! 저는 남쪽 용소를 지키는 주작이에요. 오늘 당신의 열정에 불을 지펴드릴게요!',
    en: "Greetings! I am Vermilion Bird, guardian of the southern Dragon Pond. Let me ignite your passion today!",
  },
  earth: {
    ko: '어서 오세요. 저는 중앙 약초원을 돌보는 황룡입니다. 편안한 마음으로 이야기 나눠요.',
    en: "Welcome. I am Yellow Dragon, tender of the central herb garden. Let's talk with a peaceful heart.",
  },
  metal: {
    ko: '만나서 반갑습니다. 저는 서쪽 오하산방을 지키는 백호입니다. 명료한 답을 드리겠습니다.',
    en: "Pleased to meet you. I am White Tiger, guardian of the western Tea House. I will give you clear answers.",
  },
  water: {
    ko: '안녕하세요. 저는 북쪽 명당 기도터를 수호하는 현무입니다. 깊은 지혜를 나누어 드릴게요.',
    en: "Hello. I am Black Tortoise, protector of the northern Sacred Ground. Let me share deep wisdom with you.",
  },
};

/**
 * 수호신 채팅 추천 질문
 */
export const GUARDIAN_PROMPTS: Record<ElementType, { ko: string[]; en: string[] }> = {
  wood: {
    ko: [
      '오늘 새로운 시작을 하기에 좋은 날인가요?',
      '창의력을 높이려면 어떻게 해야 할까요?',
      '성장을 위해 지금 집중해야 할 것은?',
      '녹차밭에서 가장 좋은 시간은 언제인가요?',
    ],
    en: [
      'Is today a good day for new beginnings?',
      'How can I boost my creativity?',
      'What should I focus on for growth?',
      'When is the best time at the green tea field?',
    ],
  },
  fire: {
    ko: [
      '오늘 열정을 불태울 수 있는 일은?',
      '용기가 필요할 때 어떻게 해야 하나요?',
      '인간관계에서 주의할 점은?',
      '용소에서 느낄 수 있는 에너지는?',
    ],
    en: [
      'What can I put my passion into today?',
      'What should I do when I need courage?',
      'What should I be careful about in relationships?',
      'What energy can I feel at Dragon Pond?',
    ],
  },
  earth: {
    ko: [
      '마음의 안정을 찾으려면 어떻게 해야 할까요?',
      '균형 잡힌 하루를 보내려면?',
      '건강을 위해 오늘 할 수 있는 일은?',
      '약초원에서 추천하는 활동은?',
    ],
    en: [
      'How can I find peace of mind?',
      'How can I have a balanced day?',
      'What can I do for my health today?',
      'What activities do you recommend at the herb garden?',
    ],
  },
  metal: {
    ko: [
      '중요한 결정을 앞두고 있는데 조언해 주세요',
      '집중력을 높이는 방법은?',
      '불필요한 것을 정리하려면?',
      '오하산방에서의 다도 체험은 어떤가요?',
    ],
    en: [
      'I have an important decision - any advice?',
      'How can I improve my focus?',
      'How can I declutter what is unnecessary?',
      'What is the tea ceremony like at the Tea House?',
    ],
  },
  water: {
    ko: [
      '직관을 믿어도 될까요?',
      '깊은 고민이 있는데 도움을 주세요',
      '내면의 평화를 찾는 방법은?',
      '명당에서 기도하면 어떤 효과가 있나요?',
    ],
    en: [
      'Can I trust my intuition?',
      'I have a deep concern - can you help?',
      'How can I find inner peace?',
      'What benefits come from praying at the Sacred Ground?',
    ],
  },
};

/**
 * 수호신 일일 메시지 (날짜와 오행에 따라 결정)
 */
export const GUARDIAN_DAILY_MESSAGES: Record<ElementType, { ko: string[]; en: string[] }> = {
  wood: {
    ko: [
      '오늘은 새로운 시작에 좋은 기운이 감돌고 있어요. 도전을 두려워하지 마세요.',
      '성장과 발전의 에너지가 넘치는 하루입니다. 배움에 집중해 보세요.',
      '창의적인 아이디어가 떠오르는 날이에요. 메모해 두세요!',
      '녹차밭의 아침 안개처럼, 맑은 마음으로 하루를 시작하세요.',
      '새순이 돋듯이, 오늘 당신 안에서도 새로운 가능성이 피어나요.',
    ],
    en: [
      'Good energy for new beginnings today. Do not fear challenges.',
      'A day full of growth energy. Focus on learning.',
      'Creative ideas will come today. Make sure to note them down!',
      'Like morning mist on the tea field, start your day with a clear mind.',
      'Like new sprouts emerging, new possibilities bloom within you today.',
    ],
  },
  fire: {
    ko: [
      '열정과 활력이 넘치는 하루가 될 거예요. 자신감을 가지세요!',
      '인간관계에서 좋은 일이 생길 수 있어요. 주변 사람들에게 따뜻하게 대해주세요.',
      '적극적인 행동이 좋은 결과를 가져올 거예요.',
      '용소의 불꽃처럼, 오늘 당신의 열정을 마음껏 표현하세요.',
      '따뜻한 마음으로 다가가면, 좋은 인연이 찾아올 거예요.',
    ],
    en: [
      'Today will be full of passion and vitality. Have confidence!',
      'Good things may happen in your relationships. Be warm to those around you.',
      'Active actions will bring good results.',
      'Like the flames of Dragon Pond, express your passion fully today.',
      'Approach with a warm heart, and good connections will come.',
    ],
  },
  earth: {
    ko: [
      '안정적인 에너지가 감도는 하루예요. 차분하게 일을 처리하세요.',
      '신뢰와 믿음이 중요한 날입니다. 약속을 꼭 지켜주세요.',
      '꾸준함이 빛을 발하는 날이에요. 기본에 충실하세요.',
      '약초원의 향기처럼, 오늘 하루 마음의 치유를 경험하세요.',
      '대지처럼 든든하게, 주변 사람들에게 의지가 되어주세요.',
    ],
    en: [
      'A day with stable energy. Handle things calmly.',
      'Trust and faith are important today. Keep your promises.',
      'A day where consistency shines. Stick to basics.',
      'Like the fragrance of the herb garden, experience healing today.',
      'Be reliable like the earth, be someone others can depend on.',
    ],
  },
  metal: {
    ko: [
      '결단력이 필요한 날이에요. 망설이지 말고 결정하세요.',
      '정리정돈과 마무리에 좋은 기운이 있어요.',
      '명확한 목표를 세우고 실행에 옮기세요.',
      '오하산방의 차처럼, 오늘은 맑고 깨끗한 마음을 유지하세요.',
      '불필요한 것을 덜어내고, 본질에 집중하는 하루가 되길.',
    ],
    en: [
      'A day requiring decisiveness. Do not hesitate to decide.',
      'Good energy for organizing and finishing tasks.',
      'Set clear goals and take action.',
      'Like tea at the Tea House, maintain a clear and pure mind today.',
      'May this be a day of removing the unnecessary and focusing on essence.',
    ],
  },
  water: {
    ko: [
      '직관과 통찰력이 높아지는 날이에요. 내면의 목소리에 귀 기울여 보세요.',
      '유연한 대처가 필요한 하루예요. 흐름에 맡겨보세요.',
      '깊이 있는 대화가 좋은 관계를 만들어줄 거예요.',
      '명당의 맑은 기운처럼, 오늘 마음속 잡념을 비워보세요.',
      '고요한 물이 깊은 것처럼, 내면의 깊이를 탐구해 보세요.',
    ],
    en: [
      'Intuition and insight are heightened today. Listen to your inner voice.',
      'A day requiring flexibility. Go with the flow.',
      'Deep conversations will create good relationships.',
      'Like the pure energy of the Sacred Ground, empty your mind today.',
      'Like still waters run deep, explore your inner depths.',
    ],
  },
};

/**
 * 오늘의 수호신 메시지 가져오기
 */
export function getTodayGuardianMessage(
  element: ElementType,
  locale: 'ko' | 'en' = 'ko'
): string {
  const messages = GUARDIAN_DAILY_MESSAGES[element][locale];
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return messages[dayOfYear % messages.length];
}

/**
 * 오늘의 담당 수호신 (날짜 기반 로테이션)
 */
export function getTodayGuardian(): Guardian {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return GUARDIANS[ELEMENT_ORDER[dayOfYear % 5]];
}

/**
 * 오늘의 담당 오행 (날짜 기반 로테이션)
 */
export function getTodayElement(): ElementType {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return ELEMENT_ORDER[dayOfYear % 5];
}
