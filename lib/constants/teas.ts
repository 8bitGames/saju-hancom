/**
 * 오행 차 (Elemental Teas)
 * 각 수호신이 추천하는 전통 차
 */

import type { ElementType } from './guardians';

export interface ElementalTea {
  id: string;
  element: ElementType;
  name: {
    ko: string;
    en: string;
    hanja?: string;
  };
  description: {
    ko: string;
    en: string;
  };
  ingredients: {
    ko: string[];
    en: string[];
  };
  benefits: {
    ko: string[];
    en: string[];
  };
  brewingTip: {
    ko: string;
    en: string;
  };
  color: string;
  emoji: string;
}

export const ELEMENTAL_TEAS: Record<ElementType, ElementalTea> = {
  wood: {
    id: 'nokcha',
    element: 'wood',
    name: {
      ko: '녹차',
      en: 'Green Tea',
      hanja: '綠茶',
    },
    description: {
      ko: '청룡이 지키는 녹차밭에서 자란 찻잎으로 우린 상쾌한 차',
      en: 'Refreshing tea brewed from leaves grown in the green tea fields guarded by Azure Dragon',
    },
    ingredients: {
      ko: ['유기농 녹차잎', '봄 새순'],
      en: ['Organic green tea leaves', 'Spring buds'],
    },
    benefits: {
      ko: ['집중력 향상', '신진대사 촉진', '항산화 효과'],
      en: ['Focus enhancement', 'Metabolism boost', 'Antioxidant effects'],
    },
    brewingTip: {
      ko: '70-80°C 물에서 1-2분간 우려내세요',
      en: 'Brew in 70-80°C water for 1-2 minutes',
    },
    color: '#2D5A27',
    emoji: '🍵',
  },
  fire: {
    id: 'hongsam-cha',
    element: 'fire',
    name: {
      ko: '홍삼차',
      en: 'Red Ginseng Tea',
      hanja: '紅蔘茶',
    },
    description: {
      ko: '주작의 열정을 담은 따뜻한 홍삼차로 활력을 충전하세요',
      en: "Recharge your vitality with warm red ginseng tea infused with Vermilion Bird's passion",
    },
    ingredients: {
      ko: ['6년근 홍삼', '대추', '생강'],
      en: ['6-year-old red ginseng', 'Jujube', 'Ginger'],
    },
    benefits: {
      ko: ['면역력 강화', '피로 회복', '혈액순환 개선'],
      en: ['Immunity boost', 'Fatigue recovery', 'Blood circulation improvement'],
    },
    brewingTip: {
      ko: '90°C 이상의 뜨거운 물에서 5분 이상 우려내세요',
      en: 'Brew in water above 90°C for at least 5 minutes',
    },
    color: '#B91C1C',
    emoji: '🔥',
  },
  earth: {
    id: 'yakcho-cha',
    element: 'earth',
    name: {
      ko: '약초차',
      en: 'Herbal Tea',
      hanja: '藥草茶',
    },
    description: {
      ko: '황룡의 약초원에서 엄선한 약초들로 만든 치유의 차',
      en: "Healing tea made from carefully selected herbs from Yellow Dragon's herb garden",
    },
    ingredients: {
      ko: ['감초', '도라지', '꿀'],
      en: ['Licorice root', 'Balloon flower root', 'Honey'],
    },
    benefits: {
      ko: ['소화 촉진', '면역력 강화', '스트레스 완화'],
      en: ['Digestion aid', 'Immunity boost', 'Stress relief'],
    },
    brewingTip: {
      ko: '은근한 불에서 20-30분 달여내세요',
      en: 'Simmer on low heat for 20-30 minutes',
    },
    color: '#C4A35A',
    emoji: '🌿',
  },
  metal: {
    id: 'baekhwa-cha',
    element: 'metal',
    name: {
      ko: '백화차',
      en: 'White Flower Tea',
      hanja: '白花茶',
    },
    description: {
      ko: '백호가 수호하는 오하산방에서 마시는 정갈한 꽃차',
      en: 'Pure flower tea served at the Tea House guarded by White Tiger',
    },
    ingredients: {
      ko: ['국화', '매화', '백합'],
      en: ['Chrysanthemum', 'Plum blossom', 'Lily'],
    },
    benefits: {
      ko: ['마음 정화', '두통 완화', '눈 피로 해소'],
      en: ['Mind purification', 'Headache relief', 'Eye fatigue relief'],
    },
    brewingTip: {
      ko: '80°C 물에서 3분간 우려내세요',
      en: 'Brew in 80°C water for 3 minutes',
    },
    color: '#6B7280',
    emoji: '🌸',
  },
  water: {
    id: 'yeonip-cha',
    element: 'water',
    name: {
      ko: '연잎차',
      en: 'Lotus Leaf Tea',
      hanja: '蓮葉茶',
    },
    description: {
      ko: '현무가 수호하는 명당의 맑은 물로 우린 연잎차',
      en: 'Lotus leaf tea brewed with pure water from the Sacred Ground protected by Black Tortoise',
    },
    ingredients: {
      ko: ['연잎', '연꽃', '결명자'],
      en: ['Lotus leaf', 'Lotus flower', 'Cassia seed'],
    },
    benefits: {
      ko: ['마음 안정', '해독 효과', '수면 개선'],
      en: ['Mental calm', 'Detox effect', 'Sleep improvement'],
    },
    brewingTip: {
      ko: '85°C 물에서 5분간 우려내세요',
      en: 'Brew in 85°C water for 5 minutes',
    },
    color: '#1E3A5F',
    emoji: '🪷',
  },
};

/**
 * 주어진 오행에 해당하는 차 반환
 */
export function getElementalTea(element: ElementType): ElementalTea {
  return ELEMENTAL_TEAS[element];
}

/**
 * 모든 오행 차 배열 반환
 */
export function getAllElementalTeas(): ElementalTea[] {
  return Object.values(ELEMENTAL_TEAS);
}

/**
 * 오늘의 추천 차 (날짜 기반)
 */
export function getTodayRecommendedTea(): ElementalTea {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const elements: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const index = dayOfYear % 5;
  return ELEMENTAL_TEAS[elements[index]];
}
