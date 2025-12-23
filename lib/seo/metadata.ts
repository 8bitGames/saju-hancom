import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

// Type definition for page metadata
interface PageMetadataConfig {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage?: string;
}

// Page-specific metadata configurations
export const pageMetadata: Record<string, PageMetadataConfig> = {
  // Saju (Four Pillars) page
  saju: {
    title: 'AI 사주팔자 분석 - 무료 사주 풀이',
    description: '생년월일시를 입력하면 AI가 정확한 만세력 데이터로 사주팔자를 분석합니다. 천간, 지지, 오행 분석과 운세 풀이를 무료로 확인하세요.',
    keywords: ['사주팔자', '사주', '무료 사주', '사주 풀이', '만세력', '천간 지지', '오행', 'AI 사주'],
    canonical: '/saju',
    ogImage: '/images/og-cover-four-pillars.jpg',
  },

  // Compatibility (Workplace) page
  compatibility: {
    title: 'AI 직장 궁합 분석 - 동료와의 궁합',
    description: '직장 동료와의 사주 궁합을 AI가 분석합니다. 업무 스타일, 소통 방식, 협업 궁합을 확인하고 최적의 팀워크를 만들어보세요.',
    keywords: ['직장 궁합', '동료 궁합', '업무 궁합', '사주 궁합', 'AI 궁합', '팀 궁합'],
    canonical: '/compatibility',
    ogImage: '/images/og-cover-compatibility.jpg',
  },

  // Couple page
  couple: {
    title: 'AI 커플 궁합 분석 - 연인 궁합 테스트',
    description: '연인, 배우자와의 사주 궁합을 AI가 분석합니다. 천생연분 점수, 장단점 분석, 관계 개선 조언을 무료로 확인하세요.',
    keywords: ['커플 궁합', '연인 궁합', '결혼 궁합', '연애 궁합', '사주 궁합', '천생연분'],
    canonical: '/couple',
    ogImage: '/images/og-cover-couple.jpg',
  },

  // Face Reading page
  faceReading: {
    title: 'AI 관상 분석 - 얼굴로 보는 운세',
    description: '사진 한 장으로 관상을 분석합니다. AI가 얼굴 특징을 분석하여 성격, 재물운, 건강운, 인연운을 알려드립니다.',
    keywords: ['관상', '관상 분석', 'AI 관상', '얼굴 분석', '관상학', '얼굴 운세'],
    canonical: '/face-reading',
    ogImage: '/images/og-cover-face-reading.jpg',
  },

  // History page
  history: {
    title: '분석 기록 - 내 운세 히스토리',
    description: '지금까지 분석한 사주, 궁합, 관상 결과를 확인하세요. 모든 분석 기록이 저장되어 있습니다.',
    keywords: ['분석 기록', '사주 기록', '운세 히스토리'],
    canonical: '/history',
  },

  // Fortune (Daily) page
  fortune: {
    title: 'AI 전문 사주 분석 - 6단계 심층 분석',
    description: '6단계 AI 심층 분석으로 사주를 전문적으로 풀이합니다. 기본 분석부터 상세 분석까지 완벽한 사주 해석을 제공합니다.',
    keywords: ['전문 사주', '사주 심층 분석', '사주 풀이', '상세 사주', 'AI 사주 분석'],
    canonical: '/saju/fortune',
  },

  // Premium page
  premium: {
    title: '프리미엄 구독 - 무제한 분석',
    description: '한사 AI 프리미엄 구독으로 무제한 사주, 궁합, 관상 분석을 이용하세요. 광고 없는 프리미엄 경험을 제공합니다.',
    keywords: ['프리미엄', '구독', '무제한', '한사 AI 프리미엄'],
    canonical: '/premium',
  },

  // Profile page
  profile: {
    title: '내 프로필',
    description: '한사 AI 계정 설정과 구독 정보를 관리하세요.',
    keywords: ['프로필', '계정 설정', '구독 관리'],
    canonical: '/profile',
  },

  // Deck page
  deck: {
    title: '한사 AI 소개',
    description: '한사 AI 서비스 소개 자료입니다. AI 기반 운세 분석 서비스의 특징과 기능을 확인하세요.',
    keywords: ['한사 AI', '서비스 소개', 'AI 운세'],
    canonical: '/deck',
  },

  // Result pages
  sajuResult: {
    title: '사주 분석 결과',
    description: 'AI가 분석한 사주팔자 결과입니다. 천간, 지지, 오행의 조화와 운세 흐름을 확인하세요.',
    keywords: ['사주 결과', '사주 분석 결과', '사주 풀이 결과'],
    canonical: '/saju/result',
  },

  compatibilityResult: {
    title: '궁합 분석 결과',
    description: 'AI가 분석한 궁합 결과입니다. 두 사람의 사주 조화와 관계 특성을 확인하세요.',
    keywords: ['궁합 결과', '궁합 분석 결과', '사주 궁합 결과'],
    canonical: '/compatibility/result',
  },

  coupleResult: {
    title: '커플 궁합 결과',
    description: 'AI가 분석한 커플 궁합 결과입니다. 연인과의 천생연분 점수와 관계 조언을 확인하세요.',
    keywords: ['커플 궁합 결과', '연인 궁합 결과', '연애 궁합 결과'],
    canonical: '/couple/result',
  },

  faceReadingResult: {
    title: '관상 분석 결과',
    description: 'AI가 분석한 관상 결과입니다. 얼굴 특징에 따른 성격과 운세를 확인하세요.',
    keywords: ['관상 결과', '관상 분석 결과', '얼굴 분석 결과'],
    canonical: '/face-reading/result',
  },
};

// Generate metadata for a specific page
export function generatePageMetadata(
  pageKey: string,
  locale: string = 'ko',
  overrides?: Partial<Metadata>
): Metadata {
  const page = pageMetadata[pageKey];
  if (!page) {
    throw new Error(`Page metadata not found for key: ${pageKey}`);
  }
  const isKorean = locale === 'ko';
  const localePrefix = isKorean ? '' : `/${locale}`;
  const canonicalUrl = `${baseUrl}${localePrefix}${page.canonical}`;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ko-KR': `${baseUrl}${page.canonical}`,
        'en-US': `${baseUrl}/en${page.canonical}`,
        'x-default': `${baseUrl}${page.canonical}`,
      },
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      images: page.ogImage
        ? [
            {
              url: page.ogImage,
              width: 1200,
              height: 630,
              alt: page.title,
            },
          ]
        : undefined,
    },
    twitter: {
      title: page.title,
      description: page.description,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
    ...overrides,
  };
}

// Helper to generate metadata with locale param
export function createMetadataGenerator(pageKey: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    return generatePageMetadata(pageKey, locale);
  };
}
