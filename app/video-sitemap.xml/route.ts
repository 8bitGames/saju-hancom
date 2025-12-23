import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

interface VideoEntry {
  loc: string;
  video: {
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc: string;
    duration: number;
    publication_date: string;
    family_friendly: boolean;
    live: boolean;
    tag: string[];
  };
}

const videos: VideoEntry[] = [
  {
    loc: `${baseUrl}`,
    video: {
      thumbnail_loc: `${baseUrl}/images/saju-cover.jpg`,
      title: 'AI 사주팔자 분석 - 한사 AI',
      description: '인공지능 기반 정확한 사주팔자 분석. 생년월일시를 입력하면 AI가 당신의 운명을 분석해드립니다.',
      content_loc: `${baseUrl}/output-loop/saju-four-pillars-loop.mp4`,
      duration: 10,
      publication_date: '2024-01-01',
      family_friendly: true,
      live: false,
      tag: ['사주', '사주팔자', 'AI 운세', '운세 분석', '한사 AI'],
    },
  },
  {
    loc: `${baseUrl}`,
    video: {
      thumbnail_loc: `${baseUrl}/images/workplace-cover.jpg`,
      title: 'AI 궁합 분석 - 한사 AI',
      description: '인공지능이 분석하는 정확한 궁합. 연인, 친구, 동료와의 궁합을 확인해보세요.',
      content_loc: `${baseUrl}/output-loop/workplace-fortune-loop.mp4`,
      duration: 10,
      publication_date: '2024-01-01',
      family_friendly: true,
      live: false,
      tag: ['궁합', 'AI 궁합', '연애 궁합', '한사 AI'],
    },
  },
  {
    loc: `${baseUrl}`,
    video: {
      thumbnail_loc: `${baseUrl}/images/compatibility-cover.jpg`,
      title: 'AI 커플 운세 분석 - 한사 AI',
      description: '커플의 운세와 궁합을 AI가 분석합니다. 두 사람의 사주를 비교하여 궁합을 확인해보세요.',
      content_loc: `${baseUrl}/output-loop/love-compatibility-loop.mp4`,
      duration: 10,
      publication_date: '2024-01-01',
      family_friendly: true,
      live: false,
      tag: ['커플 운세', '연애 운세', '사랑 궁합', '한사 AI'],
    },
  },
  {
    loc: `${baseUrl}`,
    video: {
      thumbnail_loc: `${baseUrl}/images/face-reading-cover.jpg`,
      title: 'AI 관상 분석 - 한사 AI',
      description: '인공지능이 분석하는 관상. 얼굴 사진을 업로드하면 AI가 관상을 분석해드립니다.',
      content_loc: `${baseUrl}/output-loop/face-reading-loop.mp4`,
      duration: 10,
      publication_date: '2024-01-01',
      family_friendly: true,
      live: false,
      tag: ['관상', 'AI 관상', '얼굴 분석', '한사 AI'],
    },
  },
  {
    loc: `${baseUrl}`,
    video: {
      thumbnail_loc: `${baseUrl}/images/history-cover.jpg`,
      title: '분석 기록 - 한사 AI',
      description: '지금까지 분석한 사주, 궁합, 관상 결과를 확인하세요.',
      content_loc: `${baseUrl}/output-loop/saju-history-loop.mp4`,
      duration: 10,
      publication_date: '2024-01-01',
      family_friendly: true,
      live: false,
      tag: ['운세 기록', '분석 히스토리', '한사 AI'],
    },
  },
];

function generateVideoSitemap(): string {
  const videoEntries = videos
    .map(
      (entry) => `
  <url>
    <loc>${entry.loc}</loc>
    <video:video>
      <video:thumbnail_loc>${entry.video.thumbnail_loc}</video:thumbnail_loc>
      <video:title>${escapeXml(entry.video.title)}</video:title>
      <video:description>${escapeXml(entry.video.description)}</video:description>
      <video:content_loc>${entry.video.content_loc}</video:content_loc>
      <video:duration>${entry.video.duration}</video:duration>
      <video:publication_date>${entry.video.publication_date}</video:publication_date>
      <video:family_friendly>${entry.video.family_friendly ? 'yes' : 'no'}</video:family_friendly>
      <video:live>${entry.video.live ? 'yes' : 'no'}</video:live>
      ${entry.video.tag.map((t) => `<video:tag>${escapeXml(t)}</video:tag>`).join('\n      ')}
    </video:video>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const sitemap = generateVideoSitemap();

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
