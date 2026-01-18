/**
 * 오행 향기 블렌드 (Elemental Scent Blends)
 * 각 수호신의 기운을 담은 향기 조합
 */

import type { ElementType } from './guardians';

export interface ScentBlend {
  id: string;
  element: ElementType;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  notes: {
    top: {
      ko: string[];
      en: string[];
    };
    middle: {
      ko: string[];
      en: string[];
    };
    base: {
      ko: string[];
      en: string[];
    };
  };
  benefits: {
    ko: string[];
    en: string[];
  };
  color: string;
  emoji: string;
}

export const SCENT_BLENDS: Record<ElementType, ScentBlend> = {
  wood: {
    id: 'cheongryong-sup',
    element: 'wood',
    name: {
      ko: '청룡의 숲',
      en: "Azure Dragon's Forest",
    },
    description: {
      ko: '성장과 창의력을 깨우는 푸른 숲의 향기',
      en: 'Green forest scent awakening growth and creativity',
    },
    notes: {
      top: {
        ko: ['소나무', '녹차'],
        en: ['Pine', 'Green tea'],
      },
      middle: {
        ko: ['이끼', '대나무'],
        en: ['Moss', 'Bamboo'],
      },
      base: {
        ko: ['삼나무', '백단'],
        en: ['Cedar', 'Sandalwood'],
      },
    },
    benefits: {
      ko: ['집중력 향상', '창의력 증진', '새로운 시작'],
      en: ['Focus enhancement', 'Creativity boost', 'New beginnings'],
    },
    color: '#2D5A27',
    emoji: '🌲',
  },
  fire: {
    id: 'jujak-bulkkot',
    element: 'fire',
    name: {
      ko: '주작의 불꽃',
      en: "Vermilion Bird's Flame",
    },
    description: {
      ko: '열정과 활력을 불어넣는 따뜻한 향기',
      en: 'Warm scent igniting passion and vitality',
    },
    notes: {
      top: {
        ko: ['계피', '생강'],
        en: ['Cinnamon', 'Ginger'],
      },
      middle: {
        ko: ['정향', '카다멈'],
        en: ['Clove', 'Cardamom'],
      },
      base: {
        ko: ['바닐라', '앰버'],
        en: ['Vanilla', 'Amber'],
      },
    },
    benefits: {
      ko: ['열정 증진', '활력 충전', '동기 부여'],
      en: ['Passion boost', 'Energy recharge', 'Motivation'],
    },
    color: '#B91C1C',
    emoji: '🔥',
  },
  earth: {
    id: 'hwangryong-jeongwon',
    element: 'earth',
    name: {
      ko: '황룡의 정원',
      en: "Yellow Dragon's Garden",
    },
    description: {
      ko: '안정과 치유의 대지 향기',
      en: 'Earth scent of stability and healing',
    },
    notes: {
      top: {
        ko: ['백단', '꿀'],
        en: ['Sandalwood', 'Honey'],
      },
      middle: {
        ko: ['침향', '세이지'],
        en: ['Agarwood', 'Sage'],
      },
      base: {
        ko: ['머스크', '흙'],
        en: ['Musk', 'Earth'],
      },
    },
    benefits: {
      ko: ['안정감', '치유', '균형'],
      en: ['Stability', 'Healing', 'Balance'],
    },
    color: '#C4A35A',
    emoji: '🌿',
  },
  metal: {
    id: 'baekho-jeongje',
    element: 'metal',
    name: {
      ko: '백호의 정제',
      en: "White Tiger's Purity",
    },
    description: {
      ko: '맑고 깨끗한 정화의 향기',
      en: 'Clear and pure cleansing scent',
    },
    notes: {
      top: {
        ko: ['유향', '매화'],
        en: ['Frankincense', 'Plum blossom'],
      },
      middle: {
        ko: ['백합', '재스민'],
        en: ['Lily', 'Jasmine'],
      },
      base: {
        ko: ['백단', '머스크'],
        en: ['Sandalwood', 'Musk'],
      },
    },
    benefits: {
      ko: ['정화', '집중', '명료함'],
      en: ['Purification', 'Focus', 'Clarity'],
    },
    color: '#6B7280',
    emoji: '✨',
  },
  water: {
    id: 'hyeonmu-sinbi',
    element: 'water',
    name: {
      ko: '현무의 신비',
      en: "Black Tortoise's Mystery",
    },
    description: {
      ko: '깊은 지혜와 직관의 신비로운 향기',
      en: 'Mysterious scent of deep wisdom and intuition',
    },
    notes: {
      top: {
        ko: ['연꽃', '오미자'],
        en: ['Lotus', 'Schisandra'],
      },
      middle: {
        ko: ['해초', '물안개'],
        en: ['Seaweed', 'Water mist'],
      },
      base: {
        ko: ['앰버그리스', '머스크'],
        en: ['Ambergris', 'Musk'],
      },
    },
    benefits: {
      ko: ['직관력', '지혜', '내면 탐구'],
      en: ['Intuition', 'Wisdom', 'Inner exploration'],
    },
    color: '#1E3A5F',
    emoji: '🌊',
  },
};

/**
 * 주어진 오행에 해당하는 향기 블렌드 반환
 */
export function getScentBlend(element: ElementType): ScentBlend {
  return SCENT_BLENDS[element];
}

/**
 * 모든 향기 블렌드 배열 반환
 */
export function getAllScentBlends(): ScentBlend[] {
  return Object.values(SCENT_BLENDS);
}

/**
 * 향기 노트를 피라미드 형태로 포맷팅
 */
export function formatScentNotes(
  scent: ScentBlend,
  locale: 'ko' | 'en'
): string {
  const notes = scent.notes;
  return `Top: ${notes.top[locale].join(', ')} → Middle: ${notes.middle[locale].join(', ')} → Base: ${notes.base[locale].join(', ')}`;
}
