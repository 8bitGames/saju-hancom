/**
 * PDF generation utilities for Saju results
 * Supports Korean text through browser print dialog
 */

export interface SajuPDFData {
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  result: any;
}

// ============================================================================
// Translation Helpers - 번역 도우미
// ============================================================================

const translateElement = (element: string): string => {
  const elementMap: Record<string, string> = {
    'wood': '목(木)',
    'fire': '화(火)',
    'earth': '토(土)',
    'metal': '금(金)',
    'water': '수(水)',
    'Wood': '목(木)',
    'Fire': '화(火)',
    'Earth': '토(土)',
    'Metal': '금(金)',
    'Water': '수(水)',
  };
  return elementMap[element] || element;
};

const translateElementShort = (element: string): string => {
  const elementMap: Record<string, string> = {
    'wood': '목',
    'fire': '화',
    'earth': '토',
    'metal': '금',
    'water': '수',
  };
  return elementMap[element.toLowerCase()] || element;
};

const translateBalance = (balance: string): string => {
  const balanceMap: Record<string, string> = {
    'balanced': '균형',
    'unbalanced': '불균형',
    'strong': '강함',
    'weak': '약함',
    'very strong': '매우 강함',
    'very weak': '매우 약함',
  };
  return balanceMap[balance] || balance;
};

const translateYinYang = (yinyang: string): string => {
  return yinyang === 'yang' ? '양(陽)' : '음(陰)';
};

const translatePillarLabel = (label: string): string => {
  const labelMap: Record<string, string> = {
    'year': '년주(年柱)',
    'month': '월주(月柱)',
    'day': '일주(日柱)',
    'time': '시주(時柱)',
  };
  return labelMap[label] || label;
};

const translatePillarLabelShort = (label: string): string => {
  const labelMap: Record<string, string> = {
    'year': '년주',
    'month': '월주',
    'day': '일주',
    'time': '시주',
  };
  return labelMap[label] || label;
};

const translateStarType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'auspicious': '길신(吉神)',
    'inauspicious': '흉신(凶神)',
    'neutral': '중립',
  };
  return typeMap[type] || type;
};

const translateTenGod = (code: string): string => {
  const tenGodMap: Record<string, string> = {
    'bijian': '비견(比肩)',
    'gebjae': '겁재(劫財)',
    'siksin': '식신(食神)',
    'sanggwan': '상관(傷官)',
    'pyeonjae': '편재(偏財)',
    'jeongjae': '정재(正財)',
    'pyeongwan': '편관(偏官)',
    'jeonggwan': '정관(正官)',
    'pyeonin': '편인(偏印)',
    'jeongin': '정인(正印)',
  };
  return tenGodMap[code] || code;
};

const translateTenGodShort = (code: string): string => {
  const tenGodMap: Record<string, string> = {
    'bijian': '비견',
    'gebjae': '겁재',
    'siksin': '식신',
    'sanggwan': '상관',
    'pyeonjae': '편재',
    'jeongjae': '정재',
    'pyeongwan': '편관',
    'jeonggwan': '정관',
    'pyeonin': '편인',
    'jeongin': '정인',
  };
  return tenGodMap[code] || code;
};

// Ten God categories for PDF display
const tenGodCategories = [
  { label: '비겁 (자아)', gods: ['bijian', 'gebjae'] },
  { label: '식상 (표현)', gods: ['siksin', 'sanggwan'] },
  { label: '재성 (재물)', gods: ['pyeonjae', 'jeongjae'] },
  { label: '관성 (명예)', gods: ['pyeongwan', 'jeonggwan'] },
  { label: '인성 (학문)', gods: ['pyeonin', 'jeongin'] },
];

/**
 * Generate HTML for PDF and trigger print dialog
 * Fully Korean localized with comprehensive saju data display
 */
export function generatePDFHTML(data: SajuPDFData): string {
  const { birthData, result } = data;

  // Helper to safely get pillar hidden stems
  const getHiddenStems = (pillar: any) => {
    if (!pillar) return '';
    const hiddenGan = pillar.zhiHiddenGan || pillar.hiddenGan || [];
    return Array.isArray(hiddenGan) && hiddenGan.length > 0 ? hiddenGan.join(', ') : '없음';
  };

  // Helper to get element score display
  const getElementScoreBar = (score: number, maxScore: number = 100) => {
    const percentage = Math.min((score / maxScore) * 100, 100);
    return `<div style="background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;"><div style="background: #a855f7; height: 100%; width: ${percentage}%;"></div></div>`;
  };

  // Build ten god summary HTML if available
  const buildTenGodSummaryHTML = () => {
    if (!result.tenGodSummary) return '';

    const summary = result.tenGodSummary;
    const counts = summary.counts || {};

    return `
    <div class="section">
      <div class="section-title">십성 분석 (十星分析)</div>

      <!-- Ten God Grid -->
      <div style="margin-bottom: 15px;">
        ${tenGodCategories.map(category => `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 6px; font-weight: 600;">${category.label}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
              ${category.gods.map((godCode: string) => {
                const count = counts[godCode] || 0;
                const isDominant = summary.dominant?.includes(godCode);
                const isLacking = summary.lacking?.includes(godCode);
                const borderStyle = isDominant ? 'border: 2px solid #22c55e;' : isLacking ? 'opacity: 0.6;' : '';

                return `
                  <div style="padding: 8px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb; ${borderStyle}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 600; font-size: 11px;">${translateTenGodShort(godCode)}</span>
                      <span style="font-weight: 700; color: ${count > 0 ? '#a855f7' : '#999'}; font-size: 12px;">${count}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Dominant and Lacking Summary -->
      ${(summary.dominant?.length > 0 || summary.lacking?.length > 0) ? `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        ${summary.dominant?.length > 0 ? `
        <div>
          <div style="font-size: 10px; color: #666; margin-bottom: 4px;">주요 십성</div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${summary.dominant.map((god: string) => `
              <span style="padding: 2px 8px; background: rgba(34, 197, 94, 0.15); color: #16a34a; border-radius: 10px; font-size: 10px; font-weight: 500;">${translateTenGodShort(god)}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}
        ${summary.lacking?.length > 0 ? `
        <div>
          <div style="font-size: 10px; color: #666; margin-bottom: 4px;">부재 십성</div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${summary.lacking.map((god: string) => `
              <span style="padding: 2px 8px; background: rgba(249, 115, 22, 0.15); color: #ea580c; border-radius: 10px; font-size: 10px; font-weight: 500;">${translateTenGodShort(god)}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
    `;
  };

  // Build stars HTML with proper Korean labels
  const buildStarsHTML = () => {
    const stars = result.stars || [];
    if (stars.length === 0) return '';

    return `
    <div class="section">
      <div class="section-title">신살 (神殺) - ${stars.length}개</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        ${stars.map((star: any) => {
          const typeColor = star.type === 'auspicious' ? '#16a34a' : star.type === 'inauspicious' ? '#dc2626' : '#666';
          const typeBg = star.type === 'auspicious' ? '#f0fdf4' : star.type === 'inauspicious' ? '#fef2f2' : '#f9fafb';
          const positionLabel = star.position ? translatePillarLabelShort(star.position) : '';

          return `
            <div style="padding: 10px; background: ${typeBg}; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                <span style="font-weight: 600; font-size: 12px; color: #1a1a1a;">${star.name}${star.hanja ? ` (${star.hanja})` : ''}</span>
                <span style="font-size: 9px; color: ${typeColor}; font-weight: 500;">${translateStarType(star.type || 'neutral')}</span>
              </div>
              ${positionLabel ? `<div style="font-size: 9px; color: #999; margin-bottom: 4px;">${positionLabel}</div>` : ''}
              ${star.description ? `<div style="font-size: 10px; color: #666; line-height: 1.4;">${star.description}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hansa AI - 사주 분석 결과</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 20mm;
      background: white;
      color: #1a1a1a;
      width: 210mm;
      min-height: 297mm;
      font-size: 10pt;
      line-height: 1.5;
    }
    .logo {
      text-align: center;
      margin-bottom: 15px;
    }
    .logo h1 {
      font-size: 28px;
      font-weight: bold;
      color: #a855f7;
      margin-bottom: 5px;
    }
    .logo p {
      font-size: 11px;
      color: #999;
      letter-spacing: 1px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #a855f7;
    }
    .header h2 {
      font-size: 20px;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }
    .section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #a855f7;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    .pillars {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 15px 0;
    }
    .pillar {
      text-align: center;
      padding: 12px 8px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    }
    .pillar-label {
      font-size: 9px;
      color: #666;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .pillar-chars {
      font-size: 22px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .pillar-detail {
      font-size: 9px;
      color: #666;
      line-height: 1.4;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .info-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
    }
    .info-label {
      font-size: 10px;
      color: #666;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
      word-break: keep-all;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    .footer p {
      margin: 3px 0;
    }
    .footer .brand {
      margin-top: 8px;
      color: #a855f7;
      font-weight: 600;
      font-size: 11px;
    }
    @media print {
      body { padding: 15mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="logo">
    <h1>Hansa AI</h1>
    <p>AI 기반 사주 분석 시스템</p>
  </div>

  <div class="header">
    <h2>사주 분석 결과</h2>
    <p>${birthData.year}년 ${birthData.month}월 ${birthData.day}일 ${birthData.hour}시 ${birthData.minute}분 (${birthData.gender === 'male' ? '남성' : '여성'})</p>
    <p>${birthData.isLunar ? '음력' : '양력'} | ${birthData.city}</p>
    ${result.meta ? `
    <p style="font-size: 10px; color: #999; margin-top: 4px;">
      양력: ${result.meta.solarDate || ''} | 진태양시: ${result.meta.trueSolarTime || ''}
      ${result.meta.offsetMinutes !== undefined ? ` (${result.meta.offsetMinutes > 0 ? '+' : ''}${result.meta.offsetMinutes}분 보정)` : ''}
    </p>
    ` : ''}
  </div>

  <!-- 사주팔자 Section -->
  <div class="section">
    <div class="section-title">사주팔자 (四柱八字)</div>
    <div class="pillars">
      <div class="pillar">
        <div class="pillar-label">시주 (時柱)</div>
        <div class="pillar-chars">${result.pillars?.time?.ganZhi || ''}</div>
        <div class="pillar-detail">
          ${result.pillars?.time?.gan || ''} / ${result.pillars?.time?.zhi || ''}<br>
          <span style="color: #999;">지장간: ${getHiddenStems(result.pillars?.time)}</span>
        </div>
      </div>
      <div class="pillar">
        <div class="pillar-label">일주 (日柱)</div>
        <div class="pillar-chars">${result.pillars?.day?.ganZhi || ''}</div>
        <div class="pillar-detail">
          ${result.pillars?.day?.gan || ''} / ${result.pillars?.day?.zhi || ''}<br>
          <span style="color: #999;">지장간: ${getHiddenStems(result.pillars?.day)}</span>
        </div>
      </div>
      <div class="pillar">
        <div class="pillar-label">월주 (月柱)</div>
        <div class="pillar-chars">${result.pillars?.month?.ganZhi || ''}</div>
        <div class="pillar-detail">
          ${result.pillars?.month?.gan || ''} / ${result.pillars?.month?.zhi || ''}<br>
          <span style="color: #999;">지장간: ${getHiddenStems(result.pillars?.month)}</span>
        </div>
      </div>
      <div class="pillar">
        <div class="pillar-label">년주 (年柱)</div>
        <div class="pillar-chars">${result.pillars?.year?.ganZhi || ''}</div>
        <div class="pillar-detail">
          ${result.pillars?.year?.gan || ''} / ${result.pillars?.year?.zhi || ''}<br>
          <span style="color: #999;">지장간: ${getHiddenStems(result.pillars?.year)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 일간 분석 Section -->
  <div class="section">
    <div class="section-title">일간 분석 (日干分析)</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">일간 (日干)</div>
        <div class="info-value" style="font-size: 16px;">${result.dayMaster || '없음'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">오행 (五行)</div>
        <div class="info-value">${result.dayMasterElement ? translateElement(result.dayMasterElement) : '없음'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">음양 (陰陽)</div>
        <div class="info-value">${result.dayMasterYinYang ? translateYinYang(result.dayMasterYinYang) : '없음'}</div>
      </div>
      <div class="info-item" style="grid-column: 1 / -1;">
        <div class="info-label">일간 해석</div>
        <div class="info-value" style="font-weight: normal;">${result.dayMasterDescription || '없음'}</div>
      </div>
    </div>
  </div>

  <!-- 오행 분석 Section -->
  <div class="section">
    <div class="section-title">오행 분석 (五行分析)</div>

    ${result.elementAnalysis?.scores ? `
    <!-- Element Score Bars -->
    <div style="margin-bottom: 15px;">
      <div style="font-size: 11px; font-weight: 600; margin-bottom: 8px; color: #666;">오행 분포</div>
      <div style="display: grid; gap: 8px;">
        ${['wood', 'fire', 'earth', 'metal', 'water'].map(el => {
          const score = result.elementAnalysis.scores[el] || 0;
          const maxScore = Math.max(...Object.values(result.elementAnalysis.scores as Record<string, number>), 1);
          const percentage = Math.round((score / maxScore) * 100);
          const isDominant = result.elementAnalysis.dominant?.includes(el);
          const isLacking = result.elementAnalysis.lacking?.includes(el);

          return `
            <div style="display: grid; grid-template-columns: 60px 1fr 30px; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: ${isDominant ? '700' : '500'}; color: ${isDominant ? '#a855f7' : isLacking ? '#999' : '#1a1a1a'};">${translateElementShort(el)}(${el.charAt(0).toUpperCase()})</span>
              <div style="background: #e5e7eb; border-radius: 4px; height: 10px; overflow: hidden;">
                <div style="background: ${isDominant ? '#a855f7' : isLacking ? '#d1d5db' : '#8b5cf6'}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
              </div>
              <span style="font-size: 10px; color: #666; text-align: right;">${score}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">오행 균형 상태</div>
        <div class="info-value">${result.elementAnalysis?.balance ? translateBalance(result.elementAnalysis.balance) : '없음'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">주도 오행 (강한 기운)</div>
        <div class="info-value">${result.elementAnalysis?.dominant ? (Array.isArray(result.elementAnalysis.dominant) ? result.elementAnalysis.dominant.map(translateElement).join(', ') : translateElement(result.elementAnalysis.dominant)) : '없음'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">부족 오행 (약한 기운)</div>
        <div class="info-value">${result.elementAnalysis?.lacking ? (Array.isArray(result.elementAnalysis.lacking) ? result.elementAnalysis.lacking.map(translateElement).join(', ') : translateElement(result.elementAnalysis.lacking)) : '없음'}</div>
      </div>
      ${result.elementAnalysis?.yongShin ? `
      <div class="info-item">
        <div class="info-label">용신 (用神) - 필요한 오행</div>
        <div class="info-value" style="color: #16a34a;">${translateElement(result.elementAnalysis.yongShin)}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- 십성 분석 Section -->
  ${buildTenGodSummaryHTML()}

  <!-- 신살 Section -->
  ${buildStarsHTML()}

  ${result.personality ? `
  <div class="section">
    <div class="section-title">성격 및 기질 분석</div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
      ${result.personality.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.fullAnalysis ? `
  <div class="section">
    <div class="section-title">종합 분석</div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
      ${result.fullAnalysis.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.majorFortune || result.lifePeriods || result.daeun ? `
  <div class="section">
    <div class="section-title">대운 (大運) - 인생 주기</div>
    ${result.majorFortune?.periods && Array.isArray(result.majorFortune.periods) ? `
      <div style="margin-bottom: 8px; font-size: 10px; color: #666;">
        대운 시작 나이: ${result.majorFortune.startAge}세 | 방향: ${result.majorFortune.direction === 'forward' ? '순행' : '역행'}
      </div>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">나이</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">대운 간지</th>
            </tr>
          </thead>
          <tbody>
            ${result.majorFortune.periods.slice(0, 8).map((period: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; white-space: nowrap;">${period.startAge || ''}-${period.endAge || ''}세</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600; font-size: 12px;">${period.pillar?.ganZhi || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : result.daeun && Array.isArray(result.daeun) ? `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">시기 (나이)</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">대운 간지</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">운세 특징</th>
            </tr>
          </thead>
          <tbody>
            ${result.daeun.map((period: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; white-space: nowrap;">${period.startAge || ''}-${period.endAge || ''}세</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600; font-size: 11px;">${period.ganZhi || period.pillar || ''}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; line-height: 1.5;">${period.description || period.analysis || period.fortune || '해석 없음'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : result.lifePeriods ? `
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
        ${result.lifePeriods.replace(/\n/g, '<br>')}
      </div>
    ` : ''}
  </div>
  ` : ''}

  ${result.careerAnalysis ? `
  <div class="section">
    <div class="section-title">직업운 (職業運)</div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
      ${result.careerAnalysis.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.wealthAnalysis ? `
  <div class="section">
    <div class="section-title">재물운 (財物運)</div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
      ${result.wealthAnalysis.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.relationshipAnalysis ? `
  <div class="section">
    <div class="section-title">인간관계운 (人間關係運)</div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
      ${result.relationshipAnalysis.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.healthAnalysis ? `
  <div class="section">
    <div class="section-title">건강운 (健康運)</div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; line-height: 1.8; font-size: 11px;">
      ${result.healthAnalysis.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.strengths || result.weaknesses ? `
  <div class="section">
    <div class="section-title">장단점 분석</div>
    ${result.strengths ? `
    <div style="margin-bottom: 12px;">
      <div style="font-weight: 600; color: #16a34a; margin-bottom: 6px; font-size: 12px;">강점</div>
      <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; border-left: 3px solid #16a34a; font-size: 11px; line-height: 1.6;">
        ${result.strengths.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}
    ${result.weaknesses ? `
    <div>
      <div style="font-weight: 600; color: #dc2626; margin-bottom: 6px; font-size: 12px;">약점 및 주의사항</div>
      <div style="background: #fef2f2; padding: 12px; border-radius: 6px; border-left: 3px solid #dc2626; font-size: 11px; line-height: 1.6;">
        ${result.weaknesses.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${result.recommendations || result.advice ? `
  <div class="section">
    <div class="section-title">조언 및 권장사항</div>
    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6; line-height: 1.8; font-size: 11px;">
      ${(result.recommendations || result.advice).replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  ${result.luckyColors || result.luckyDirections || result.luckyNumbers || result.luckyItems ? `
  <div class="section">
    <div class="section-title">길운 정보 (吉運情報)</div>
    <div class="info-grid">
      ${result.luckyColors ? `
      <div class="info-item">
        <div class="info-label">행운의 색상</div>
        <div class="info-value">${Array.isArray(result.luckyColors) ? result.luckyColors.join(', ') : result.luckyColors}</div>
      </div>
      ` : ''}
      ${result.luckyDirections ? `
      <div class="info-item">
        <div class="info-label">행운의 방향</div>
        <div class="info-value">${Array.isArray(result.luckyDirections) ? result.luckyDirections.join(', ') : result.luckyDirections}</div>
      </div>
      ` : ''}
      ${result.luckyNumbers ? `
      <div class="info-item">
        <div class="info-label">행운의 숫자</div>
        <div class="info-value">${Array.isArray(result.luckyNumbers) ? result.luckyNumbers.join(', ') : result.luckyNumbers}</div>
      </div>
      ` : ''}
      ${result.luckyItems ? `
      <div class="info-item">
        <div class="info-label">행운의 아이템</div>
        <div class="info-value">${Array.isArray(result.luckyItems) ? result.luckyItems.join(', ') : result.luckyItems}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.</p>
    <p>개인의 운명은 노력과 선택에 의해 얼마든지 바뀔 수 있습니다.</p>
    <p style="margin-top: 8px;">생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p class="brand">Powered by Hansa AI</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download PDF using browser print dialog
 */
export async function downloadPDF(data: SajuPDFData, filename: string = 'hansa-ai-saju-report.pdf') {
  console.log('[PDF] Starting PDF generation...', { filename });

  try {
    // Generate HTML content
    const htmlContent = generatePDFHTML(data);
    console.log('[PDF] HTML generated, length:', htmlContent.length);

    // Create a new window with the content
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }

    // Write the HTML content
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load
    printWindow.onload = () => {
      console.log('[PDF] Content loaded, triggering print dialog');

      // Small delay to ensure rendering is complete
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened');
      }, 250);
    };

    // If onload doesn't fire, use a fallback
    setTimeout(() => {
      if (printWindow.document.readyState === 'complete') {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened (fallback)');
      }
    }, 500);

  } catch (error) {
    console.error('[PDF] ❌ PDF generation error:', error);
    console.error('[PDF] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Legacy function - kept for backwards compatibility
 */
export function printToPDF(data: SajuPDFData, filename?: string) {
  return downloadPDF(data, filename);
}

// ============================================================================
// Couple Compatibility PDF Generator
// ============================================================================

export interface CoupleCompatibilityPDFData {
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  result: any;
  relationType?: string;
}

const translateRelationType = (type?: string): string => {
  const typeMap: Record<string, string> = {
    'dating': '연인',
    'engaged': '약혼자',
    'married': '배우자',
    'interested': '관심 상대',
    'exPartner': '전 연인',
  };
  return typeMap[type || ''] || '연인';
};

const translateCompatibilityGrade = (grade: string): string => {
  const gradeMap: Record<string, string> = {
    'soulmate': '천생연분',
    'excellent': '최고',
    'good': '좋음',
    'normal': '보통',
    'challenging': '도전',
  };
  return gradeMap[grade] || grade;
};

/**
 * Generate HTML for Couple Compatibility PDF
 */
export function generateCoupleCompatibilityPDFHTML(data: CoupleCompatibilityPDFData): string {
  const { person1, person2, result, relationType } = data;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#ec4899';
    if (score >= 60) return '#f472b6';
    if (score >= 40) return '#666';
    return '#f97316';
  };

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hansa AI - 커플 궁합 분석 결과</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 20mm;
      background: white;
      color: #1a1a1a;
      width: 210mm;
      min-height: 297mm;
      font-size: 10pt;
      line-height: 1.5;
    }
    .logo {
      text-align: center;
      margin-bottom: 15px;
    }
    .logo h1 {
      font-size: 28px;
      font-weight: bold;
      color: #ec4899;
      margin-bottom: 5px;
    }
    .logo p {
      font-size: 11px;
      color: #999;
      letter-spacing: 1px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #ec4899;
    }
    .header h2 {
      font-size: 20px;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }
    .section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #ec4899;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #fce7f3;
    }
    .score-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto 15px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-circle span {
      font-size: 36px;
      font-weight: bold;
      color: white;
    }
    .pillars-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 15px;
      align-items: center;
      margin-bottom: 15px;
    }
    .person-pillars {
      background: #fdf2f8;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #fce7f3;
    }
    .person-name {
      font-weight: 600;
      font-size: 12px;
      color: #ec4899;
      margin-bottom: 8px;
      text-align: center;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .pillar {
      text-align: center;
      padding: 8px 4px;
      background: white;
      border-radius: 6px;
      border: 1px solid #fce7f3;
    }
    .pillar-label {
      font-size: 9px;
      color: #999;
      margin-bottom: 4px;
    }
    .pillar-chars {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .heart-divider {
      font-size: 24px;
      color: #ec4899;
      text-align: center;
    }
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .analysis-item {
      padding: 10px;
      background: #fdf2f8;
      border-radius: 6px;
      border: 1px solid #fce7f3;
    }
    .analysis-label {
      font-size: 11px;
      font-weight: 600;
      color: #ec4899;
      margin-bottom: 4px;
    }
    .analysis-score {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .analysis-desc {
      font-size: 10px;
      color: #666;
      line-height: 1.4;
    }
    .element-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .element-item {
      text-align: center;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .element-name {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .element-scores {
      font-size: 10px;
      color: #666;
    }
    .advice-list {
      list-style: none;
      padding: 0;
    }
    .advice-list li {
      padding: 8px 0 8px 25px;
      position: relative;
      font-size: 11px;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .advice-list li:last-child {
      border-bottom: none;
    }
    .advice-list li::before {
      content: "✓";
      position: absolute;
      left: 5px;
      color: #22c55e;
      font-weight: bold;
    }
    .caution-list li::before {
      content: "⚠";
      color: #f97316;
    }
    .lucky-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .lucky-tag {
      padding: 4px 12px;
      background: rgba(236, 72, 153, 0.1);
      color: #ec4899;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 500;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #fce7f3;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    .footer p {
      margin: 3px 0;
    }
    .footer .brand {
      margin-top: 8px;
      color: #ec4899;
      font-weight: 600;
      font-size: 11px;
    }
    @media print {
      body { padding: 15mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="logo">
    <h1>Hansa AI</h1>
    <p>AI 기반 커플 궁합 분석</p>
  </div>

  <div class="header">
    <h2>커플 궁합 분석 결과</h2>
    <p>${person1.name}님과 ${person2.name}님의 ${translateRelationType(relationType)} 궁합</p>
  </div>

  <!-- Total Score -->
  <div class="section" style="text-align: center;">
    <div class="score-circle">
      <span>${result.score || 0}</span>
    </div>
    <div style="display: inline-block; padding: 8px 20px; background: rgba(236, 72, 153, 0.1); border-radius: 20px; color: #ec4899; font-weight: bold; font-size: 14px;">
      ❤️ ${result.gradeText || translateCompatibilityGrade(result.grade || '')}
    </div>
  </div>

  <!-- Two Person Pillars -->
  <div class="section">
    <div class="section-title">두 사람의 사주팔자</div>
    <div class="pillars-container">
      <!-- Person 1 -->
      <div class="person-pillars">
        <div class="person-name">${person1.name}</div>
        <div class="pillars-grid">
          ${['year', 'month', 'day', 'time'].map(pillar => {
            const p = result.person1Pillars?.[pillar] || {};
            return `
              <div class="pillar">
                <div class="pillar-label">${pillar === 'year' ? '년' : pillar === 'month' ? '월' : pillar === 'day' ? '일' : '시'}</div>
                <div class="pillar-chars">${p.gan || ''}${p.zhi || ''}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 10px; color: #666;">
          ${person1.year}년 ${person1.month}월 ${person1.day}일 (${person1.gender === 'male' ? '남' : '여'})
        </div>
      </div>

      <!-- Heart Divider -->
      <div class="heart-divider">❤️</div>

      <!-- Person 2 -->
      <div class="person-pillars">
        <div class="person-name">${person2.name}</div>
        <div class="pillars-grid">
          ${['year', 'month', 'day', 'time'].map(pillar => {
            const p = result.person2Pillars?.[pillar] || {};
            return `
              <div class="pillar">
                <div class="pillar-label">${pillar === 'year' ? '년' : pillar === 'month' ? '월' : pillar === 'day' ? '일' : '시'}</div>
                <div class="pillar-chars">${p.gan || ''}${p.zhi || ''}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 10px; color: #666;">
          ${person2.year}년 ${person2.month}월 ${person2.day}일 (${person2.gender === 'male' ? '남' : '여'})
        </div>
      </div>
    </div>
  </div>

  <!-- Analysis Categories -->
  ${result.analysis ? `
  <div class="section">
    <div class="section-title">관계 분석</div>
    <div class="analysis-grid">
      ${[
        { key: 'romance', label: '연애운', icon: '💕' },
        { key: 'communication', label: '소통', icon: '💬' },
        { key: 'passion', label: '열정', icon: '🔥' },
        { key: 'stability', label: '안정성', icon: '🏠' },
        { key: 'future', label: '미래', icon: '✨' },
      ].map(({ key, label, icon }) => {
        const data = result.analysis[key];
        if (!data) return '';
        return `
          <div class="analysis-item">
            <div class="analysis-label">${icon} ${label}</div>
            <div class="analysis-score" style="color: ${getScoreColor(data.score)};">${data.score}점</div>
            <div class="analysis-desc">${data.description || ''}</div>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Element Balance -->
  ${result.elementBalance ? `
  <div class="section">
    <div class="section-title">오행 균형</div>
    <div class="element-grid">
      ${['wood', 'fire', 'earth', 'metal', 'water'].map(element => {
        const elementNames: Record<string, string> = {
          wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)'
        };
        const elementColors: Record<string, string> = {
          wood: '#22c55e', fire: '#ef4444', earth: '#eab308', metal: '#94a3b8', water: '#3b82f6'
        };
        const p1Score = result.elementBalance.person1?.[element] || 0;
        const p2Score = result.elementBalance.person2?.[element] || 0;
        return `
          <div class="element-item" style="border-color: ${elementColors[element]};">
            <div class="element-name" style="color: ${elementColors[element]};">${elementNames[element]}</div>
            <div class="element-scores">${p1Score} vs ${p2Score}</div>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Lucky Elements -->
  ${result.luckyElements && result.luckyElements.length > 0 ? `
  <div class="section">
    <div class="section-title">💖 행운의 오행</div>
    <div class="lucky-tags">
      ${result.luckyElements.map((element: string) => {
        const elementNames: Record<string, string> = {
          wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)'
        };
        return `<span class="lucky-tag">${elementNames[element] || element}</span>`;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Relationship Advice -->
  ${result.relationshipAdvice && result.relationshipAdvice.length > 0 ? `
  <div class="section">
    <div class="section-title" style="color: #22c55e;">✓ 관계 조언</div>
    <ul class="advice-list">
      ${result.relationshipAdvice.map((advice: string) => `<li>${advice}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Cautions -->
  ${result.cautions && result.cautions.length > 0 ? `
  <div class="section">
    <div class="section-title" style="color: #f97316;">⚠ 주의 사항</div>
    <ul class="advice-list caution-list">
      ${result.cautions.map((caution: string) => `<li>${caution}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.</p>
    <p>두 분의 관계는 서로의 노력과 이해로 더욱 발전할 수 있습니다.</p>
    <p style="margin-top: 8px;">생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p class="brand">Powered by Hansa AI</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download Couple Compatibility PDF using browser print dialog
 */
export async function downloadCoupleCompatibilityPDF(
  data: CoupleCompatibilityPDFData,
  filename: string = 'hansa-ai-couple-compatibility.pdf'
) {
  console.log('[PDF] Starting Couple Compatibility PDF generation...', { filename });

  try {
    const htmlContent = generateCoupleCompatibilityPDFHTML(data);
    console.log('[PDF] HTML generated, length:', htmlContent.length);

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      console.log('[PDF] Content loaded, triggering print dialog');
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened');
      }, 250);
    };

    setTimeout(() => {
      if (printWindow.document.readyState === 'complete') {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened (fallback)');
      }
    }, 500);

  } catch (error) {
    console.error('[PDF] ❌ Couple Compatibility PDF generation error:', error);
    throw error;
  }
}

// ============================================================================
// General Compatibility PDF Generator (Business/Professional)
// ============================================================================

export interface CompatibilityPDFData {
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  result: any;
  relationType?: string;
}

const translateGeneralRelationType = (type?: string): string => {
  const typeMap: Record<string, string> = {
    'colleague': '동료',
    'supervisor': '선배',
    'subordinate': '후배',
    'partner': '파트너',
    'client': '고객',
    'mentor': '멘토',
    'mentee': '멘티',
    'friend': '친구',
    'family': '가족',
  };
  return typeMap[type || ''] || '동료';
};

/**
 * Generate HTML for General Compatibility PDF (Business/Professional)
 */
export function generateCompatibilityPDFHTML(data: CompatibilityPDFData): string {
  const { person1, person2, result, relationType } = data;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#666';
    return '#f97316';
  };

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hansa AI - 궁합 분석 결과</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 20mm;
      background: white;
      color: #1a1a1a;
      width: 210mm;
      min-height: 297mm;
      font-size: 10pt;
      line-height: 1.5;
    }
    .logo {
      text-align: center;
      margin-bottom: 15px;
    }
    .logo h1 {
      font-size: 28px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .logo p {
      font-size: 11px;
      color: #999;
      letter-spacing: 1px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #3b82f6;
    }
    .header h2 {
      font-size: 20px;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }
    .section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #dbeafe;
    }
    .score-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto 15px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-circle span {
      font-size: 36px;
      font-weight: bold;
      color: white;
    }
    .pillars-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 15px;
      align-items: center;
      margin-bottom: 15px;
    }
    .person-pillars {
      background: #eff6ff;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #dbeafe;
    }
    .person-name {
      font-weight: 600;
      font-size: 12px;
      color: #3b82f6;
      margin-bottom: 8px;
      text-align: center;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .pillar {
      text-align: center;
      padding: 8px 4px;
      background: white;
      border-radius: 6px;
      border: 1px solid #dbeafe;
    }
    .pillar-label {
      font-size: 9px;
      color: #999;
      margin-bottom: 4px;
    }
    .pillar-chars {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .handshake-divider {
      font-size: 24px;
      color: #3b82f6;
      text-align: center;
    }
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .analysis-item {
      padding: 10px;
      background: #eff6ff;
      border-radius: 6px;
      border: 1px solid #dbeafe;
    }
    .analysis-label {
      font-size: 11px;
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 4px;
    }
    .analysis-score {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .analysis-desc {
      font-size: 10px;
      color: #666;
      line-height: 1.4;
    }
    .element-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .element-item {
      text-align: center;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .element-name {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .element-scores {
      font-size: 10px;
      color: #666;
    }
    .advice-list {
      list-style: none;
      padding: 0;
    }
    .advice-list li {
      padding: 8px 0 8px 25px;
      position: relative;
      font-size: 11px;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .advice-list li:last-child {
      border-bottom: none;
    }
    .advice-list li::before {
      content: "✓";
      position: absolute;
      left: 5px;
      color: #22c55e;
      font-weight: bold;
    }
    .caution-list li::before {
      content: "⚠";
      color: #f97316;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #dbeafe;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    .footer p {
      margin: 3px 0;
    }
    .footer .brand {
      margin-top: 8px;
      color: #3b82f6;
      font-weight: 600;
      font-size: 11px;
    }
    @media print {
      body { padding: 15mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="logo">
    <h1>Hansa AI</h1>
    <p>AI 기반 궁합 분석</p>
  </div>

  <div class="header">
    <h2>궁합 분석 결과</h2>
    <p>${person1.name}님과 ${person2.name}님의 ${translateGeneralRelationType(relationType)} 궁합</p>
  </div>

  <!-- Total Score -->
  <div class="section" style="text-align: center;">
    <div class="score-circle">
      <span>${result.score || 0}</span>
    </div>
    <div style="display: inline-block; padding: 8px 20px; background: rgba(59, 130, 246, 0.1); border-radius: 20px; color: #3b82f6; font-weight: bold; font-size: 14px;">
      🤝 ${result.gradeText || ''}
    </div>
  </div>

  <!-- Two Person Pillars -->
  <div class="section">
    <div class="section-title">두 사람의 사주팔자</div>
    <div class="pillars-container">
      <!-- Person 1 -->
      <div class="person-pillars">
        <div class="person-name">${person1.name}</div>
        <div class="pillars-grid">
          ${['year', 'month', 'day', 'time'].map(pillar => {
            const p = result.person1Pillars?.[pillar] || {};
            return `
              <div class="pillar">
                <div class="pillar-label">${pillar === 'year' ? '년' : pillar === 'month' ? '월' : pillar === 'day' ? '일' : '시'}</div>
                <div class="pillar-chars">${p.gan || ''}${p.zhi || ''}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 10px; color: #666;">
          ${person1.year}년 ${person1.month}월 ${person1.day}일 (${person1.gender === 'male' ? '남' : '여'})
        </div>
      </div>

      <!-- Handshake Divider -->
      <div class="handshake-divider">🤝</div>

      <!-- Person 2 -->
      <div class="person-pillars">
        <div class="person-name">${person2.name}</div>
        <div class="pillars-grid">
          ${['year', 'month', 'day', 'time'].map(pillar => {
            const p = result.person2Pillars?.[pillar] || {};
            return `
              <div class="pillar">
                <div class="pillar-label">${pillar === 'year' ? '년' : pillar === 'month' ? '월' : pillar === 'day' ? '일' : '시'}</div>
                <div class="pillar-chars">${p.gan || ''}${p.zhi || ''}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 10px; color: #666;">
          ${person2.year}년 ${person2.month}월 ${person2.day}일 (${person2.gender === 'male' ? '남' : '여'})
        </div>
      </div>
    </div>
  </div>

  <!-- Analysis Categories -->
  ${result.analysis ? `
  <div class="section">
    <div class="section-title">관계 분석</div>
    <div class="analysis-grid">
      ${[
        { key: 'communication', label: '소통', icon: '💬' },
        { key: 'collaboration', label: '협업', icon: '🤝' },
        { key: 'trust', label: '신뢰', icon: '💖' },
        { key: 'growth', label: '성장', icon: '✨' },
      ].map(({ key, label, icon }) => {
        const analysisData = result.analysis[key];
        if (!analysisData) return '';
        return `
          <div class="analysis-item">
            <div class="analysis-label">${icon} ${label}</div>
            <div class="analysis-score" style="color: ${getScoreColor(analysisData.score)};">${analysisData.score}점</div>
            <div class="analysis-desc">${analysisData.description || ''}</div>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Element Balance -->
  ${result.elementBalance ? `
  <div class="section">
    <div class="section-title">오행 균형</div>
    <div class="element-grid">
      ${['wood', 'fire', 'earth', 'metal', 'water'].map(element => {
        const elementNames: Record<string, string> = {
          wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)'
        };
        const elementColors: Record<string, string> = {
          wood: '#22c55e', fire: '#ef4444', earth: '#eab308', metal: '#94a3b8', water: '#3b82f6'
        };
        const p1Score = result.elementBalance.person1?.[element] || 0;
        const p2Score = result.elementBalance.person2?.[element] || 0;
        return `
          <div class="element-item" style="border-color: ${elementColors[element]};">
            <div class="element-name" style="color: ${elementColors[element]};">${elementNames[element]}</div>
            <div class="element-scores">${p1Score} vs ${p2Score}</div>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Relationship Advice -->
  ${result.relationshipAdvice && result.relationshipAdvice.length > 0 ? `
  <div class="section">
    <div class="section-title" style="color: #22c55e;">✓ 관계 조언</div>
    <ul class="advice-list">
      ${result.relationshipAdvice.map((advice: string) => `<li>${advice}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Cautions -->
  ${result.cautions && result.cautions.length > 0 ? `
  <div class="section">
    <div class="section-title" style="color: #f97316;">⚠ 주의 사항</div>
    <ul class="advice-list caution-list">
      ${result.cautions.map((caution: string) => `<li>${caution}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.</p>
    <p>두 분의 관계는 서로의 노력과 이해로 더욱 발전할 수 있습니다.</p>
    <p style="margin-top: 8px;">생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p class="brand">Powered by Hansa AI</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download General Compatibility PDF using browser print dialog
 */
export async function downloadCompatibilityPDF(
  data: CompatibilityPDFData,
  filename: string = 'hansa-ai-compatibility.pdf'
) {
  console.log('[PDF] Starting Compatibility PDF generation...', { filename });

  try {
    const htmlContent = generateCompatibilityPDFHTML(data);
    console.log('[PDF] HTML generated, length:', htmlContent.length);

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      console.log('[PDF] Content loaded, triggering print dialog');
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened');
      }, 250);
    };

    setTimeout(() => {
      if (printWindow.document.readyState === 'complete') {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened (fallback)');
      }
    }, 500);

  } catch (error) {
    console.error('[PDF] ❌ Compatibility PDF generation error:', error);
    throw error;
  }
}

// ============================================================================
// Professional Saju Pipeline PDF Generator (6-Step Analysis)
// ============================================================================

import type { SajuPipelineResult } from "@/lib/saju/pipeline-types";

export interface PipelinePDFData {
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  result: SajuPipelineResult;
  detailAnalyses?: Record<string, string>;
}

// Simple Markdown to HTML converter for detail analyses
const markdownToHTML = (markdown: string): string => {
  if (!markdown) return '';

  return markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h4 style="font-size: 12px; font-weight: bold; color: #a855f7; margin: 12px 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size: 14px; font-weight: bold; color: #1a1a1a; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #a855f7;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="font-size: 16px; font-weight: bold; color: #1a1a1a; margin: 18px 0 12px 0;">$1</h2>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li style="margin: 4px 0; padding-left: 8px;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin: 4px 0; padding-left: 8px;">$2</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.6;">')
    // Single newlines to <br>
    .replace(/\n/g, '<br>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>.*?<\/li>)(\s*<li)/g, '$1$2')
    // Wrap in paragraph
    .split('</p><p')
    .join('</p><p')
    .replace(/^(?!<)/, '<p style="margin: 8px 0; line-height: 1.6;">')
    .replace(/(?<![>])$/, '</p>');
};

// Category labels for detail analyses
const detailCategoryLabels: Record<string, { title: string; icon: string; color: string }> = {
  dayMaster: { title: '일간 상세 분석', icon: '👤', color: '#a855f7' },
  tenGods: { title: '십성 상세 분석', icon: '⭐', color: '#f97316' },
  stars: { title: '신살 상세 분석', icon: '✨', color: '#22c55e' },
  fortune: { title: '운세 상세 분석', icon: '🔮', color: '#3b82f6' },
  career: { title: '직업운 상세 분석', icon: '💼', color: '#06b6d4' },
  relationship: { title: '대인관계 상세 분석', icon: '💕', color: '#ec4899' },
  health: { title: '건강운 상세 분석', icon: '❤️', color: '#ef4444' },
  wealth: { title: '재물운 상세 분석', icon: '💰', color: '#eab308' },
};

const getGradeText = (grade: string): string => {
  const gradeMap: Record<string, string> = {
    'excellent': '매우 좋음',
    'good': '좋음',
    'normal': '보통',
    'caution': '주의',
    'challenging': '도전',
  };
  return gradeMap[grade] || grade;
};

const getGradeColor = (grade: string): string => {
  const colorMap: Record<string, string> = {
    'excellent': '#a855f7',
    'good': '#22c55e',
    'normal': '#3b82f6',
    'caution': '#f97316',
    'challenging': '#ef4444',
  };
  return colorMap[grade] || '#666';
};

/**
 * Generate HTML for Professional Saju Pipeline PDF (6-Step Analysis)
 */
export function generatePipelinePDFHTML(data: PipelinePDFData): string {
  const { birthData, result } = data;
  const { step1, step2, step3, step4, step5, step6 } = result;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hansa AI - 전문 사주 분석 결과</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 15mm;
      background: white;
      color: #1a1a1a;
      width: 210mm;
      min-height: 297mm;
      font-size: 9pt;
      line-height: 1.4;
    }
    .logo {
      text-align: center;
      margin-bottom: 12px;
    }
    .logo h1 {
      font-size: 24px;
      font-weight: bold;
      color: #a855f7;
      margin-bottom: 3px;
    }
    .logo p {
      font-size: 10px;
      color: #999;
      letter-spacing: 1px;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 12px;
      border-bottom: 2px solid #a855f7;
    }
    .header h2 {
      font-size: 18px;
      color: #1a1a1a;
      margin-bottom: 6px;
    }
    .header p {
      font-size: 11px;
      color: #666;
      line-height: 1.4;
    }
    .score-box {
      text-align: center;
      padding: 15px;
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
      border-radius: 12px;
      margin-bottom: 15px;
      color: white;
    }
    .score-box .score {
      font-size: 42px;
      font-weight: bold;
    }
    .score-box .grade {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
    .score-box .summary {
      font-size: 11px;
      opacity: 0.85;
      margin-top: 8px;
      line-height: 1.5;
    }
    .section {
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: bold;
      color: #a855f7;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    .pillars {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin: 10px 0;
    }
    .pillar {
      text-align: center;
      padding: 10px 6px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    }
    .pillar-label {
      font-size: 9px;
      color: #666;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .pillar-chars {
      font-size: 20px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .pillar-detail {
      font-size: 8px;
      color: #666;
      line-height: 1.3;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .info-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .info-item {
      padding: 8px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
    }
    .info-label {
      font-size: 9px;
      color: #666;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 11px;
      font-weight: 600;
      color: #1a1a1a;
      word-break: keep-all;
    }
    .area-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
    }
    .area-item {
      text-align: center;
      padding: 8px 4px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .area-score {
      font-size: 18px;
      font-weight: bold;
      color: #a855f7;
    }
    .area-label {
      font-size: 9px;
      color: #666;
      margin-top: 2px;
    }
    .area-grade {
      font-size: 8px;
      padding: 1px 6px;
      border-radius: 8px;
      display: inline-block;
      margin-top: 3px;
    }
    .insight-list {
      list-style: none;
      padding: 0;
    }
    .insight-list li {
      padding: 5px 0 5px 20px;
      position: relative;
      font-size: 10px;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .insight-list li:last-child {
      border-bottom: none;
    }
    .insight-list li::before {
      content: "💡";
      position: absolute;
      left: 0;
      font-size: 10px;
    }
    .strength-weakness {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .strength-box {
      padding: 10px;
      background: #f0fdf4;
      border-radius: 8px;
      border: 1px solid #bbf7d0;
    }
    .weakness-box {
      padding: 10px;
      background: #fef2f2;
      border-radius: 8px;
      border: 1px solid #fecaca;
    }
    .box-title {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .box-list {
      font-size: 9px;
      line-height: 1.5;
      color: #666;
    }
    .stars-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    .star-item {
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .star-name {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 3px;
    }
    .star-desc {
      font-size: 9px;
      color: #666;
      line-height: 1.4;
    }
    .advice-section {
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .advice-title {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .advice-list {
      font-size: 9px;
      line-height: 1.5;
      color: #333;
    }
    .advice-list li {
      margin-bottom: 3px;
      padding-left: 12px;
      position: relative;
    }
    .advice-list li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: #a855f7;
    }
    .lucky-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .lucky-item {
      text-align: center;
      padding: 8px;
      background: #fef3c7;
      border-radius: 6px;
      border: 1px solid #fde68a;
    }
    .lucky-label {
      font-size: 8px;
      color: #92400e;
      margin-bottom: 2px;
    }
    .lucky-value {
      font-size: 10px;
      font-weight: 600;
      color: #78350f;
    }
    .page-break {
      page-break-before: always;
    }
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #999;
    }
    .footer p {
      margin: 2px 0;
    }
    .footer .brand {
      margin-top: 6px;
      color: #a855f7;
      font-weight: 600;
      font-size: 10px;
    }
    @media print {
      body { padding: 12mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="logo">
    <h1>Hansa AI</h1>
    <p>AI 기반 전문 사주 분석</p>
  </div>

  <div class="header">
    <h2>전문 사주 분석 결과 (6단계 심층 분석)</h2>
    <p>${birthData.year}년 ${birthData.month}월 ${birthData.day}일 ${birthData.hour}시 ${birthData.minute}분 (${birthData.gender === 'male' ? '남성' : '여성'}, ${birthData.isLunar ? '음력' : '양력'})</p>
  </div>

  <!-- 종합 점수 -->
  <div class="score-box">
    <div class="score">${step6.overallScore}점</div>
    <div class="grade">${step6.gradeText}</div>
    <div class="summary">${step6.summary}</div>
  </div>

  <!-- 사주 원국 -->
  <div class="section">
    <div class="section-title">📜 사주팔자 (四柱八字)</div>
    <div class="pillars">
      <div class="pillar">
        <div class="pillar-label">시주 (時柱)</div>
        <div class="pillar-chars">${step1.pillars.time.stem}${step1.pillars.time.branch}</div>
        <div class="pillar-detail">${step1.pillars.time.stemKorean} ${step1.pillars.time.branchKorean}</div>
      </div>
      <div class="pillar">
        <div class="pillar-label">일주 (日柱)</div>
        <div class="pillar-chars">${step1.pillars.day.stem}${step1.pillars.day.branch}</div>
        <div class="pillar-detail">${step1.pillars.day.stemKorean} ${step1.pillars.day.branchKorean}</div>
      </div>
      <div class="pillar">
        <div class="pillar-label">월주 (月柱)</div>
        <div class="pillar-chars">${step1.pillars.month.stem}${step1.pillars.month.branch}</div>
        <div class="pillar-detail">${step1.pillars.month.stemKorean} ${step1.pillars.month.branchKorean}</div>
      </div>
      <div class="pillar">
        <div class="pillar-label">년주 (年柱)</div>
        <div class="pillar-chars">${step1.pillars.year.stem}${step1.pillars.year.branch}</div>
        <div class="pillar-detail">${step1.pillars.year.stemKorean} ${step1.pillars.year.branchKorean}</div>
      </div>
    </div>
  </div>

  <!-- 영역별 점수 -->
  <div class="section">
    <div class="section-title">📊 영역별 분석</div>
    <div class="area-grid">
      ${Object.entries(step6.areas).map(([key, area]) => {
        const areaNames: Record<string, string> = {
          personality: '성격',
          career: '직업',
          wealth: '재물',
          relationship: '관계',
          health: '건강',
        };
        return `
          <div class="area-item">
            <div class="area-score">${area.score}</div>
            <div class="area-label">${areaNames[key]}</div>
            <div class="area-grade" style="background: ${getGradeColor(area.grade)}20; color: ${getGradeColor(area.grade)};">
              ${getGradeText(area.grade)}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>

  <!-- 핵심 인사이트 -->
  <div class="section">
    <div class="section-title">💡 핵심 인사이트</div>
    <ul class="insight-list">
      ${step6.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
    </ul>
  </div>

  <!-- 강점 & 주의점 -->
  <div class="section">
    <div class="strength-weakness">
      <div class="strength-box">
        <div class="box-title" style="color: #16a34a;">✓ 강점</div>
        <div class="box-list">
          ${step6.topStrengths.map(s => `• ${s}`).join('<br>')}
        </div>
      </div>
      <div class="weakness-box">
        <div class="box-title" style="color: #dc2626;">⚠ 주의점</div>
        <div class="box-list">
          ${step6.areasToWatch.map(s => `• ${s}`).join('<br>')}
        </div>
      </div>
    </div>
  </div>

  <!-- 일간 분석 -->
  <div class="section">
    <div class="section-title">👤 일간 분석</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">일간</div>
        <div class="info-value" style="font-size: 16px; color: #a855f7;">${step2.dayMaster} (${step2.dayMasterKorean})</div>
      </div>
      <div class="info-item">
        <div class="info-label">오행</div>
        <div class="info-value">${step2.dayMasterElement}</div>
      </div>
      <div class="info-item">
        <div class="info-label">신강/신약</div>
        <div class="info-value" style="color: #a855f7;">${step2.bodyStrength}</div>
      </div>
      <div class="info-item">
        <div class="info-label">월령</div>
        <div class="info-value">${step2.monthlyInfluence}</div>
      </div>
    </div>
    <div style="margin-top: 8px;">
      <div class="info-item">
        <div class="info-label">일간 특성</div>
        <div class="info-value" style="font-weight: normal; font-size: 10px;">${step2.characteristics.join(', ')}</div>
      </div>
    </div>
    <div class="info-grid-3" style="margin-top: 8px;">
      <div class="info-item" style="background: #eff6ff; border-color: #bfdbfe;">
        <div class="info-label" style="color: #3b82f6;">용신</div>
        <div class="info-value" style="color: #3b82f6;">${step2.usefulGod.primary} (${step2.usefulGod.primaryElement})</div>
      </div>
      <div class="info-item" style="background: #f0fdf4; border-color: #bbf7d0;">
        <div class="info-label" style="color: #22c55e;">희신</div>
        <div class="info-value" style="color: #22c55e;">${step2.usefulGod.supporting} (${step2.usefulGod.supportingElement})</div>
      </div>
      <div class="info-item" style="background: #fef2f2; border-color: #fecaca;">
        <div class="info-label" style="color: #ef4444;">기신</div>
        <div class="info-value" style="color: #ef4444;">${step2.usefulGod.avoiding} (${step2.usefulGod.avoidingElement})</div>
      </div>
    </div>
  </div>

  <!-- 오행 분석 -->
  <div class="section">
    <div class="section-title">🔥 오행 분석</div>
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px;">
      ${['wood', 'fire', 'earth', 'metal', 'water'].map(el => {
        const score = step1.elementScores[el as keyof typeof step1.elementScores];
        const names: Record<string, string> = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' };
        const colors: Record<string, string> = { wood: '#22c55e', fire: '#ef4444', earth: '#eab308', metal: '#94a3b8', water: '#3b82f6' };
        const isDominant = step1.dominantElements.some(e => e.toLowerCase().includes(el) || e.includes(names[el].charAt(0)));
        return `
          <div style="text-align: center; padding: 8px; background: ${colors[el]}10; border-radius: 6px; border: 1px solid ${colors[el]}30;">
            <div style="font-size: 10px; color: ${colors[el]}; font-weight: 600;">${names[el]}</div>
            <div style="font-size: 16px; font-weight: bold; color: ${colors[el]};">${score}%</div>
            ${isDominant ? '<div style="font-size: 8px; color: #a855f7;">강</div>' : ''}
          </div>
        `;
      }).join('')}
    </div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">강한 오행</div>
        <div class="info-value" style="color: #22c55e;">${step1.dominantElements.join(', ') || '없음'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">부족한 오행</div>
        <div class="info-value" style="color: #f97316;">${step1.lackingElements.join(', ') || '없음'}</div>
      </div>
    </div>
  </div>

  <!-- 십성 분석 -->
  <div class="section">
    <div class="section-title">⭐ 십성 분석</div>
    <div class="info-grid">
      <div class="info-item" style="background: #faf5ff; border-color: #e9d5ff;">
        <div class="info-label">격국</div>
        <div class="info-value" style="font-size: 14px; color: #a855f7;">${step3.structure}</div>
      </div>
      <div class="info-item">
        <div class="info-label">주요 십성</div>
        <div class="info-value">${step3.dominantGods.join(', ')}</div>
      </div>
    </div>
    <div style="margin-top: 8px;">
      <div class="info-item">
        <div class="info-label">격국 설명</div>
        <div class="info-value" style="font-weight: normal; font-size: 10px;">${step3.structureDescription}</div>
      </div>
    </div>
    <div class="info-grid" style="margin-top: 8px;">
      <div class="info-item">
        <div class="info-label">성격 특성</div>
        <div class="info-value" style="font-weight: normal; font-size: 10px;">${step3.personality.traits.join(', ')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">적합 직업군</div>
        <div class="info-value" style="font-weight: normal; font-size: 10px;">${step3.careerAptitude.suitableFields.join(', ')}</div>
      </div>
    </div>
  </div>

  <!-- 페이지 나누기 -->
  <div class="page-break"></div>

  <!-- 신살 분석 -->
  <div class="section">
    <div class="section-title">✨ 신살 분석</div>
    <p style="font-size: 10px; color: #666; margin-bottom: 8px;">${step4.overallStarInfluence}</p>

    ${step4.auspiciousStars.length > 0 ? `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 10px; font-weight: 600; color: #22c55e; margin-bottom: 6px;">길신 (행운의 별)</div>
      <div class="stars-grid">
        ${step4.auspiciousStars.map(star => `
          <div class="star-item" style="background: #f0fdf4; border-color: #bbf7d0;">
            <div class="star-name" style="color: #16a34a;">${star.koreanName}</div>
            <div class="star-desc">${star.meaning}</div>
            <div class="star-desc" style="color: #22c55e; margin-top: 3px;">활용: ${star.howToUse}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${step4.inauspiciousStars.length > 0 ? `
    <div>
      <div style="font-size: 10px; font-weight: 600; color: #f97316; margin-bottom: 6px;">흉신 (주의할 별)</div>
      <div class="stars-grid">
        ${step4.inauspiciousStars.map(star => `
          <div class="star-item" style="background: #fef2f2; border-color: #fecaca;">
            <div class="star-name" style="color: #dc2626;">${star.koreanName}</div>
            <div class="star-desc">${star.meaning}</div>
            <div class="star-desc" style="color: #22c55e; margin-top: 3px;">긍정 활용: ${star.positiveUse}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  </div>

  <!-- 운세 분석 -->
  <div class="section">
    <div class="section-title">📅 대운/세운 분석</div>
    <div class="info-grid">
      <div class="info-item" style="background: #eff6ff; border-color: #bfdbfe;">
        <div class="info-label" style="color: #3b82f6;">현재 대운 (${step5.currentMajorFortune.period})</div>
        <div class="info-value" style="font-size: 14px; color: #3b82f6;">${step5.currentMajorFortune.theme}</div>
        <div style="font-size: 9px; color: #666; margin-top: 4px;">${step5.currentMajorFortune.influence}</div>
      </div>
      <div class="info-item" style="background: #faf5ff; border-color: #e9d5ff;">
        <div class="info-label" style="color: #a855f7;">${step5.yearlyFortune.year}년 세운</div>
        <div class="info-value" style="font-size: 14px; color: #a855f7;">${step5.yearlyFortune.score}점 - ${step5.yearlyFortune.theme}</div>
        <div style="font-size: 9px; color: #666; margin-top: 4px;">${step5.yearlyFortune.advice}</div>
      </div>
    </div>

    <div style="margin-top: 10px;">
      <div style="font-size: 10px; font-weight: 600; color: #666; margin-bottom: 6px;">월별 운세 포인트</div>
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px;">
        ${step5.monthlyHighlights.map(m => {
          const ratingColors: Record<string, string> = {
            'excellent': '#a855f7',
            'good': '#22c55e',
            'normal': '#3b82f6',
            'caution': '#f97316',
          };
          return `
            <div style="text-align: center; padding: 6px 4px; background: ${ratingColors[m.rating]}10; border-radius: 4px; border: 1px solid ${ratingColors[m.rating]}30;">
              <div style="font-size: 12px; font-weight: bold; color: ${ratingColors[m.rating]};">${m.month}월</div>
              <div style="font-size: 8px; color: #666; margin-top: 2px; line-height: 1.2;">${m.focus}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  </div>

  <!-- 실용적 조언 -->
  <div class="section">
    <div class="section-title">📝 실용적 조언</div>
    <div class="advice-section" style="background: #faf5ff; border: 1px solid #e9d5ff;">
      <div class="advice-title" style="color: #a855f7;">즉시 실천</div>
      <ul class="advice-list">
        ${step6.advice.immediate.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
    <div class="advice-section" style="background: #eff6ff; border: 1px solid #bfdbfe;">
      <div class="advice-title" style="color: #3b82f6;">1-3개월 내</div>
      <ul class="advice-list">
        ${step6.advice.shortTerm.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
    <div class="advice-section" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
      <div class="advice-title" style="color: #22c55e;">장기 발전</div>
      <ul class="advice-list">
        ${step6.advice.longTerm.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- 행운 요소 -->
  <div class="section">
    <div class="section-title">🌟 행운의 요소</div>
    <div class="lucky-grid">
      <div class="lucky-item">
        <div class="lucky-label">🎨 행운 색상</div>
        <div class="lucky-value">${step6.luckyElements.colors.join(', ')}</div>
      </div>
      <div class="lucky-item">
        <div class="lucky-label"># 행운 숫자</div>
        <div class="lucky-value">${step6.luckyElements.numbers.join(', ')}</div>
      </div>
      <div class="lucky-item">
        <div class="lucky-label">🧭 행운 방향</div>
        <div class="lucky-value">${step6.luckyElements.directions.join(', ')}</div>
      </div>
      <div class="lucky-item">
        <div class="lucky-label">🌸 행운 계절</div>
        <div class="lucky-value">${step6.luckyElements.seasons.join(', ')}</div>
      </div>
    </div>
    <div style="margin-top: 8px;">
      <div class="info-item" style="background: #fef3c7; border-color: #fde68a;">
        <div class="info-label" style="color: #92400e;">⚡ 추천 활동</div>
        <div class="info-value" style="font-weight: normal; font-size: 10px; color: #78350f;">${step6.luckyElements.activities.join(', ')}</div>
      </div>
    </div>
  </div>

  <!-- 오늘의 한마디 -->
  <div class="section">
    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); border-radius: 12px; color: white;">
      <div style="font-size: 10px; opacity: 0.8; margin-bottom: 6px;">✨ 오늘의 한마디</div>
      <div style="font-size: 13px; font-style: italic; line-height: 1.5;">"${step6.oneLineMessage}"</div>
    </div>
  </div>

  ${data.detailAnalyses && Object.keys(data.detailAnalyses).length > 0 ? `
  <!-- 상세 분석 섹션 시작 -->
  <div class="page-break"></div>

  <div style="text-align: center; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #1a1033 0%, #2d1f47 100%); border-radius: 12px;">
    <h2 style="font-size: 20px; color: #a855f7; margin-bottom: 8px;">📖 상세 분석 리포트</h2>
    <p style="font-size: 11px; color: #999;">8개 영역의 심층 분석 결과입니다</p>
  </div>

  ${Object.entries(data.detailAnalyses).map(([category, content]) => {
    const categoryInfo = detailCategoryLabels[category] || { title: category, icon: '📋', color: '#666' };
    return `
    <div class="section detail-section" style="margin-bottom: 20px; page-break-inside: avoid;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid ${categoryInfo.color};">
        <span style="font-size: 20px;">${categoryInfo.icon}</span>
        <h3 style="font-size: 16px; font-weight: bold; color: ${categoryInfo.color}; margin: 0;">${categoryInfo.title}</h3>
      </div>
      <div class="detail-content" style="font-size: 10px; color: #333; line-height: 1.7; padding: 12px; background: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb;">
        ${markdownToHTML(content)}
      </div>
    </div>
    `;
  }).join('')}
  <!-- 상세 분석 섹션 끝 -->
  ` : ''}

  <div class="footer">
    <p>이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.</p>
    <p>개인의 운명은 노력과 선택에 의해 얼마든지 바뀔 수 있습니다.</p>
    <p style="margin-top: 6px;">생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p class="brand">Powered by Hansa AI - 6단계 전문 사주 분석</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download Professional Saju Pipeline PDF using browser print dialog
 */
export async function downloadPipelinePDF(
  data: PipelinePDFData,
  filename: string = 'hansa-ai-professional-saju.pdf'
) {
  console.log('[PDF] Starting Pipeline PDF generation...', { filename });

  try {
    const htmlContent = generatePipelinePDFHTML(data);
    console.log('[PDF] HTML generated, length:', htmlContent.length);

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      console.log('[PDF] Content loaded, triggering print dialog');
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened');
      }, 250);
    };

    setTimeout(() => {
      if (printWindow.document.readyState === 'complete') {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened (fallback)');
      }
    }, 500);

  } catch (error) {
    console.error('[PDF] ❌ Pipeline PDF generation error:', error);
    throw error;
  }
}

// ===== 상세 궁합 분석 PDF 생성 (전통 명리학) =====

export interface DetailedCompatibilityPDFData {
  person1: {
    name?: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour?: number;
    birthMinute?: number;
    gender: string;
    isLunar?: boolean;
    pillars?: {
      year: { stem: string; branch: string };
      month: { stem: string; branch: string };
      day: { stem: string; branch: string };
      hour: { stem: string; branch: string };
    };
  };
  person2: {
    name?: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour?: number;
    birthMinute?: number;
    gender: string;
    isLunar?: boolean;
    pillars?: {
      year: { stem: string; branch: string };
      month: { stem: string; branch: string };
      day: { stem: string; branch: string };
      hour: { stem: string; branch: string };
    };
  };
  result: {
    overallScore: number;
    grade: string;
    gradeText: string;
    summary: string;
    cheonganHap?: {
      combinations: Array<{
        stem1: string;
        stem2: string;
        resultElement: string;
        description: string;
      }>;
      analysis: string;
    };
    jijiRelation?: {
      yukHap?: Array<{
        branch1: string;
        branch2: string;
        resultElement: string;
        description: string;
      }>;
      samHap?: Array<{
        branches: string[];
        resultElement: string;
        description: string;
      }>;
      chung?: Array<{
        branch1: string;
        branch2: string;
        description: string;
      }>;
      hyung?: Array<{
        branches: string[];
        description: string;
      }>;
      analysis: string;
    };
    iljuCompatibility?: {
      person1Ilju: string;
      person2Ilju: string;
      compatibility: string;
      analysis: string;
    };
    elementBalanceAnalysis?: {
      person1Elements: Record<string, number>;
      person2Elements: Record<string, number>;
      combinedBalance: Record<string, number>;
      analysis: string;
    };
    strengths?: string[];
    challenges?: string[];
    adviceForPerson1?: string;
    adviceForPerson2?: string;
    recommendedActivities?: string[];
    luckyElements?: string[];
    // Additional detailed analysis fields
    relationshipAnalysis?: {
      emotional?: { score: number; description: string };
      physical?: { score: number; description: string };
      intellectual?: { score: number; description: string };
      spiritual?: { score: number; description: string };
      financial?: { score: number; description: string };
    };
    timingAnalysis?: {
      shortTerm?: { score: number; description: string };
      midTerm?: { score: number; description: string };
      longTerm?: { score: number; description: string };
    };
    romanticAnalysis?: {
      initialAttraction?: { score: number; description: string };
      dateCompatibility?: { score: number; description: string };
      marriageProspect?: { score: number; description: string };
      childrenFortune?: { score: number; description: string };
    };
    workplaceAnalysis?: {
      teamwork?: { score: number; description: string };
      projectCollaboration?: { score: number; description: string };
      decisionMaking?: { score: number; description: string };
      stressHandling?: { score: number; description: string };
      careerSupport?: { score: number; description: string };
      tenGodRelation?: {
        person1Role: string;
        person2Role: string;
        relationDynamic: string;
      };
    };
    conflictPoints?: Array<{
      area: string;
      description: string;
      solution?: string;
    }>;
    compatibility?: {
      communication?: { score: number; description: string };
      collaboration?: { score: number; description: string };
      trust?: { score: number; description: string };
      growth?: { score: number; description: string };
    };
    luckyDates?: string[];
    luckyElementsDetailed?: {
      colors?: string[];
      directions?: string[];
      numbers?: number[];
    };
  };
  relationType?: string;
}

function generateDetailedCompatibilityPDFHTML(data: DetailedCompatibilityPDFData): string {
  const { person1, person2, result } = data;

  const person1Name = person1.name || '첫 번째';
  const person2Name = person2.name || '두 번째';

  const formatBirthInfo = (person: typeof person1) => {
    const lunar = person.isLunar ? ' (음력)' : '';
    return `${person.birthYear}년 ${person.birthMonth}월 ${person.birthDay}일${lunar}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const elementColors: Record<string, string> = {
    '목': '#22c55e',
    '화': '#ef4444',
    '토': '#eab308',
    '금': '#94a3b8',
    '수': '#3b82f6',
    'wood': '#22c55e',
    'fire': '#ef4444',
    'earth': '#eab308',
    'metal': '#94a3b8',
    'water': '#3b82f6',
  };

  const renderPillars = (pillars: typeof person1.pillars, name: string) => {
    if (!pillars) return '';
    return `
      <div class="pillars-section">
        <h4>${name}의 사주팔자</h4>
        <table class="pillars-table">
          <thead>
            <tr>
              <th>시주</th>
              <th>일주</th>
              <th>월주</th>
              <th>연주</th>
            </tr>
          </thead>
          <tbody>
            <tr class="stems">
              <td>${pillars.hour.stem}</td>
              <td>${pillars.day.stem}</td>
              <td>${pillars.month.stem}</td>
              <td>${pillars.year.stem}</td>
            </tr>
            <tr class="branches">
              <td>${pillars.hour.branch}</td>
              <td>${pillars.day.branch}</td>
              <td>${pillars.month.branch}</td>
              <td>${pillars.year.branch}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  };

  const renderCheonganHap = () => {
    if (!result.cheonganHap) return '';
    return `
      <div class="analysis-section">
        <h3>천간합 (天干合)</h3>
        ${result.cheonganHap.combinations.length > 0 ? `
          <div class="combinations">
            ${result.cheonganHap.combinations.map(c => `
              <div class="combination-item">
                <span class="combination-formula">${c.stem1} + ${c.stem2} → ${c.resultElement}</span>
                <p>${c.description}</p>
              </div>
            `).join('')}
          </div>
        ` : '<p class="no-data">천간합이 없습니다.</p>'}
        <div class="analysis-text">${result.cheonganHap.analysis}</div>
      </div>
    `;
  };

  const renderJijiRelation = () => {
    if (!result.jijiRelation) return '';
    return `
      <div class="analysis-section">
        <h3>지지 관계 (地支關係)</h3>

        ${result.jijiRelation.yukHap && result.jijiRelation.yukHap.length > 0 ? `
          <div class="sub-section">
            <h4>육합 (六合)</h4>
            ${result.jijiRelation.yukHap.map(h => `
              <div class="relation-item positive">
                <span class="relation-formula">${h.branch1} + ${h.branch2} → ${h.resultElement}</span>
                <p>${h.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${result.jijiRelation.samHap && result.jijiRelation.samHap.length > 0 ? `
          <div class="sub-section">
            <h4>삼합 (三合)</h4>
            ${result.jijiRelation.samHap.map(h => `
              <div class="relation-item positive">
                <span class="relation-formula">${h.branches.join(' + ')} → ${h.resultElement}</span>
                <p>${h.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${result.jijiRelation.chung && result.jijiRelation.chung.length > 0 ? `
          <div class="sub-section">
            <h4>충 (沖)</h4>
            ${result.jijiRelation.chung.map(c => `
              <div class="relation-item negative">
                <span class="relation-formula">${c.branch1} ↔ ${c.branch2}</span>
                <p>${c.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${result.jijiRelation.hyung && result.jijiRelation.hyung.length > 0 ? `
          <div class="sub-section">
            <h4>형 (刑)</h4>
            ${result.jijiRelation.hyung.map(h => `
              <div class="relation-item warning">
                <span class="relation-formula">${h.branches.join(' - ')}</span>
                <p>${h.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="analysis-text">${result.jijiRelation.analysis}</div>
      </div>
    `;
  };

  const renderIljuCompatibility = () => {
    if (!result.iljuCompatibility) return '';
    return `
      <div class="analysis-section">
        <h3>일주 궁합 (日柱 宮合)</h3>
        <div class="ilju-comparison">
          <div class="ilju-item">
            <span class="label">${person1Name}</span>
            <span class="value">${result.iljuCompatibility.person1Ilju}</span>
          </div>
          <div class="ilju-vs">VS</div>
          <div class="ilju-item">
            <span class="label">${person2Name}</span>
            <span class="value">${result.iljuCompatibility.person2Ilju}</span>
          </div>
        </div>
        <div class="compatibility-result">
          <strong>궁합 결과:</strong> ${result.iljuCompatibility.compatibility}
        </div>
        <div class="analysis-text">${result.iljuCompatibility.analysis}</div>
      </div>
    `;
  };

  const renderElementBalance = () => {
    if (!result.elementBalanceAnalysis) return '';
    const elements = ['목', '화', '토', '금', '수'];
    return `
      <div class="analysis-section">
        <h3>오행 균형 분석 (五行 均衡)</h3>
        <div class="element-chart">
          <table class="element-table">
            <thead>
              <tr>
                <th>오행</th>
                ${elements.map(e => `<th style="color: ${elementColors[e]}">${e}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${person1Name}</td>
                ${elements.map(e => `<td>${result.elementBalanceAnalysis!.person1Elements[e] || 0}</td>`).join('')}
              </tr>
              <tr>
                <td>${person2Name}</td>
                ${elements.map(e => `<td>${result.elementBalanceAnalysis!.person2Elements[e] || 0}</td>`).join('')}
              </tr>
              <tr class="combined">
                <td>합산</td>
                ${elements.map(e => `<td>${result.elementBalanceAnalysis!.combinedBalance[e] || 0}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
        <div class="analysis-text">${result.elementBalanceAnalysis.analysis}</div>
      </div>
    `;
  };

  const renderStrengthsChallenges = () => {
    if (!result.strengths?.length && !result.challenges?.length) return '';
    return `
      <div class="analysis-section two-column">
        ${result.strengths?.length ? `
          <div class="column strengths">
            <h3>강점</h3>
            <ul>
              ${result.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${result.challenges?.length ? `
          <div class="column challenges">
            <h3>주의점</h3>
            <ul>
              ${result.challenges.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  };

  const renderAdvice = () => {
    if (!result.adviceForPerson1 && !result.adviceForPerson2) return '';
    return `
      <div class="analysis-section">
        <h3>개인별 조언</h3>
        ${result.adviceForPerson1 ? `
          <div class="advice-item">
            <h4>${person1Name}에게</h4>
            <p>${result.adviceForPerson1}</p>
          </div>
        ` : ''}
        ${result.adviceForPerson2 ? `
          <div class="advice-item">
            <h4>${person2Name}에게</h4>
            <p>${result.adviceForPerson2}</p>
          </div>
        ` : ''}
      </div>
    `;
  };

  const renderRecommendations = () => {
    if (!result.recommendedActivities?.length && !result.luckyElements?.length) return '';
    return `
      <div class="analysis-section">
        <h3>추천 사항</h3>
        ${result.recommendedActivities?.length ? `
          <div class="recommendation-group">
            <h4>추천 활동</h4>
            <ul>
              ${result.recommendedActivities.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${result.luckyElements?.length ? `
          <div class="recommendation-group">
            <h4>행운의 오행</h4>
            <div class="lucky-elements">
              ${result.luckyElements.map(e => `
                <span class="lucky-element" style="background: ${elementColors[e] || '#6b7280'}20; color: ${elementColors[e] || '#6b7280'}; border: 1px solid ${elementColors[e] || '#6b7280'}40">${e}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const renderRelationshipAnalysis = () => {
    if (!result.relationshipAnalysis) return '';
    const areas = [
      { key: 'emotional', label: '정서적 교감', color: '#ec4899' },
      { key: 'physical', label: '신체적 조화', color: '#f59e0b' },
      { key: 'intellectual', label: '지적 교류', color: '#8b5cf6' },
      { key: 'spiritual', label: '정신적 유대', color: '#06b6d4' },
      { key: 'financial', label: '경제적 조화', color: '#22c55e' },
    ];
    return `
      <div class="analysis-section">
        <h3>관계 영역별 상세 분석</h3>
        <div class="score-grid">
          ${areas.map(({ key, label, color }) => {
            const data = result.relationshipAnalysis![key as keyof typeof result.relationshipAnalysis];
            if (!data) return '';
            return `
              <div class="score-item">
                <div class="score-header">
                  <span class="score-label">${label}</span>
                  <span class="score-value" style="color: ${color}">${data.score}점</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${data.score}%; background: ${color}"></div>
                </div>
                <p class="score-desc">${data.description}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderTimingAnalysis = () => {
    if (!result.timingAnalysis) return '';
    const periods = [
      { key: 'shortTerm', label: '단기 (1-2년)' },
      { key: 'midTerm', label: '중기 (3-5년)' },
      { key: 'longTerm', label: '장기 (5년+)' },
    ];
    return `
      <div class="analysis-section">
        <h3>시간에 따른 궁합 변화</h3>
        <div class="timing-grid">
          ${periods.map(({ key, label }) => {
            const data = result.timingAnalysis![key as keyof typeof result.timingAnalysis];
            if (!data) return '';
            return `
              <div class="timing-item">
                <div class="timing-header">
                  <span>${label}</span>
                  <span style="color: ${getScoreColor(data.score)}">${data.score}점</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${data.score}%; background: ${getScoreColor(data.score)}"></div>
                </div>
                <p>${data.description}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderRomanticAnalysis = () => {
    if (!result.romanticAnalysis) return '';
    const areas = [
      { key: 'initialAttraction', label: '첫인상/끌림', color: '#ec4899' },
      { key: 'dateCompatibility', label: '데이트 궁합', color: '#f43f5e' },
      { key: 'marriageProspect', label: '결혼 전망', color: '#a855f7' },
      { key: 'childrenFortune', label: '자녀운', color: '#3b82f6' },
    ];
    return `
      <div class="analysis-section romantic">
        <h3 style="color: #ec4899">연애/결혼 특별 분석</h3>
        <div class="score-grid">
          ${areas.map(({ key, label, color }) => {
            const data = result.romanticAnalysis![key as keyof typeof result.romanticAnalysis];
            if (!data) return '';
            return `
              <div class="score-item">
                <div class="score-header">
                  <span class="score-label">${label}</span>
                  <span class="score-value" style="color: ${color}">${data.score}점</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${data.score}%; background: ${color}"></div>
                </div>
                <p class="score-desc">${data.description}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderWorkplaceAnalysis = () => {
    if (!result.workplaceAnalysis) return '';
    const areas = [
      { key: 'teamwork', label: '팀워크 궁합', color: '#06b6d4' },
      { key: 'projectCollaboration', label: '프로젝트 협업', color: '#0ea5e9' },
      { key: 'decisionMaking', label: '의사결정 스타일 호환성', color: '#3b82f6' },
      { key: 'stressHandling', label: '스트레스 상황 대응', color: '#6366f1' },
      { key: 'careerSupport', label: '커리어 성장 지원', color: '#8b5cf6' },
    ];
    return `
      <div class="analysis-section workplace">
        <h3 style="color: #06b6d4">직장/업무 관계 특별 분석</h3>
        ${result.workplaceAnalysis.tenGodRelation ? `
          <div class="ten-god-section">
            <h4>십성(十星) 기반 업무 역학</h4>
            <div class="role-grid">
              <div class="role-item">
                <span class="role-label">${person1Name}의 역할</span>
                <span class="role-value">${result.workplaceAnalysis.tenGodRelation.person1Role}</span>
              </div>
              <div class="role-item">
                <span class="role-label">${person2Name}의 역할</span>
                <span class="role-value">${result.workplaceAnalysis.tenGodRelation.person2Role}</span>
              </div>
            </div>
            <p>${result.workplaceAnalysis.tenGodRelation.relationDynamic}</p>
          </div>
        ` : ''}
        <div class="score-grid">
          ${areas.map(({ key, label, color }) => {
            const data = result.workplaceAnalysis![key as keyof typeof result.workplaceAnalysis];
            if (!data || typeof data !== 'object' || !('score' in data)) return '';
            return `
              <div class="score-item">
                <div class="score-header">
                  <span class="score-label">${label}</span>
                  <span class="score-value" style="color: ${color}">${data.score}점</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${data.score}%; background: ${color}"></div>
                </div>
                <p class="score-desc">${data.description}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderConflictPoints = () => {
    if (!result.conflictPoints?.length) return '';
    return `
      <div class="analysis-section">
        <h3>갈등 포인트와 해결책</h3>
        <div class="conflict-list">
          ${result.conflictPoints.map(conflict => `
            <div class="conflict-item">
              <div class="conflict-header">
                <span class="conflict-area">⚠️ ${conflict.area}</span>
              </div>
              <p class="conflict-desc">${conflict.description}</p>
              <div class="conflict-solution">
                <span class="solution-label">💡 해결책:</span>
                <p>${conflict.solution}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  const renderBasicCompatibility = () => {
    if (!result.compatibility) return '';
    const areas = [
      { key: 'communication', label: '소통', color: '#22c55e' },
      { key: 'collaboration', label: '협업', color: '#f59e0b' },
      { key: 'trust', label: '신뢰', color: '#3b82f6' },
      { key: 'growth', label: '성장', color: '#a855f7' },
    ];
    return `
      <div class="analysis-section">
        <h3>기본 궁합 분석</h3>
        <div class="score-grid">
          ${areas.map(({ key, label, color }) => {
            const data = result.compatibility![key as keyof typeof result.compatibility];
            if (!data) return '';
            return `
              <div class="score-item">
                <div class="score-header">
                  <span class="score-label">${label}</span>
                  <span class="score-value" style="color: ${color}">${data.score}점</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${data.score}%; background: ${color}"></div>
                </div>
                <p class="score-desc">${data.description}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderLuckyDates = () => {
    if (!result.luckyDates?.length) return '';
    return `
      <div class="analysis-section">
        <h3>함께하기 좋은 날짜/시기</h3>
        <ul class="lucky-dates-list">
          ${result.luckyDates.map(date => `<li>⭐ ${date}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  const renderLuckyElementsDetailed = () => {
    if (!result.luckyElementsDetailed) return '';
    const { colors, directions, numbers } = result.luckyElementsDetailed;
    if (!colors?.length && !directions?.length && !numbers?.length) return '';
    return `
      <div class="analysis-section">
        <h3>함께할 때 행운의 요소</h3>
        <div class="lucky-detailed">
          ${colors?.length ? `
            <div class="lucky-group">
              <h4>🎨 색상</h4>
              <div class="lucky-tags">
                ${colors.map(c => `<span class="lucky-tag color">${c}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${directions?.length ? `
            <div class="lucky-group">
              <h4>🧭 방향</h4>
              <div class="lucky-tags">
                ${directions.map(d => `<span class="lucky-tag direction">${d}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${numbers?.length ? `
            <div class="lucky-group">
              <h4># 숫자</h4>
              <div class="lucky-tags">
                ${numbers.map(n => `<span class="lucky-tag number">${n}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>전통 명리학 궁합 분석 - ${person1Name} & ${person2Name}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: white;
    }

    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 10mm;
    }

    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #a855f7;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 22pt;
      color: #7c3aed;
      margin-bottom: 5px;
    }

    .header .subtitle {
      font-size: 10pt;
      color: #6b7280;
    }

    .score-section {
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border-radius: 12px;
      margin-bottom: 25px;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${getScoreColor(result.overallScore)} 0%, ${getScoreColor(result.overallScore)}cc 100%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }

    .score-value {
      font-size: 28pt;
      font-weight: bold;
      color: white;
    }

    .grade-badge {
      display: inline-block;
      padding: 6px 20px;
      background: ${getScoreColor(result.overallScore)}20;
      color: ${getScoreColor(result.overallScore)};
      border-radius: 20px;
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 10px;
    }

    .summary {
      font-size: 11pt;
      color: #4b5563;
      max-width: 500px;
      margin: 0 auto;
    }

    .persons-info {
      display: flex;
      justify-content: space-around;
      gap: 20px;
      margin-bottom: 25px;
    }

    .person-card {
      flex: 1;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      text-align: center;
    }

    .person-card h3 {
      color: #7c3aed;
      margin-bottom: 8px;
    }

    .person-card .birth-info {
      font-size: 10pt;
      color: #6b7280;
    }

    .pillars-section {
      margin-bottom: 15px;
    }

    .pillars-section h4 {
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .pillars-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }

    .pillars-table th,
    .pillars-table td {
      padding: 6px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }

    .pillars-table th {
      background: #f3f4f6;
      font-weight: normal;
      color: #6b7280;
    }

    .pillars-table .stems td {
      background: #fef3c7;
      font-weight: bold;
      color: #92400e;
    }

    .pillars-table .branches td {
      background: #dbeafe;
      font-weight: bold;
      color: #1e40af;
    }

    .analysis-section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    .analysis-section h3 {
      font-size: 14pt;
      color: #7c3aed;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 15px;
    }

    .sub-section {
      margin-bottom: 15px;
    }

    .sub-section h4 {
      font-size: 11pt;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .combination-item,
    .relation-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .combination-formula,
    .relation-formula {
      font-weight: bold;
      color: #7c3aed;
      display: block;
      margin-bottom: 4px;
    }

    .relation-item.positive {
      border-left: 3px solid #22c55e;
    }

    .relation-item.negative {
      border-left: 3px solid #ef4444;
    }

    .relation-item.warning {
      border-left: 3px solid #f59e0b;
    }

    .analysis-text {
      background: #faf5ff;
      padding: 12px;
      border-radius: 6px;
      margin-top: 10px;
      font-size: 10.5pt;
      line-height: 1.7;
    }

    .no-data {
      color: #9ca3af;
      font-style: italic;
    }

    .ilju-comparison {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin: 15px 0;
    }

    .ilju-item {
      text-align: center;
    }

    .ilju-item .label {
      display: block;
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .ilju-item .value {
      font-size: 16pt;
      font-weight: bold;
      color: #7c3aed;
    }

    .ilju-vs {
      font-size: 12pt;
      color: #9ca3af;
      font-weight: bold;
    }

    .compatibility-result {
      text-align: center;
      padding: 10px;
      background: #fef3c7;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .element-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    .element-table th,
    .element-table td {
      padding: 8px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }

    .element-table th {
      background: #f3f4f6;
      font-weight: bold;
    }

    .element-table .combined {
      background: #f0fdf4;
      font-weight: bold;
    }

    .two-column {
      display: flex;
      gap: 20px;
    }

    .two-column .column {
      flex: 1;
      padding: 15px;
      border-radius: 8px;
    }

    .two-column .strengths {
      background: #f0fdf4;
    }

    .two-column .strengths h3 {
      color: #22c55e;
      border-bottom-color: #22c55e;
    }

    .two-column .challenges {
      background: #fef2f2;
    }

    .two-column .challenges h3 {
      color: #ef4444;
      border-bottom-color: #ef4444;
    }

    .two-column ul {
      list-style: none;
      padding-left: 0;
    }

    .two-column li {
      padding: 6px 0;
      padding-left: 20px;
      position: relative;
    }

    .two-column .strengths li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #22c55e;
    }

    .two-column .challenges li::before {
      content: "!";
      position: absolute;
      left: 0;
      color: #ef4444;
      font-weight: bold;
    }

    .advice-item {
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .advice-item h4 {
      color: #7c3aed;
      margin-bottom: 8px;
    }

    .recommendation-group {
      margin-bottom: 15px;
    }

    .recommendation-group h4 {
      font-size: 11pt;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .recommendation-group ul {
      list-style-type: disc;
      padding-left: 20px;
    }

    .recommendation-group li {
      padding: 4px 0;
    }

    .lucky-elements {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .lucky-element {
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: bold;
    }

    /* Score Grid for Relationship/Romantic/Workplace Analysis */
    .score-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .score-item {
      background: #f9fafb;
      border-radius: 8px;
      padding: 15px;
    }

    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .score-label {
      font-weight: bold;
      color: #374151;
    }

    .score-value {
      font-size: 14pt;
      font-weight: bold;
    }

    .score-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .score-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .score-desc {
      font-size: 10pt;
      color: #6b7280;
      line-height: 1.5;
    }

    /* Timing Analysis */
    .timing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .timing-item {
      background: #f9fafb;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }

    .timing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .timing-item p {
      font-size: 10pt;
      color: #6b7280;
      margin-top: 8px;
    }

    /* Romantic Section */
    .analysis-section.romantic {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
      padding: 20px;
      border-radius: 12px;
    }

    /* Workplace Section */
    .analysis-section.workplace {
      background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
      padding: 20px;
      border-radius: 12px;
    }

    .ten-god-section {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .ten-god-section h4 {
      color: #0e7490;
      margin-bottom: 10px;
    }

    .role-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }

    .role-item {
      background: #f0fdfa;
      padding: 10px;
      border-radius: 6px;
      text-align: center;
    }

    .role-label {
      display: block;
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .role-value {
      font-weight: bold;
      color: #0e7490;
    }

    /* Conflict Points */
    .conflict-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .conflict-item {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      border-radius: 0 8px 8px 0;
    }

    .conflict-header {
      margin-bottom: 8px;
    }

    .conflict-area {
      font-weight: bold;
      color: #dc2626;
    }

    .conflict-desc {
      color: #7f1d1d;
      margin-bottom: 12px;
    }

    .conflict-solution {
      background: #f0fdf4;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #22c55e;
    }

    .solution-label {
      font-weight: bold;
      color: #16a34a;
      display: block;
      margin-bottom: 4px;
    }

    .conflict-solution p {
      color: #166534;
      margin: 0;
    }

    /* Lucky Dates */
    .lucky-dates-list {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .lucky-dates-list li {
      background: #fef3c7;
      padding: 10px 15px;
      border-radius: 6px;
      color: #92400e;
    }

    /* Lucky Elements Detailed */
    .lucky-detailed {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 15px;
    }

    .lucky-group {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }

    .lucky-group h4 {
      margin-bottom: 10px;
      color: #374151;
    }

    .lucky-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .lucky-tag {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 10pt;
      font-weight: 500;
    }

    .lucky-tag.color {
      background: #fef3c7;
      color: #92400e;
    }

    .lucky-tag.direction {
      background: #dbeafe;
      color: #1e40af;
    }

    .lucky-tag.number {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #9ca3af;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .analysis-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>전통 명리학 궁합 분석</h1>
      <p class="subtitle">Traditional Fortune Compatibility Analysis</p>
    </header>

    <section class="score-section">
      <div class="score-circle">
        <span class="score-value">${result.overallScore}</span>
      </div>
      <div class="grade-badge">${result.grade} - ${result.gradeText}</div>
      <p class="summary">${result.summary}</p>
    </section>

    <section class="persons-info">
      <div class="person-card">
        <h3>${person1Name}</h3>
        <p class="birth-info">${formatBirthInfo(person1)}</p>
        ${renderPillars(person1.pillars, person1Name)}
      </div>
      <div class="person-card">
        <h3>${person2Name}</h3>
        <p class="birth-info">${formatBirthInfo(person2)}</p>
        ${renderPillars(person2.pillars, person2Name)}
      </div>
    </section>

    ${renderCheonganHap()}
    ${renderJijiRelation()}
    ${renderIljuCompatibility()}
    ${renderElementBalance()}
    ${renderStrengthsChallenges()}
    ${renderAdvice()}
    ${renderRecommendations()}
    ${renderRelationshipAnalysis()}
    ${renderTimingAnalysis()}
    ${renderRomanticAnalysis()}
    ${renderWorkplaceAnalysis()}
    ${renderConflictPoints()}
    ${renderBasicCompatibility()}
    ${renderLuckyDates()}
    ${renderLuckyElementsDetailed()}

    <footer class="footer">
      <p>본 분석은 전통 명리학을 기반으로 한 참고 자료입니다.</p>
      <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
      <p>Hansa AI - AI 운세 마스터</p>
    </footer>
  </div>
</body>
</html>
  `;
}

export function downloadDetailedCompatibilityPDF(data: DetailedCompatibilityPDFData): void {
  console.log('[PDF] Starting detailed compatibility PDF generation');

  try {
    const htmlContent = generateDetailedCompatibilityPDFHTML(data);
    console.log('[PDF] HTML generated, length:', htmlContent.length);

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      console.log('[PDF] Content loaded, triggering print dialog');
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened');
      }, 250);
    };

    setTimeout(() => {
      if (printWindow.document.readyState === 'complete') {
        printWindow.focus();
        printWindow.print();
        console.log('[PDF] ✅ Print dialog opened (fallback)');
      }
    }, 500);

  } catch (error) {
    console.error('[PDF] ❌ Detailed compatibility PDF generation error:', error);
    throw error;
  }
}
