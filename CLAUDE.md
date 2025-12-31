# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run analyze      # Bundle analyzer (ANALYZE=true)
npm run check-env    # Verify environment variables
npm run generate-images    # Generate cover images
npm run test:saju-recs     # Test saju recommendations
```

## Tech Stack

- **Framework**: Next.js 16.1.0 with App Router
- **React**: 19.2.3
- **Styling**: Tailwind CSS v4 (uses `@import "tailwindcss"` syntax, no config file needed)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (project ID: `ypwvlmhdqavbqltsetmk`)
- **AI**: Gemini via `@google/genai` and Vercel AI SDK
- **Payments**: Stripe
- **State**: Zustand
- **i18n**: next-intl (Korean/English)

## Architecture

### Route Structure
```
app/
├── [locale]/(main)/     # Localized app routes (ko, en)
│   ├── saju/            # Saju fortune reading
│   ├── compatibility/   # Compatibility analysis
│   ├── couple/          # Couple fortune
│   ├── face-reading/    # Face reading feature
│   ├── history/         # User history
│   ├── premium/         # Premium subscription
│   └── profile/         # User profile
├── api/                 # API routes (non-localized)
│   ├── saju/            # Saju analysis endpoints
│   ├── compatibility/
│   ├── face-reading/
│   ├── stripe/
│   └── voice/
└── auth/callback/       # Supabase auth callback
```

### Core Libraries (`lib/`)

**Saju Engine** (`lib/saju/`):
- `calculator.ts` - Four Pillars (사주팔자) calculation using `lunar-javascript`
- `pipeline-orchestrator.ts` - 6-step AI analysis pipeline with parallel execution (steps 3,4,5 run in parallel after step 2)
- `pipeline-steps.ts` - Individual analysis step implementations
- `agents/` - Specialized AI agents (age, chart, temporal analysis)
- `elements.ts` - Five elements (오행) scoring and analysis
- `ten-gods.ts` - Ten Gods (십성) calculation
- `stars.ts` - Special stars (신살) calculation

**Supporting Libraries**:
- `lib/supabase/` - Client, server, and middleware utilities
- `lib/i18n/` - Locale config and translation utilities
- `lib/stripe/` - Payment integration
- `lib/voice/` - Voice chat feature
- `lib/compatibility/` - Compatibility calculator
- `lib/face-reading/` - Face reading analyzer

### Components
- `components/ui/` - shadcn/ui components (Radix-based)
- `components/aceternity/` - Aceternity UI effects
- `components/saju/` - Saju-specific components
- `components/auth/` - Auth-related components

### Middleware
The app uses chained middleware (`middleware.ts`) for:
1. Supabase session management
2. next-intl locale routing (`localePrefix: 'as-needed'`)

## Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`)

## i18n

- Locales: `ko` (default), `en`
- Translation files: `messages/ko.json`, `messages/en.json`
- Config: `lib/i18n/config.ts`
- Uses `next-intl` with `localePrefix: 'as-needed'`

## AI Integration

### Gemini API Pattern
```typescript
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from '@/lib/constants/ai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const response = await ai.models.generateContentStream({
  model: GEMINI_MODEL,
  config: { tools: [{ googleSearch: {} }] },
  contents: [{ role: 'user', parts: [{ text: 'prompt' }] }],
});
```

### Model Constants
- `GEMINI_MODEL`: `gemini-3-flash-preview` (defined in `lib/constants/ai.ts`)
- Do NOT change AI models without explicit permission

## SSE Streaming Pattern

The saju analysis uses Server-Sent Events for real-time progress:
- Endpoint: `POST /api/saju/analyze/stream`
- Events: `pipeline_start`, step events, `pipeline_complete`, `stream_end`

## Claude Rules

### General Restrictions
- Do NOT run `npm run dev` or `npm run build` without explicit user permission
- Do NOT create README or markdown files unless explicitly told to
- Do NOT change AI model constants without permission

### Database Operations
- ALWAYS use Supabase MCP tools (`mcp__supabase__*`) for database migrations and schema lookups instead of raw SQL files

### Documentation
- ALWAYS check with Context7 MCP tool (`mcp__context7__*`) for library documentation before implementing code
