/**
 * Category Icons for Hellobot-style UI
 * Using icons from /public/icons/services/
 */

export interface CategoryIcon {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  imagePath: string;
  href: string;
  description?: {
    ko: string;
    en: string;
  };
  isNew?: boolean;
  isPopular?: boolean;
}

/**
 * Main service categories - displayed in the home page grid (top row)
 */
export const MAIN_CATEGORIES: CategoryIcon[] = [
  {
    id: 'saju',
    name: {
      ko: '정통사주',
      en: 'Saju Analysis',
    },
    imagePath: '/icons/services/정통사주.png',
    href: '/saju',
    description: {
      ko: '전문가 수준의 사주팔자 분석',
      en: 'Expert-level Four Pillars Analysis',
    },
    isPopular: true,
  },
  {
    id: 'compatibility',
    name: {
      ko: '연애중/궁합',
      en: 'Compatibility',
    },
    imagePath: '/icons/services/연애중·궁합.png',
    href: '/compatibility',
    description: {
      ko: '두 사람의 궁합 분석',
      en: 'Compatibility Analysis',
    },
  },
  {
    id: 'couple',
    name: {
      ko: '솔로/연애운',
      en: 'Love Fortune',
    },
    imagePath: '/icons/services/솔로·연애운.png',
    href: '/couple',
    description: {
      ko: '연애 운세 분석',
      en: 'Love Fortune Analysis',
    },
  },
  {
    id: 'face-reading',
    name: {
      ko: '관상',
      en: 'Face Reading',
    },
    imagePath: '/icons/services/관상.png',
    href: '/face-reading',
    description: {
      ko: 'AI 관상 분석',
      en: 'AI Face Reading',
    },
  },
];

/**
 * Secondary categories - displayed as additional options
 */
export const SECONDARY_CATEGORIES: CategoryIcon[] = [
  {
    id: 'today-fortune',
    name: {
      ko: '오늘의 운세',
      en: "Today's Fortune",
    },
    imagePath: '/icons/services/오늘의운세.png',
    href: '/saju/today-fortune',
    description: {
      ko: '오늘의 운세 확인',
      en: "Check Today's Fortune",
    },
    isPopular: true,
  },
  {
    id: 'tomorrow-fortune',
    name: {
      ko: '내일의 운세',
      en: "Tomorrow's Fortune",
    },
    imagePath: '/icons/services/내일의운세.png',
    href: '/saju/today-fortune?date=tomorrow',
    description: {
      ko: '내일의 운세 미리보기',
      en: "Preview Tomorrow's Fortune",
    },
  },
  {
    id: 'wealth',
    name: {
      ko: '재물/성공운',
      en: 'Wealth Fortune',
    },
    imagePath: '/icons/services/재물·성공운.png',
    href: '/saju?focus=wealth',
    description: {
      ko: '재물과 성공 운세',
      en: 'Wealth & Success Fortune',
    },
  },
  {
    id: 'career',
    name: {
      ko: '취업운세',
      en: 'Career Fortune',
    },
    imagePath: '/icons/services/취업운세.png',
    href: '/saju?focus=career',
    description: {
      ko: '취업과 직장 운세',
      en: 'Career & Job Fortune',
    },
  },
];

/**
 * More categories - fortune and divination services
 */
export const MORE_CATEGORIES: CategoryIcon[] = [
  {
    id: 'tarot',
    name: {
      ko: '타로',
      en: 'Tarot',
    },
    imagePath: '/icons/services/타로.png',
    href: '/tarot',
    description: {
      ko: '타로 카드 점',
      en: 'Tarot Card Reading',
    },
    isNew: true,
  },
  {
    id: 'dream',
    name: {
      ko: '꿈해몽',
      en: 'Dream Reading',
    },
    imagePath: '/icons/services/관상·손금·꿈해몽.png',
    href: '/dream',
    description: {
      ko: '꿈 해석 및 해몽',
      en: 'Dream Interpretation',
    },
  },
  {
    id: 'zodiac',
    name: {
      ko: '별자리운세',
      en: 'Zodiac Fortune',
    },
    imagePath: '/icons/services/별자리운세.png',
    href: '/zodiac',
    description: {
      ko: '별자리 운세',
      en: 'Zodiac Horoscope',
    },
  },
  {
    id: 'tojeong',
    name: {
      ko: '토정비결',
      en: 'Tojeong Oracle',
    },
    imagePath: '/icons/services/토정비결.png',
    href: '/tojeong',
    description: {
      ko: '토정비결 운세',
      en: 'Tojeong Prophecy',
    },
  },
];

/**
 * Premium/Special categories
 */
export const PREMIUM_CATEGORIES: CategoryIcon[] = [
  {
    id: 'new-year',
    name: {
      ko: '신년운세',
      en: 'New Year Fortune',
    },
    imagePath: '/icons/services/신년운세.png',
    href: '/saju?type=newyear',
    description: {
      ko: '2025년 신년운세',
      en: '2025 New Year Fortune',
    },
    isNew: true,
    isPopular: true,
  },
  {
    id: 'my-destiny',
    name: {
      ko: '나의 인연운세',
      en: 'Destiny Fortune',
    },
    imagePath: '/icons/services/나의인연운세.png',
    href: '/couple/destiny',
    description: {
      ko: '인연과 운명',
      en: 'Destiny & Connection',
    },
  },
  {
    id: 'psychology',
    name: {
      ko: '심리분석',
      en: 'Psychology',
    },
    imagePath: '/icons/services/심리분석.png',
    href: '/psychology',
    description: {
      ko: 'AI 심리 분석',
      en: 'AI Psychology Analysis',
    },
    isNew: true,
  },
  {
    id: 'past-life',
    name: {
      ko: '전생운',
      en: 'Past Life',
    },
    imagePath: '/icons/services/전생운.png',
    href: '/past-life',
    description: {
      ko: '전생 분석',
      en: 'Past Life Reading',
    },
  },
];

/**
 * Relationship categories
 */
export const RELATIONSHIP_CATEGORIES: CategoryIcon[] = [
  {
    id: 'crush',
    name: {
      ko: '짝사랑/썸',
      en: 'Crush',
    },
    imagePath: '/icons/services/짝사랑·썸.png',
    href: '/couple/crush',
    description: {
      ko: '짝사랑과 썸 분석',
      en: 'Crush & Flirtation Analysis',
    },
  },
  {
    id: 'celeb-match',
    name: {
      ko: '연예인궁합',
      en: 'Celebrity Match',
    },
    imagePath: '/icons/services/연예인궁합.png',
    href: '/compatibility/celeb',
    description: {
      ko: '연예인과의 궁합',
      en: 'Celebrity Compatibility',
    },
  },
  {
    id: 'breakup',
    name: {
      ko: '이별/재회',
      en: 'Breakup/Reunion',
    },
    imagePath: '/icons/services/이별·재회.png',
    href: '/couple/breakup',
    description: {
      ko: '이별 후 재회 가능성',
      en: 'Breakup & Reunion Analysis',
    },
  },
  {
    id: 'pair-match',
    name: {
      ko: '짝궁합',
      en: 'Pair Match',
    },
    imagePath: '/icons/services/짝궁합.png',
    href: '/compatibility/pair',
    description: {
      ko: '두 사람의 짝궁합',
      en: 'Pair Matching Analysis',
    },
  },
];

/**
 * Fun/Entertainment categories
 */
export const FUN_CATEGORIES: CategoryIcon[] = [
  {
    id: 'fortune-cookie',
    name: {
      ko: '포춘쿠키',
      en: 'Fortune Cookie',
    },
    imagePath: '/icons/services/포춘쿠키.png',
    href: '/fortune-cookie',
    description: {
      ko: '오늘의 행운 메시지',
      en: "Today's Lucky Message",
    },
  },
  {
    id: 'lucky-number',
    name: {
      ko: '행운의 번호',
      en: 'Lucky Numbers',
    },
    imagePath: '/icons/services/행운의번호.png',
    href: '/lucky-number',
    description: {
      ko: '나만의 행운 번호',
      en: 'Your Lucky Numbers',
    },
  },
  {
    id: 'lucky-charm',
    name: {
      ko: '행운의 부적',
      en: 'Lucky Charm',
    },
    imagePath: '/icons/services/행운의부적.png',
    href: '/lucky-charm',
    description: {
      ko: '나만의 부적 만들기',
      en: 'Create Your Lucky Charm',
    },
  },
  {
    id: 'todays-outfit',
    name: {
      ko: '오늘의 복',
      en: "Today's Lucky Outfit",
    },
    imagePath: '/icons/services/오늘의복.png',
    href: '/todays-outfit',
    description: {
      ko: '오늘의 행운 복장',
      en: "Today's Lucky Outfit",
    },
  },
];

/**
 * All categories combined
 */
export const ALL_CATEGORIES: CategoryIcon[] = [
  ...MAIN_CATEGORIES,
  ...SECONDARY_CATEGORIES,
  ...MORE_CATEGORIES,
  ...PREMIUM_CATEGORIES,
  ...RELATIONSHIP_CATEGORIES,
  ...FUN_CATEGORIES,
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): CategoryIcon | undefined {
  return ALL_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get popular categories
 */
export function getPopularCategories(): CategoryIcon[] {
  return ALL_CATEGORIES.filter((cat) => cat.isPopular);
}

/**
 * Get new categories
 */
export function getNewCategories(): CategoryIcon[] {
  return ALL_CATEGORIES.filter((cat) => cat.isNew);
}
