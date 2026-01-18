# Cheongrium Demo - Functions Summary

A comprehensive summary of all functions, components, and features in the Cheongrium wellness booking platform.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [API Routes](#api-routes)
3. [Page Components](#page-components)
4. [UI Components](#ui-components)
5. [Layout Components](#layout-components)
6. [Landing Page Components](#landing-page-components)
7. [Data Models](#data-models)
8. [Utility Functions](#utility-functions)
9. [i18n System](#i18n-system)
10. [Data Flow](#data-flow)

---

## Project Overview

**Cheongrium** is a Next.js 16 wellness booking platform built around traditional Korean philosophy (Five Guardians/오방신 and Saju/Four Pillars analysis). The app is fully bilingual (Korean/English) and features AI-powered personalization using Google's Gemini API.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js / Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Frontend | React 19 |
| Styling | Tailwind CSS v4 + CSS Variables |
| UI Components | Radix UI + Custom Components |
| Animations | Framer Motion 12 |
| AI Integration | Google Gemini 2.0 Flash API |
| i18n | Custom Context-based system |

---

## API Routes

### `/api/saju` - Saju Analysis Endpoint

**File:** `src/app/api/saju/route.ts`

**Purpose:** Analyzes birth date/time and generates a Saju (Four Pillars) reading using AI.

**Method:** `POST`

**Request Body:**
```typescript
{
  birthDate: string;      // Required - YYYY-MM-DD format
  birthTime?: string;     // Optional - HH:MM format
  locale: 'ko' | 'en';    // Language preference
}
```

**Response:**
```typescript
{
  fourPillars: {
    year: { stem: string; branch: string; element: string };
    month: { stem: string; branch: string; element: string };
    day: { stem: string; branch: string; element: string };
    hour: { stem: string; branch: string; element: string };
  };
  elements: {
    wood: number;   // Percentage
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  dominantElement: ElementType;
  weakElement: ElementType;
  recommendedGuardian: GuardianId;
  analysis: string;
  advice: string;
}
```

**Backend Logic:**
- Validates birth date (must be 1900+, not future)
- Constructs detailed prompt for Gemini 2.0 Flash
- Parses JSON response with error handling
- Returns 400 for missing date, 500 for API failures

---

### `/api/chat` - Guardian Chat Endpoint

**File:** `src/app/api/chat/route.ts`

**Purpose:** Handles AI-powered conversations with guardian characters.

**Method:** `POST`

**Request Body:**
```typescript
{
  message: string;                    // User's message
  guardianId: GuardianId;             // Which guardian to chat with
  history?: Array<{                   // Previous conversation
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response:**
```typescript
{
  response: string;
  guardian: {
    id: GuardianId;
    name: string;
    element: ElementType;
  };
}
```

**Backend Logic:**
- Validates guardianId against known guardians
- Builds system prompt with guardian personality, role, and speaking style
- Maintains conversation context (up to 6 previous messages)
- Uses Gemini 2.0 Flash for response generation
- Returns 400 for invalid inputs, 500 for generation failures

---

### `/api/itinerary` - Itinerary Generation Endpoint

**File:** `src/app/api/itinerary/route.ts`

**Purpose:** Generates AI-personalized visit itineraries based on package selection and optional Saju results.

**Method:** `POST`

**Request Body:**
```typescript
{
  packageType: PackageType;           // 'day' | 'overnight' | 'vip'
  date?: string;                      // Visit date
  guardianId?: GuardianId;            // Preferred guardian
  locale: 'ko' | 'en';
  sajuResult?: SajuResult;            // For personalization
}
```

**Response:**
```typescript
{
  schedule: Array<{
    time: string;
    activity: string;
    location: string;
    description: string;
  }>;
  highlights: string[];
  recommendations: string[];
}
```

**Backend Logic:**
- Contains comprehensive location/activity database
- Incorporates Saju result for personalized recommendations
- Provides fallback pre-built itinerary if AI generation fails
- Adjusts schedule based on package type (day/overnight/VIP)

---

## Page Components

### Landing Page (`/`)

**File:** `src/app/page.tsx`

**Sections:**
- `HeroSection` - Main banner with guardian intro
- `GuardianShowcase` - Interactive guardian grid
- `SajuPreview` - Saju feature teaser
- `TourPreview` - Location preview cards
- `ScentPreview` - Scent collection showcase
- `KeepsakesPreview` - Keepsakes feature highlight
- `BookingCTA` - Call-to-action section

---

### Saju Analysis Pages

#### `/saju` - Input Form

**File:** `src/app/saju/page.tsx`

**Functions:**
- `handleSubmit(e)` - Form submission with validation
- `validateBirthDate(date)` - Date range validation (1900+, not future)
- Birth date input with date picker
- Optional birth time selection
- Loading state management
- Error handling and display

#### `/saju/result` - Results Display

**File:** `src/app/saju/result/page.tsx`

**Functions:**
- `loadSajuResult()` - Loads result from sessionStorage
- `getElementPercentage(element)` - Calculates element bar widths
- `getGuardianById(id)` - Retrieves guardian data
- Four Pillars visualization (년/월/일/시)
- Element balance chart
- Recommended guardian display
- Personalized analysis and advice sections

---

### Guardian Pages

#### `/guardians` - Guardian Gallery

**File:** `src/app/guardians/page.tsx`

**Functions:**
- Displays 5 guardian cards in responsive grid
- Each card shows: name, element, domain, description
- Links to individual guardian chat pages
- Element-based color theming

#### `/guardians/[id]` - Guardian Chat

**File:** `src/app/guardians/[id]/page.tsx`

**Functions:**
- `handleSendMessage(message)` - Sends message to chat API
- `scrollToBottom()` - Auto-scrolls chat container
- `formatMessage(text)` - Formats AI responses
- Initial greeting from guardian data
- Suggested prompt chips (`ChatPrompts` component)
- Message history management (user/assistant)
- Booking CTA after 3+ messages

---

### Tour Page (`/tour`)

**File:** `src/app/tour/page.tsx`

**Functions:**
- `handleLocationSelect(locationId)` - Opens location detail modal
- `getLocationByGuardian(guardianId)` - Maps guardians to locations
- Interactive stylized map with markers
- 5 location cards with guardian associations
- Modal with full location details and activities

---

### Scent Page (`/scent`)

**File:** `src/app/scent/page.tsx`

**Functions:**
- `handleScentSelect(scentId)` - Expands scent detail view
- `getScentByElement(element)` - Retrieves scent by element type
- 5 elemental scent blend cards
- Scent pyramid breakdown (top/middle/base notes)
- Benefits and guardian connection display

---

### Keepsakes Page (`/keepsakes`)

**File:** `src/app/keepsakes/page.tsx`

**Functions:**
- `handleTabChange(tabId)` - Switches between keepsake types
- `handleSave()` - Saves keepsake to device
- `handleShare()` - Shares keepsake via native share API
- Three tabs: Destiny Map, Certificate, Scent Profile
- Personalized content based on user's journey

---

### Booking Pages

#### `/booking` - Package Selection

**File:** `src/app/booking/page.tsx`

**Functions:**
- `handlePackageSelect(packageId)` - Stores selection, navigates to calendar
- 3 package tiers displayed in cards
- Feature comparison
- Price display (KRW/USD based on locale)
- "Popular" badge on overnight package

#### `/booking/calendar` - Date Selection

**File:** `src/app/booking/calendar/page.tsx`

**Functions:**
- `handleDateSelect(date)` - Validates and stores date
- `isDateAvailable(date)` - Checks availability rules
- `getMinDate()` - Returns date 3 days from now
- `isWednesdayBlocked(date)` - Business logic for blocked days
- Interactive calendar component
- Visual availability indicators

#### `/booking/confirm` - Confirmation

**File:** `src/app/booking/confirm/page.tsx`

**Functions:**
- `loadBookingData()` - Retrieves package/date from sessionStorage
- `generateItinerary()` - Calls `/api/itinerary` endpoint
- `handleConfirm()` - Clears session, shows success modal
- AI-generated itinerary display
- Booking summary card
- Confirmation modal with next steps

---

## UI Components

### Button

**File:** `src/components/ui/Button.tsx`

**Props:**
```typescript
{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'element';
  size?: 'sm' | 'md' | 'lg';
  element?: ElementType;    // For element variant
  isLoading?: boolean;
  fullWidth?: boolean;
  enableGlow?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

**Features:**
- Multiple visual variants
- Element-based theming (wood, fire, earth, metal, water)
- Loading spinner integration
- Glow effect option
- Full-width mode

---

### Card

**File:** `src/components/ui/Card.tsx`

**Props:**
```typescript
{
  className?: string;
  children: ReactNode;
}
```

**Features:**
- Consistent shadow and border styling
- Flexible content container

---

### ElementBadge

**File:** `src/components/ui/ElementBadge.tsx`

**Props:**
```typescript
{
  element: ElementType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  locale?: 'ko' | 'en';
}
```

**Features:**
- Displays 5-element badges (木火土金水)
- Color-coded by element
- Bilingual labels

---

### Input

**File:** `src/components/ui/Input.tsx`

**Props:** Standard HTML input props plus custom styling

**Features:**
- Consistent form styling
- Focus states
- Error state support

---

### Tabs

**File:** `src/components/ui/Tabs.tsx`

**Based on:** Radix UI Tabs

**Props:**
```typescript
{
  defaultValue: string;
  children: ReactNode;  // TabsList, TabsTrigger, TabsContent
}
```

**Features:**
- Accessible tab navigation
- Animated active indicator
- Keyboard navigation support

---

### Toast

**File:** `src/components/ui/Toast.tsx`

**Props:**
```typescript
{
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;    // Auto-dismiss time in ms
}
```

**Functions:**
- `showToast(options)` - Global toast trigger
- `ToastProvider` - Context wrapper
- `useToast()` - Hook for components

**Features:**
- Four notification types with icons
- Auto-dismiss with configurable duration
- Stack management for multiple toasts

---

### Stepper

**File:** `src/components/ui/Stepper.tsx`

**Props:**
```typescript
{
  currentStep: number;
  steps: Array<{
    label: string;
    description?: string;
  }>;
}
```

**Features:**
- Visual progress indicator
- Completed/active/upcoming states
- Step labels and descriptions

---

### LoadingSpinner

**File:** `src/components/ui/LoadingSpinner.tsx`

**Features:**
- Animated CSS spinner
- Configurable size
- Center alignment utility

---

### Skeleton

**File:** `src/components/ui/Skeleton.tsx`

**Features:**
- Placeholder loading state
- Pulse animation
- Configurable dimensions

---

### ChatPrompts

**File:** `src/components/ui/ChatPrompts.tsx`

**Props:**
```typescript
{
  element: ElementType;
  locale: 'ko' | 'en';
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}
```

**Features:**
- Suggested conversation starters
- Element-themed prompts
- Bilingual prompt options

---

### BottomNav

**File:** `src/components/ui/BottomNav.tsx`

**Features:**
- Mobile navigation bar
- Auto-generated from header items
- Active state indicator
- Fixed bottom positioning

---

### SpotlightBackground / AuroraBackground

**Files:** `src/components/ui/SpotlightBackground.tsx`, `src/components/ui/AuroraBackground.tsx`

**Features:**
- Animated background effects
- CSS keyframe animations
- Configurable colors and intensity

---

### Accessibility Components

#### FocusTrap

**File:** `src/components/ui/FocusTrap.tsx`

**Features:**
- Traps focus within modals/dialogs
- Keyboard navigation support

#### SkipToContent

**File:** `src/components/ui/SkipToContent.tsx`

**Features:**
- Accessibility skip link
- Hidden until focused

---

## Layout Components

### Header

**File:** `src/components/layout/Header.tsx`

**Functions:**
- `handleMobileMenuToggle()` - Opens/closes mobile menu
- `handleLanguageToggle()` - Switches locale
- `getCurrentNavItem()` - Determines active nav item

**Features:**
- Fixed navbar with scroll behavior
- Desktop navigation links
- Mobile hamburger menu
- Language toggle (KO/EN)
- Booking CTA button
- Logo with home link

---

### Footer

**File:** `src/components/layout/Footer.tsx`

**Sections:**
- Brand column (logo, tagline)
- Quick links column
- Contact information
- Business hours
- Social media links
- Copyright notice

---

## Landing Page Components

### HeroSection

**File:** `src/components/landing/HeroSection.tsx`

**Features:**
- Full-width hero banner
- Animated guardian introduction
- Dual CTA buttons (Explore / Book)
- Background gradient effects

---

### GuardianShowcase

**File:** `src/components/landing/GuardianShowcase.tsx`

**Features:**
- 5 guardian cards in responsive grid
- Hover animations
- Element color theming
- Links to guardian detail pages

---

### SajuPreview

**File:** `src/components/landing/SajuPreview.tsx`

**Features:**
- Saju feature explanation
- Four Pillars visualization preview
- CTA to Saju analysis page

---

### TourPreview

**File:** `src/components/landing/TourPreview.tsx`

**Features:**
- Location cards with images
- Guardian associations
- Interactive hover states
- CTA to tour page

---

### ScentPreview

**File:** `src/components/landing/ScentPreview.tsx`

**Features:**
- Scent collection showcase
- Element-based categorization
- CTA to scent page

---

### KeepsakesPreview

**File:** `src/components/landing/KeepsakesPreview.tsx`

**Features:**
- Keepsake types preview
- Sample designs
- CTA to keepsakes page

---

### BookingCTA

**File:** `src/components/landing/BookingCTA.tsx`

**Features:**
- Strong call-to-action section
- Package highlights
- Price starting point
- Link to booking flow

---

## Data Models

### Guardians

**File:** `src/data/guardians.ts`

```typescript
type GuardianId = 'hwangryong' | 'baekho' | 'hyeonmu' | 'cheongryong' | 'jujak';
type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

interface Guardian {
  id: GuardianId;
  name: { ko: string; hanja: string; en: string };
  element: ElementType;
  domain: { ko: string; en: string };
  role: { ko: string; en: string };
  description: { ko: string; en: string };
  personality: string[];
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
    bgLight: string;
  };
  greeting: { ko: string; en: string };
  systemPrompt: string;
  image: string;
}
```

**The 5 Guardians:**
| ID | Name | Element | Domain | Role |
|----|------|---------|--------|------|
| hwangryong | 황룡 | Earth (토) | Herb Garden | Nurturing guide |
| baekho | 백호 | Metal (금) | Tea House | Disciplined mentor |
| hyeonmu | 현무 | Water (수) | Sacred Ground | Mysterious protector |
| cheongryong | 청룡 | Wood (목) | Green Tea Field | Growth catalyst |
| jujak | 주작 | Fire (화) | Dragon Pond | Passionate inspirer |

---

### Packages

**File:** `src/data/packages.ts`

```typescript
type PackageType = 'day' | 'overnight' | 'vip';

interface BookingPackage {
  id: PackageType;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  price: number;
  priceDisplay: { ko: string; en: string };
  duration: { ko: string; en: string };
  features: { ko: string[]; en: string[] };
  includes: {
    guardianChat: boolean;
    sajuAnalysis: 'basic' | 'detailed' | 'premium';
    tour: 'partial' | 'full' | 'private';
    meals: number;
    accommodation: boolean;
  };
  popular?: boolean;
}
```

**Pricing:**
| Package | Duration | Price (KRW) | Price (USD) |
|---------|----------|-------------|-------------|
| Day | 5 hours | ₩150,000 | $120 |
| Overnight | 1N2D | ₩350,000 | $280 |
| VIP | 2N3D | ₩800,000 | $640 |

---

### Locations

**File:** `src/data/locations.ts`

```typescript
interface LocationPOI {
  id: string;
  name: { ko: string; hanja: string; en: string };
  guardianId: GuardianId;
  element: ElementType;
  coordinates: { lat: number; lng: number };
  description: { ko: string; en: string };
  features: string[];
  activities: { ko: string[]; en: string[] };
}
```

**5 Locations:**
| Name | Guardian | Activities |
|------|----------|------------|
| 약초원 (Herb Garden) | Hwangryong | Herb picking, meditation |
| 오하산방 (Tea House) | Baekho | Tea ceremony, calligraphy |
| 명당 기도터 (Sacred Ground) | Hyeonmu | Prayer, energy healing |
| 녹차밭 (Green Tea Field) | Cheongryong | Tea picking, walking |
| 용소 (Dragon Pond) | Jujak | Reflection, fire ceremony |

---

### Scents

**File:** `src/data/scents.ts`

```typescript
interface ScentNote {
  name: { ko: string; en: string };
  element: ElementType;
}

interface ScentBlend {
  id: string;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  dominantElement: ElementType;
  notes: {
    top: ScentNote[];
    middle: ScentNote[];
    base: ScentNote[];
  };
  benefits: { ko: string[]; en: string[] };
  image: string;
}
```

**5 Scent Blends:**
| Name | Element | Key Notes |
|------|---------|-----------|
| 청룡의 숲 | Wood | Pine, green tea, moss |
| 주작의 불꽃 | Fire | Cinnamon, ginger, clove |
| 황룡의 정원 | Earth | Sandalwood, agarwood, honey |
| 백호의 정제 | Metal | Frankincense, plum, lily |
| 현무의 신비 | Water | Lotus, seaweed, schisandra |

---

## Utility Functions

### `src/lib/utils.ts`

```typescript
// Class name merger (clsx + tailwind-merge)
function cn(...inputs: ClassValue[]): string

// Localized date formatting
function formatDate(date: Date | string, locale: 'ko' | 'en'): string

// Localized time formatting (AM/PM or 오전/오후)
function formatTime(hour: number, locale: 'ko' | 'en'): string

// Async delay utility
function sleep(ms: number): Promise<void>

// Get CSS variable for element color
function getElementColor(element: ElementType): string

// Get CSS variable for guardian color
function getGuardianColor(guardianId: GuardianId): string
```

---

## i18n System

### `src/lib/i18n.tsx`

**Context:**
```typescript
interface LocaleContextType {
  locale: 'ko' | 'en';
  setLocale: (locale: 'ko' | 'en') => void;
  t: (key: string, params?: Record<string, string>) => string;
}
```

**Components & Hooks:**
```typescript
// Provider component
<LocaleProvider>{children}</LocaleProvider>

// Hook for accessing locale
const { locale, setLocale, t } = useLocale();

// Translation function
t('nav.home')                    // Simple key
t('greeting', { name: 'John' })  // With interpolation
```

**Translation Files:**
- `/src/locales/ko.json` - Korean translations
- `/src/locales/en.json` - English translations

**Key Namespaces:**
- `nav.*` - Navigation items
- `common.*` - Common UI text
- `saju.*` - Saju analysis text
- `guardian.*` - Guardian-related text
- `booking.*` - Booking flow text
- `error.*` - Error messages

---

## Data Flow

### Saju Analysis Flow

```
1. User fills /saju form
   └── Validates: birthDate required, 1900+, not future

2. POST /api/saju
   └── Gemini generates Four Pillars analysis

3. Store in sessionStorage
   └── Keys: sajuResult, sajuBirthDate

4. Navigate to /saju/result
   └── Display: pillars, elements, guardian, advice
```

### Guardian Chat Flow

```
1. User navigates to /guardians/[id]
   └── Load guardian data and greeting

2. User sends message
   └── POST /api/chat with guardianId, message, history

3. Gemini responds with guardian personality
   └── Append to messages, scroll to bottom

4. After 3+ messages
   └── Show booking CTA banner
```

### Booking Flow

```
1. /booking - Package Selection
   └── Store packageType in sessionStorage

2. /booking/calendar - Date Selection
   └── Validate: 3+ days advance, not blocked Wednesday
   └── Store bookingDate in sessionStorage

3. /booking/confirm - Review & Confirm
   └── POST /api/itinerary for personalized schedule
   └── Display itinerary and summary
   └── On confirm: clear session, show success
```

---

## Session Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `sajuResult` | JSON string | Saju analysis result |
| `sajuBirthDate` | string | Birth date used for Saju |
| `bookingPackage` | PackageType | Selected package |
| `bookingDate` | string | Selected visit date |

---

## CSS Variables

### Element Colors
```css
--element-wood: #22c55e;
--element-fire: #ef4444;
--element-earth: #eab308;
--element-metal: #a1a1aa;
--element-water: #3b82f6;
```

### Guardian Colors
```css
--guardian-hwangryong: #eab308;
--guardian-baekho: #e5e7eb;
--guardian-hyeonmu: #1e3a5f;
--guardian-cheongryong: #059669;
--guardian-jujak: #dc2626;
```

### Theme Colors
```css
--primary-dark: #1a1a2e;
--surface: #ffffff;
--border: #e5e7eb;
--accent: #8b5cf6;
```

---

## File Structure Summary

```
/src
├── /app
│   ├── /api
│   │   ├── /chat/route.ts
│   │   ├── /itinerary/route.ts
│   │   └── /saju/route.ts
│   ├── /booking
│   │   ├── page.tsx
│   │   ├── /calendar/page.tsx
│   │   └── /confirm/page.tsx
│   ├── /guardians
│   │   ├── page.tsx
│   │   └── /[id]/page.tsx
│   ├── /keepsakes/page.tsx
│   ├── /saju
│   │   ├── page.tsx
│   │   └── /result/page.tsx
│   ├── /scent/page.tsx
│   ├── /tour/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── /components
│   ├── /landing (7 components)
│   ├── /layout (2 components)
│   └── /ui (17+ components)
├── /data
│   ├── guardians.ts
│   ├── locations.ts
│   ├── packages.ts
│   └── scents.ts
├── /lib
│   ├── i18n.tsx
│   └── utils.ts
└── /locales
    ├── en.json
    └── ko.json
```

---

*Generated for Cheongrium Demo - A wellness booking platform combining traditional Korean philosophy with modern web technology.*
