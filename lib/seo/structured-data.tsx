import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cheonggiun.ai.kr';

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: '청기운',
    alternateName: ['Cheonggiun', 'HansaAI', '한사AI'],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'AI 기반의 사주, 궁합, 관상 분석 서비스. 정확한 사주팔자 풀이와 맞춤형 운세 가이드를 제공합니다.',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Korean', 'English'],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema with SearchAction for AEO
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: '청기운',
    alternateName: 'Cheonggiun - AI Fortune Analysis',
    description: 'AI 기반의 사주, 궁합, 관상 분석으로 당신의 운명을 알아보세요.',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    inLanguage: ['ko-KR', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/saju?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebApplication Schema
export function WebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${baseUrl}/#webapp`,
    name: '청기운',
    url: baseUrl,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      description: '무료 기본 서비스 제공, 프리미엄 기능 구독 가능',
    },
    featureList: [
      'AI 사주팔자 분석',
      'AI 궁합 분석',
      'AI 관상 분석',
      '커플 궁합',
      '오늘의 운세',
      '다국어 지원 (한국어, 영어)',
    ],
    screenshot: `${baseUrl}/images/og-cover-four-pillars.jpg`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <Script
      id="webapp-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service Schemas for each feature
export function ServicesSchema() {
  const services = [
    {
      '@type': 'Service',
      '@id': `${baseUrl}/saju/#service`,
      name: 'AI 사주팔자 분석',
      alternateName: 'AI Four Pillars Analysis',
      description: '생년월일시를 기반으로 사주팔자를 분석하고 운명의 흐름을 파악합니다. AI가 정확한 만세력 데이터를 기반으로 상세한 분석을 제공합니다.',
      url: `${baseUrl}/saju`,
      provider: {
        '@id': `${baseUrl}/#organization`,
      },
      serviceType: 'Fortune Telling',
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 37.5665,
          longitude: 126.978,
        },
        geoRadius: '10000000',
      },
    },
    {
      '@type': 'Service',
      '@id': `${baseUrl}/compatibility/#service`,
      name: 'AI 동료 궁합 분석',
      alternateName: 'AI Colleague Compatibility Analysis',
      description: '동료와의 궁합을 분석하여 최적의 협업 방법과 관계 개선 방안을 제시합니다.',
      url: `${baseUrl}/compatibility`,
      provider: {
        '@id': `${baseUrl}/#organization`,
      },
      serviceType: 'Compatibility Analysis',
    },
    {
      '@type': 'Service',
      '@id': `${baseUrl}/couple/#service`,
      name: 'AI 커플 궁합 분석',
      alternateName: 'AI Couple Compatibility Analysis',
      description: '연인 또는 배우자와의 궁합을 분석하여 관계의 강점과 개선점을 알려드립니다.',
      url: `${baseUrl}/couple`,
      provider: {
        '@id': `${baseUrl}/#organization`,
      },
      serviceType: 'Compatibility Analysis',
    },
    {
      '@type': 'Service',
      '@id': `${baseUrl}/face-reading/#service`,
      name: 'AI 관상 분석',
      alternateName: 'AI Face Reading Analysis',
      description: '얼굴 사진을 분석하여 관상학적 특징과 성격, 운세를 파악합니다.',
      url: `${baseUrl}/face-reading`,
      provider: {
        '@id': `${baseUrl}/#organization`,
      },
      serviceType: 'Face Reading',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': services,
  };

  return (
    <Script
      id="services-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema
export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '청기운는 어떤 서비스인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '청기운는 AI 기술을 활용하여 사주팔자, 궁합, 관상 분석을 제공하는 서비스입니다. 정확한 만세력 데이터를 기반으로 개인 맞춤형 운세 분석을 제공합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '사주 분석에 필요한 정보는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '사주 분석을 위해서는 생년월일과 출생 시간이 필요합니다. 정확한 시간을 모르는 경우에도 분석이 가능하지만, 시간을 알면 더 정확한 분석이 가능합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '궁합 분석은 어떻게 이루어지나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '두 사람의 사주팔자를 AI가 분석하여 천간, 지지, 오행의 상생상극 관계를 파악하고, 전반적인 궁합과 관계 개선 방안을 제시합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '관상 분석은 어떻게 작동하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '얼굴 사진을 업로드하면 AI가 관상학적 특징을 분석하여 성격, 재물운, 건강운 등을 파악하고 상세한 분석 결과를 제공합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '청기운는 무료인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '기본적인 사주, 궁합, 관상 분석은 무료로 제공됩니다. 더 상세한 분석과 추가 기능은 프리미엄 구독을 통해 이용하실 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'AI 운세 분석의 정확도는 어떤가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '청기운는 정확한 만세력 데이터와 전통 명리학 이론을 기반으로 분석합니다. AI 기술을 통해 일관되고 객관적인 분석을 제공하며, 지속적으로 정확도를 개선하고 있습니다.',
        },
      },
    ],
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema Generator
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Video Schema for carousel videos
export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  contentUrl,
  uploadDate,
  duration,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  uploadDate: string;
  duration?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    contentUrl,
    uploadDate,
    duration: duration || 'PT10S',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };

  return (
    <Script
      id={`video-schema-${name.replace(/\s+/g, '-').toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Home Page Video List Schema
export function HomeVideoListSchema() {
  const videos = [
    {
      name: 'AI 사주팔자 분석',
      description: 'AI가 분석하는 정확한 사주팔자 풀이',
      thumbnailUrl: `${baseUrl}/images/og-cover-four-pillars.jpg`,
      contentUrl: `${baseUrl}/output-loop/saju-four-pillars-loop.mp4`,
    },
    {
      name: 'AI 궁합 분석',
      description: '직장 동료와의 궁합을 AI가 분석합니다',
      thumbnailUrl: `${baseUrl}/images/og-cover-compatibility.jpg`,
      contentUrl: `${baseUrl}/output-loop/workplace-fortune-loop.mp4`,
    },
    {
      name: 'AI 커플 궁합',
      description: '연인과의 궁합을 AI로 분석해보세요',
      thumbnailUrl: `${baseUrl}/images/og-cover-couple.jpg`,
      contentUrl: `${baseUrl}/output-loop/love-compatibility-loop.mp4`,
    },
    {
      name: 'AI 관상 분석',
      description: '얼굴 사진으로 운명을 분석합니다',
      thumbnailUrl: `${baseUrl}/images/og-cover-face-reading.jpg`,
      contentUrl: `${baseUrl}/output-loop/face-reading-loop.mp4`,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.map((video, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        name: video.name,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        contentUrl: video.contentUrl,
        uploadDate: '2024-12-01',
        duration: 'PT10S',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
      },
    })),
  };

  return (
    <Script
      id="home-video-list-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined Schema for Homepage
export function HomePageSchema() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <WebApplicationSchema />
      <ServicesSchema />
      <FAQSchema />
      <HomeVideoListSchema />
    </>
  );
}

// SoftwareApplication Schema for App-like experience
export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '청기운',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  };

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Speakable Schema for Voice Search / AEO
export function SpeakableSchema({
  headline,
  summary,
  cssSelectors = ['article', 'main'],
}: {
  headline: string;
  summary: string;
  cssSelectors?: string[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: headline,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
    abstract: summary,
  };

  return (
    <Script
      id="speakable-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
