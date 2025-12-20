# AI 운세 마스터 - Implementation Workflow
# Generated: 2025-12-20

## Workflow Overview

```
Phase 1 (Setup)     Phase 2 (Logic)     Phase 3 (UI)       Phase 4 (AI)      Phase 5 (Face)    Phase 6 (Polish)
     │                    │                  │                  │                  │                  │
     ▼                    ▼                  ▼                  ▼                  ▼                  ▼
┌─────────┐         ┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│ Deps    │────────▶│ Saju     │──────▶│ Forms    │──────▶│ LLM API  │──────▶│ MediaPipe│──────▶│ SEO      │
│ shadcn  │         │ Calendar │       │ Cards    │       │ Streaming│       │ Capture  │       │ PWA      │
│ Layout  │         │ TenGods  │       │ Charts   │       │ Prompts  │       │ Analysis │       │ Perf     │
└─────────┘         └──────────┘       └──────────┘       └──────────┘       └──────────┘       └──────────┘
    6 tasks            10 tasks           12 tasks           6 tasks            8 tasks            6 tasks
```

---

## Phase 1: Project Setup
**Priority: P0 (Critical)**
**Duration: ~2-4 hours**
**Dependencies: None**

### Tasks

#### 1.1 Install Core Dependencies
```bash
# Saju calculation
npm install lunar-javascript

# AI SDK
npm install ai @ai-sdk/openai

# State management
npm install zustand

# Charts
npm install recharts

# Icons
npm install lucide-react
```

**Acceptance Criteria:**
- [ ] All packages installed without conflicts
- [ ] TypeScript types available for all packages
- [ ] Dev server starts without errors

#### 1.2 Install shadcn/ui
```bash
# Initialize shadcn
npx shadcn@latest init

# Install components
npx shadcn@latest add button card input select dialog tabs
npx shadcn@latest add switch radio-group calendar popover
npx shadcn@latest add toast sonner skeleton
```

**Acceptance Criteria:**
- [ ] components/ui/ folder created
- [ ] Tailwind config updated (if needed)
- [ ] Test import works in page.tsx

#### 1.3 Create Directory Structure
```bash
mkdir -p lib/saju lib/face lib/prompts lib/supabase lib/store lib/utils
mkdir -p components/saju components/face components/chat components/layout
mkdir -p app/\(main\)/result app/\(main\)/face-reading app/\(main\)/history
mkdir -p app/api/chat app/api/saju
mkdir -p public/images/elements public/images/zodiac
```

**Acceptance Criteria:**
- [ ] All directories exist
- [ ] Proper nesting under app/ for route groups

#### 1.4 Create Type Definition Files
```
lib/saju/types.ts    - SajuInput, SajuResult, Pillar, etc.
lib/face/types.ts    - FaceMeasurements, FaceLandmarks
lib/prompts/types.ts - PromptCategory, PromptContext
```

**Acceptance Criteria:**
- [ ] All core interfaces defined
- [ ] No TypeScript errors in type files

#### 1.5 Setup Environment Variables
```bash
# Create .env.example
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Acceptance Criteria:**
- [ ] .env.example created with all required keys
- [ ] .env.local added to .gitignore

#### 1.6 Configure Base Layout
```typescript
// app/(main)/layout.tsx
// - Dark theme gradient background
// - max-w-md mx-auto container
// - Header component slot
// - MobileNav component slot
```

**Acceptance Criteria:**
- [ ] Mobile-first layout renders correctly
- [ ] Navigation components placeholder in place
- [ ] Dark theme applied

---

## Phase 2: Saju Logic Implementation
**Priority: P0 (Critical)**
**Duration: ~4-6 hours**
**Dependencies: Phase 1 complete**

### Tasks

#### 2.1 Define Constants (lib/saju/constants.ts)
```typescript
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];

// Element mapping for stems
export const STEM_ELEMENTS: Record<string, Element> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  // ...
};

// Ten Gods relationship matrix
export const TEN_GODS_MATRIX = { /* ... */ };
```

**Acceptance Criteria:**
- [ ] All 10 stems and 12 branches defined
- [ ] Element mappings complete
- [ ] Ten Gods relationship table complete

#### 2.2 Define Types (lib/saju/types.ts)
Full interface definitions as specified in PRD Section 3.1.3

**Acceptance Criteria:**
- [ ] SajuInput interface complete
- [ ] SajuResult interface complete
- [ ] All sub-types defined

#### 2.3 True Solar Time (lib/saju/solar-time.ts)
```typescript
export function adjustToTrueSolarTime(
  date: Date,
  longitude: number = 127.5
): Date {
  const STANDARD_MERIDIAN = 135; // Korea Standard Time
  const offsetMinutes = (STANDARD_MERIDIAN - longitude) * 4;
  const adjusted = new Date(date);
  adjusted.setMinutes(adjusted.getMinutes() - offsetMinutes);
  return adjusted;
}
```

**Acceptance Criteria:**
- [ ] Seoul (127.5°) returns ~30min offset
- [ ] Busan (129°) returns ~24min offset
- [ ] Edge cases handled (midnight crossing)

#### 2.4 Core Calculator (lib/saju/calculator.ts)
```typescript
import { Solar, Lunar } from 'lunar-javascript';

export function calculateSaju(input: SajuInput): SajuResult {
  // 1. Apply true solar time
  // 2. Create Solar object
  // 3. Convert to Lunar
  // 4. Extract four pillars
  // 5. Calculate element scores
  // 6. Calculate ten gods
  // 7. Calculate stars
  return result;
}
```

**Acceptance Criteria:**
- [ ] Returns valid SajuResult for any valid input
- [ ] Handles lunar calendar input
- [ ] Correctly applies true solar time

#### 2.5 Element Calculation (lib/saju/elements.ts)
```typescript
export function calculateElementScores(pillars: Pillar[]): ElementScores {
  // Weight calculation:
  // - Heavenly stem: base weight
  // - Earthly branch main element: base weight
  // - Hidden stems in branches: partial weights
  // Normalize to 0-100 scale
}
```

**Acceptance Criteria:**
- [ ] Scores sum to approximately 100
- [ ] Hidden stems included in calculation
- [ ] Dominant/lacking elements identified

#### 2.6 Ten Gods (lib/saju/ten-gods.ts)
```typescript
export function calculateTenGods(
  dayMaster: Gan,
  pillars: { year: string; month: string; day: string; time: string }
): TenGodAnalysis {
  // Compare day master with each stem/branch
  // Apply yin-yang and element relationships
}
```

**Acceptance Criteria:**
- [ ] All 8 positions analyzed (4 stems + 4 branches)
- [ ] Correct yin-yang consideration
- [ ] Summary statistics generated

#### 2.7 Stars/Spirits (lib/saju/stars.ts)
```typescript
export function calculateStars(lunar: Lunar): Star[] {
  // Check for:
  // - 천을귀인 (Heavenly Nobleman)
  // - 도화살 (Peach Blossom)
  // - 역마살 (Traveling Horse)
  // - 화개살 (Canopy)
  // etc.
}
```

**Acceptance Criteria:**
- [ ] At least 10 major stars implemented
- [ ] Both auspicious and inauspicious stars
- [ ] Descriptions included

#### 2.8 Integration Test
```typescript
// tests/saju.test.ts
describe('Saju Calculator', () => {
  test('Known celebrity case', () => {
    const result = calculateSaju({
      year: 1990, month: 1, day: 15,
      hour: 13, minute: 0,
      gender: 'male', isLunar: false
    });
    expect(result.pillars.year.ganZhi).toBe('己巳');
    // ...
  });
});
```

**Acceptance Criteria:**
- [ ] 5+ test cases pass
- [ ] Results match known manseryeok data
- [ ] Edge cases covered (leap month, year boundary)

---

## Phase 3: UI Construction
**Priority: P1 (High)**
**Duration: ~6-8 hours**
**Dependencies: Phase 1 complete, Phase 2 partial**

### Tasks

#### 3.1 Custom Date/Time Picker
```typescript
// components/saju/birth-datetime-picker.tsx
// - Year wheel (1900-2100)
// - Month selector (1-12)
// - Day selector (dynamic based on month)
// - Hour selector (0-23, with 시 labels)
// - Minute selector (0-59)
```

**Acceptance Criteria:**
- [ ] Smooth mobile scrolling
- [ ] Correct day count per month
- [ ] Korean time format (오전/오후)

#### 3.2 Birth Input Form
```typescript
// components/saju/birth-input-form.tsx
// Using react-hook-form + zod validation
// Includes lunar/solar toggle
// Gender selection
// Submit button with loading state
```

**Acceptance Criteria:**
- [ ] Form validation works
- [ ] Loading state during submit
- [ ] Accessible (aria labels)

#### 3.3 Pillar Card Component
```typescript
// components/saju/pillar-card.tsx
// - Large hanzi character display
// - Korean pronunciation
// - Element color background
// - Yin/yang indicator
```

**Acceptance Criteria:**
- [ ] Correct color per element
- [ ] Responsive sizing
- [ ] Hover/focus states

#### 3.4 Four Pillars Display
```typescript
// components/saju/four-pillars.tsx
// Grid of 4 PillarCards
// Labels: 년주, 월주, 일주, 시주
// Animation on mount
```

**Acceptance Criteria:**
- [ ] 4 cards in row (desktop) or 2x2 grid (mobile)
- [ ] Entrance animation
- [ ] Day master highlighted

#### 3.5 Element Chart
```typescript
// components/saju/element-chart.tsx
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

// Donut chart with element colors
// Center: dominant element icon
// Legend below
```

**Acceptance Criteria:**
- [ ] All 5 elements shown
- [ ] Correct proportions
- [ ] Interactive tooltips

#### 3.6 Ten Gods Table
```typescript
// components/saju/ten-gods-table.tsx
// Grid showing ten gods distribution
// Color coding by type
// Counts and percentages
```

**Acceptance Criteria:**
- [ ] All 10 types displayed
- [ ] Visual distinction
- [ ] Click for explanation

#### 3.7 Fortune Result Container
```typescript
// components/saju/fortune-result.tsx
// Combines: FourPillars + ElementChart + TenGodsTable + AI Stream
// Tab navigation for different views
```

**Acceptance Criteria:**
- [ ] Smooth tab transitions
- [ ] Proper data flow
- [ ] Share functionality placeholder

#### 3.8 Result Page
```typescript
// app/(main)/result/page.tsx
// Receives saju data (from URL params or store)
// Renders FortuneResult
// Loading skeleton while calculating
```

**Acceptance Criteria:**
- [ ] Data persistence across navigation
- [ ] Error handling
- [ ] Back navigation

#### 3.9 Loading Skeletons
```typescript
// app/(main)/result/loading.tsx
// Skeleton versions of all components
```

**Acceptance Criteria:**
- [ ] Matches actual component layout
- [ ] Subtle animation

#### 3.10 Home Page Integration
```typescript
// app/(main)/page.tsx
// BirthInputForm
// Hero section with tagline
// Recent readings (logged in users)
```

**Acceptance Criteria:**
- [ ] Form submits and navigates to result
- [ ] Responsive layout
- [ ] Clean design

#### 3.11 Header Component
```typescript
// components/layout/header.tsx
// Logo, navigation, theme toggle
// Mobile hamburger menu
```

**Acceptance Criteria:**
- [ ] Sticky on scroll
- [ ] Mobile menu works
- [ ] Links functional

#### 3.12 Mobile Navigation
```typescript
// components/layout/mobile-nav.tsx
// Bottom fixed navigation bar
// Icons: Home, Result, Face, History
```

**Acceptance Criteria:**
- [ ] Fixed at bottom
- [ ] Active state indicator
- [ ] Safe area padding (iOS)

---

## Phase 4: LLM Integration
**Priority: P2 (Medium)**
**Duration: ~3-4 hours**
**Dependencies: Phase 2, Phase 3 partial**

### Tasks

#### 4.1 API Route Setup
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { sajuData, category } = await req.json();
  const prompt = buildPrompt(sajuData, category);

  const result = await streamText({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return result.toDataStreamResponse();
}
```

**Acceptance Criteria:**
- [ ] Streaming works
- [ ] Error handling for API failures
- [ ] Rate limiting consideration

#### 4.2 System Prompt
```typescript
// lib/prompts/fortune.ts
export const SYSTEM_PROMPT = `
당신은 30년 경력의 명리학 전문가입니다...
`;
```

**Acceptance Criteria:**
- [ ] Clear persona established
- [ ] Output format specified
- [ ] Guardrails in place

#### 4.3 Category-Specific Prompts
```typescript
// lib/prompts/fortune.ts
export function buildUserPrompt(
  saju: SajuResult,
  category: 'general' | 'love' | 'career' | 'wealth' | 'health'
): string {
  // Include all relevant saju data
  // Customize focus based on category
}
```

**Acceptance Criteria:**
- [ ] All 5 categories implemented
- [ ] Saju data properly formatted
- [ ] Clear instructions for each

#### 4.4 Fortune Stream Component
```typescript
// components/chat/fortune-stream.tsx
'use client';
import { useChat } from 'ai/react';

export function FortuneStream({ sajuData, category }: Props) {
  const { messages, isLoading } = useChat({
    api: '/api/chat',
    body: { sajuData, category },
  });
  // Render messages with markdown
}
```

**Acceptance Criteria:**
- [ ] Real-time streaming display
- [ ] Typing indicator
- [ ] Markdown rendering

#### 4.5 Message Bubble
```typescript
// components/chat/message-bubble.tsx
// Styled message container
// Markdown support
// Copy functionality
```

**Acceptance Criteria:**
- [ ] Clean styling
- [ ] Code blocks if needed
- [ ] Emojis render correctly

#### 4.6 Category Selector
```typescript
// Component for selecting fortune category
// Tab or button group UI
// Triggers new API call on change
```

**Acceptance Criteria:**
- [ ] Clear visual states
- [ ] Accessible
- [ ] Smooth transitions

---

## Phase 5: Face Reading Feature
**Priority: P3 (Lower)**
**Duration: ~4-6 hours**
**Dependencies: Phase 4 complete**

### Tasks

#### 5.1 MediaPipe Setup
```typescript
// lib/face/mediapipe.ts
// Dynamic import for bundle optimization
export async function loadFaceMesh() {
  const { FaceMesh } = await import('@mediapipe/face_mesh');
  return new FaceMesh({ /* config */ });
}
```

**Acceptance Criteria:**
- [ ] Only loads on face-reading page
- [ ] Correct configuration
- [ ] Browser compatibility check

#### 5.2 Camera Capture Component
```typescript
// components/face/camera-capture.tsx
import Webcam from 'react-webcam';

// Camera preview
// Capture button
// Upload alternative
// Photo preview
```

**Acceptance Criteria:**
- [ ] Camera permission handling
- [ ] Both capture and upload work
- [ ] Preview before analysis

#### 5.3 Landmark Constants
```typescript
// lib/face/landmarks.ts
export const LANDMARKS = {
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_EYE_INNER: 133,
  // ... all 468 relevant indices
};
```

**Acceptance Criteria:**
- [ ] All needed points documented
- [ ] Named exports for readability

#### 5.4 Ratio Calculator
```typescript
// lib/face/ratios.ts
export function calculateFaceRatios(landmarks: Landmark[]): FaceRatios {
  // Three zones (forehead/middle/lower)
  // Eye measurements
  // Golden ratio score
}
```

**Acceptance Criteria:**
- [ ] All ratios from PRD implemented
- [ ] Handles partial face detection
- [ ] Normalized values

#### 5.5 Face Analyzer
```typescript
// lib/face/analyzer.ts
export async function analyzeFace(imageData: ImageData): Promise<FaceMeasurements> {
  const faceMesh = await loadFaceMesh();
  const landmarks = await faceMesh.process(imageData);
  const ratios = calculateFaceRatios(landmarks);
  return generateMeasurements(ratios);
}
```

**Acceptance Criteria:**
- [ ] Returns FaceMeasurements
- [ ] Includes text descriptions
- [ ] Error handling for no face

#### 5.6 Face Result Display
```typescript
// components/face/face-result.tsx
// Overlay landmarks on face
// Show measurement results
// Compare to ideals
```

**Acceptance Criteria:**
- [ ] Visual landmark overlay
- [ ] Clear result presentation
- [ ] Ready for LLM prompt

#### 5.7 Face Reading Prompts
```typescript
// lib/prompts/face-reading.ts
export function buildFacePrompt(measurements: FaceMeasurements): string {
  // Format measurements for LLM
  // Include interpretation guidelines
}
```

**Acceptance Criteria:**
- [ ] All measurements included
- [ ] Traditional face reading terms
- [ ] Clear structure

#### 5.8 Face Reading Page
```typescript
// app/(main)/face-reading/page.tsx
// Camera/upload section
// Analysis results
// AI interpretation stream
```

**Acceptance Criteria:**
- [ ] Full flow works
- [ ] Can combine with saju data
- [ ] Mobile-friendly layout

---

## Phase 6: Optimization & Polish
**Priority: P4 (Enhancement)**
**Duration: ~2-4 hours**
**Dependencies: All phases complete**

### Tasks

#### 6.1 SEO & Metadata
```typescript
// app/layout.tsx or pages
export const metadata: Metadata = {
  title: 'AI 운세 마스터 - 무료 사주팔자 분석',
  description: '생년월일만 입력하면 AI가 정확한 사주 분석과 운세를 알려드립니다',
  openGraph: { /* ... */ },
};
```

**Acceptance Criteria:**
- [ ] Title/description on all pages
- [ ] OG images for sharing
- [ ] Structured data (optional)

#### 6.2 Performance Audit
```
- Lighthouse score > 90
- Image optimization (next/image)
- Code splitting verification
- Bundle analysis
```

**Acceptance Criteria:**
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90

#### 6.3 Error Boundaries
```typescript
// app/error.tsx
// Global error handler
// Friendly error messages
// Retry functionality
```

**Acceptance Criteria:**
- [ ] Catches React errors
- [ ] User-friendly message
- [ ] Report error option

#### 6.4 Analytics Setup
```typescript
// Vercel Analytics or GA4
// Track: page views, form submissions, AI usage
```

**Acceptance Criteria:**
- [ ] Page view tracking
- [ ] Event tracking
- [ ] Error tracking

#### 6.5 PWA Configuration (Optional)
```typescript
// public/manifest.json
// Service worker for offline
// Install prompt
```

**Acceptance Criteria:**
- [ ] Installable on mobile
- [ ] Offline fallback page
- [ ] App icon set

#### 6.6 Final Testing & QA
```
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile device testing
- API error scenarios
- Edge case inputs
```

**Acceptance Criteria:**
- [ ] No critical bugs
- [ ] Consistent UX across browsers
- [ ] Error handling verified

---

## Dependency Graph

```
Phase 1 ──┬──▶ Phase 2 ──┬──▶ Phase 4 ──▶ Phase 5
          │              │
          └──▶ Phase 3 ──┘
                         │
                         └──▶ Phase 6
```

**Critical Path:** 1 → 2 → 4 → 5 → 6

---

## Quick Start Commands

```bash
# Phase 1: Setup
npm install lunar-javascript ai @ai-sdk/openai zustand recharts lucide-react
npx shadcn@latest init
npx shadcn@latest add button card input select dialog tabs switch radio-group calendar popover toast skeleton

# Create directories
mkdir -p lib/{saju,face,prompts,supabase,store,utils}
mkdir -p components/{saju,face,chat,layout,ui}
mkdir -p app/\(main\)/{result,face-reading,history}
mkdir -p app/api/{chat,saju}

# Start development
npm run dev
```

---

## Estimated Timeline

| Phase | Duration | Parallel? | Blockers |
|-------|----------|-----------|----------|
| Phase 1 | 2-4h | No | None |
| Phase 2 | 4-6h | No | Phase 1 |
| Phase 3 | 6-8h | Partial | Phase 1 |
| Phase 4 | 3-4h | No | Phase 2+3 |
| Phase 5 | 4-6h | No | Phase 4 |
| Phase 6 | 2-4h | Partial | All |

**Total: ~21-32 hours of development time**

---

## Success Checklist

### MVP (Phases 1-4)
- [ ] User can input birth date/time
- [ ] Saju calculation is accurate
- [ ] Results display clearly
- [ ] AI interpretation streams
- [ ] Mobile-responsive design

### Full Feature (Phase 5)
- [ ] Face capture works
- [ ] MediaPipe analyzes correctly
- [ ] Combined saju+face interpretation

### Production Ready (Phase 6)
- [ ] SEO optimized
- [ ] Performance > 90
- [ ] Error handling complete
- [ ] Analytics tracking
