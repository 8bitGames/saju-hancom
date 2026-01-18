/**
 * 청리움 성지 (Sacred Places) 데이터
 * 오방신이 각각 지키는 신성한 장소들
 */

import type { ElementType } from './guardians';

export interface SacredPlace {
  id: string;
  name: {
    ko: string;
    en: string;
    hanja: string;
  };
  element: ElementType;
  guardianId: ElementType;
  description: {
    ko: string;
    en: string;
  };
  features: {
    ko: string[];
    en: string[];
  };
  activities: {
    ko: string[];
    en: string[];
  };
  imagePath: string;
  ambientColor: string;
}

export const SACRED_PLACES: Record<ElementType, SacredPlace> = {
  wood: {
    id: 'nokcha-bat',
    name: {
      ko: '녹차밭',
      en: 'Green Tea Field',
      hanja: '綠茶田',
    },
    element: 'wood',
    guardianId: 'wood',
    description: {
      ko: '푸른 녹차밭에서 청룡이 새벽 순찰을 합니다. 성장과 새로운 시작의 기운이 가득합니다.',
      en: 'Azure Dragon patrols the green tea fields at dawn. Full of energy for growth and new beginnings.',
    },
    features: {
      ko: ['유기농 녹차밭', '아침 안개', '명상 공간'],
      en: ['Organic tea field', 'Morning mist', 'Meditation space'],
    },
    activities: {
      ko: ['차 따기 체험', '걷기 명상', '일출 감상'],
      en: ['Tea picking', 'Walking meditation', 'Sunrise viewing'],
    },
    imagePath: '/images/sacred-places/green-tea-field.jpg',
    ambientColor: '#2D5A27',
  },
  fire: {
    id: 'yongso',
    name: {
      ko: '용소',
      en: 'Dragon Pond',
      hanja: '龍沼',
    },
    element: 'fire',
    guardianId: 'fire',
    description: {
      ko: '주작이 깃든 용소에서 열정의 불꽃이 타오릅니다. 영감과 활력의 원천입니다.',
      en: "Vermilion Bird dwells at Dragon Pond where flames of passion burn. Source of inspiration and vitality.",
    },
    features: {
      ko: ['신비로운 연못', '불꽃 의식', '영감의 장소'],
      en: ['Mystical pond', 'Fire ceremony', 'Place of inspiration'],
    },
    activities: {
      ko: ['불꽃 명상', '소원 기도', '열정 의식'],
      en: ['Fire meditation', 'Wish prayer', 'Passion ritual'],
    },
    imagePath: '/images/sacred-places/dragon-pond.jpg',
    ambientColor: '#B91C1C',
  },
  earth: {
    id: 'yak-chowon',
    name: {
      ko: '약초원',
      en: 'Herb Garden',
      hanja: '藥草園',
    },
    element: 'earth',
    guardianId: 'earth',
    description: {
      ko: '황룡이 돌보는 약초원에서 대지의 치유 에너지가 피어납니다. 안정과 균형의 중심입니다.',
      en: "Yellow Dragon tends the herb garden where earth's healing energy blooms. Center of stability and balance.",
    },
    features: {
      ko: ['전통 약초', '치유 공간', '명상 정원'],
      en: ['Traditional herbs', 'Healing space', 'Meditation garden'],
    },
    activities: {
      ko: ['약초 채취', '힐링 명상', '자연 치유'],
      en: ['Herb picking', 'Healing meditation', 'Natural therapy'],
    },
    imagePath: '/images/sacred-places/herb-garden.jpg',
    ambientColor: '#C4A35A',
  },
  metal: {
    id: 'oha-sanbang',
    name: {
      ko: '오하산방',
      en: 'Tea House',
      hanja: '吾霞山房',
    },
    element: 'metal',
    guardianId: 'metal',
    description: {
      ko: '백호가 지키는 오하산방에서 정제된 차의 정수를 느껴보세요. 절제와 명료함의 공간입니다.',
      en: 'White Tiger guards the Tea House. Feel the essence of refined tea. A space of discipline and clarity.',
    },
    features: {
      ko: ['전통 다실', '차 의식', '서예 공간'],
      en: ['Traditional tea room', 'Tea ceremony', 'Calligraphy space'],
    },
    activities: {
      ko: ['다도 체험', '서예 명상', '정신 수련'],
      en: ['Tea ceremony', 'Calligraphy meditation', 'Mind training'],
    },
    imagePath: '/images/sacred-places/tea-house.jpg',
    ambientColor: '#6B7280',
  },
  water: {
    id: 'myeongdang-gidoteo',
    name: {
      ko: '명당 기도터',
      en: 'Sacred Ground',
      hanja: '明堂祈禱處',
    },
    element: 'water',
    guardianId: 'water',
    description: {
      ko: '현무가 수호하는 명당에서 맑은 기운을 받으세요. 지혜와 직관의 원천입니다.',
      en: 'Black Tortoise protects the Sacred Ground. Receive pure energy. Source of wisdom and intuition.',
    },
    features: {
      ko: ['명당 기운', '기도 공간', '에너지 힐링'],
      en: ['Feng shui energy', 'Prayer space', 'Energy healing'],
    },
    activities: {
      ko: ['소원 기도', '명상', '에너지 치유'],
      en: ['Wish prayer', 'Meditation', 'Energy healing'],
    },
    imagePath: '/images/sacred-places/sacred-ground.jpg',
    ambientColor: '#1E3A5F',
  },
};

/**
 * 주어진 오행에 해당하는 성지 반환
 */
export function getSacredPlace(element: ElementType): SacredPlace {
  return SACRED_PLACES[element];
}

/**
 * 모든 성지 배열 반환
 */
export function getAllSacredPlaces(): SacredPlace[] {
  return Object.values(SACRED_PLACES);
}
