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
