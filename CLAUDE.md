# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16.1.0 with App Router
- **React**: 19.2.3
- **Styling**: Tailwind CSS v4 (uses `@import "tailwindcss"` syntax, no config file needed)
- **Language**: TypeScript (strict mode)
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`

## Architecture

This project uses Next.js App Router with the `/app` directory structure:

- `app/layout.tsx` - Root layout with font configuration and global CSS
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind v4 and CSS custom properties for theming

## Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`)

## Styling Notes

- Tailwind CSS v4 uses the new `@theme inline` directive for custom theme values
- Dark mode uses `prefers-color-scheme` media query with CSS custom properties
- No separate tailwind.config file - configuration is done inline in CSS

## Claude Rules

### General Restrictions

- Do NOT run `npm run dev` or `npm run build` without explicit user permission
- Do NOT create README or markdown files unless explicitly told to

### Database Operations

- ALWAYS use Supabase MCP tools (`mcp__supabase__*`) for database migrations and schema lookups instead of raw SQL files or Drizzle CLI

### Documentation

- ALWAYS check with Context7 MCP tool (`mcp__context7__*`) for library documentation before implementing code

### Gemini AI Integration

When using Gemini AI, follow these requirements:

#### Dependencies

```bash
npm install @google/genai mime
npm install -D @types/node
```

#### Model Selection

- For image generation: use `gemini-3-pro-image-preview`
- For text generation: use `gemini-flash-lite-latest`

#### Required Code Pattern

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const tools = [{ googleSearch: {} }];

const config = {
  thinkingConfig: {
    thinkingLevel: 'HIGH',
  },
  tools,
};

const response = await ai.models.generateContentStream({
  model: 'gemini-flash-lite-latest', // or gemini-3-pro-image-preview for images
  config,
  contents: [
    {
      role: 'user',
      parts: [{ text: 'your prompt here' }],
    },
  ],
});

for await (const chunk of response) {
  console.log(chunk.text);
}
```

## Other Rules

- DB operations → Use Supabase MCP tools
- Library docs → Check Context7 MCP
- `npm run dev/build` → Do not run without permission
- AI model changes → Do not change without permission