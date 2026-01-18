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
