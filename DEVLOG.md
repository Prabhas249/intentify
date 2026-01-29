# Development Log

> Updated after every coding session. Tracks what was done, how, and what's next.

---

## Session 5 - January 29, 2025

### What We Did
- Added 6 new analytics features to the dashboard
- Switched database recommendation from Neon to Supabase (user already has account)

### Features Added

**1. Scroll Depth Persistence**
- Added `scrollDepth` field to Visitor model (stores max scroll %)
- Events API now persists scroll depth on visitor record (keeps highest value)
- Shown in visitor detail sheet, visitors table, and analytics dashboard (avg %)

**2. Country/City Detection**
- Added `city` field to Visitor model (`country` already existed but was unused)
- Events API extracts Vercel geo headers (`x-vercel-ip-country`, `x-vercel-ip-city`) -- free, zero latency
- New "Geography" tab in analytics with Top Countries + Top Cities tables
- Shown in visitor detail sheet and visitors table

**3. OS Detection**
- Added `os` field to Visitor model
- Added `getOS()` function to tracker.js (detects iOS, macOS, Windows, Android, Linux, ChromeOS)
- Events API stores OS on first visit
- New "Operating Systems" card in analytics dashboard
- Shown in visitor detail sheet and visitors table (combined Device/OS column)

**4. Bounce Rate**
- Calculated from existing data (visitors with only 1 page view)
- Shown as stat card in analytics dashboard row 2

**5. New vs Returning Split**
- Created `NewVsReturningChart` component using Recharts PieChart (donut chart)
- Added as third card in the charts grid (Intent + Device + New vs Returning)

**6. Conversion Path Visualization**
- Created `ConversionPathView` component with:
  - Most common conversion patterns (flow diagrams with badges)
  - Individual visitor journeys (accordion with vertical timeline)
  - Color-coded event types, time deltas between steps, campaign names
- New "Conversion Paths" tab in analytics
- Queries visitors who have POPUP_CONVERSION events, traces full event chain

### Files Modified
```
prisma/schema.prisma                              # +3 fields: scrollDepth, os, city
public/embed/tracker.js                            # +getOS() function
src/app/api/v1/events/route.ts                     # Persist scroll, geo, OS
src/components/analytics/visitor-detail.tsx         # Show scroll, OS, city
src/app/(dashboard)/visitors/page.tsx               # Device/OS, Location, Scroll columns
src/app/(dashboard)/analytics/page.tsx              # All 6 features in dashboard
src/components/analytics/index.ts                   # New exports
```

### Files Created
```
src/components/analytics/new-vs-returning-chart.tsx # Recharts donut chart
src/components/analytics/conversion-path.tsx        # Flow diagrams + journey timelines
```

### Analytics Dashboard Now Shows
- **8 stat cards** (2 rows): Total Visitors, Impressions, Conversions, High Intent, Avg Scroll Depth, Bounce Rate, Click Rate, Conversion Paths
- **4 chart cards** (3-col grid): Intent Breakdown, Device Breakdown, New vs Returning
- **OS Breakdown** card (responsive grid)
- **6 tabs**: Traffic Sources, Top Pages, Geography, Campaigns, Conversion Paths, Recent Visitors

### Current Status
- [x] All 6 analytics features built
- [x] TypeScript compiles clean
- [x] Build passes
- [ ] Database setup (user task -- Supabase)
- [ ] Razorpay integration
- [ ] WhatsApp popups

### Next Steps
1. User: Set up Supabase database + `.env`
2. User: Set up Google OAuth
3. User: Run `npx prisma db push`
4. Build Razorpay billing integration
5. Build WhatsApp popup types

---

## Session 4 - January 27, 2025

### What We Did
- Built complete Marketing Landing Page
- Created animated globe component (canvas-based)
- Created animated background effects (grid, glow, particles)
- Installed framer-motion for animations
- Added shadcn accordion and carousel components

### How We Did It
- Created `AnimatedGlobe` component using HTML5 Canvas with rotating longitude lines and Indian city points
- Created `GridBackground`, `GlowEffect`, `FloatingParticles` components for visual atmosphere
- Built full landing page with framer-motion scroll animations
- Added custom CSS keyframe animations (float, pulse-slow, shimmer, gradient-shift)
- Used shadcn Accordion for FAQ section

### Files Created
```
src/
├── app/
│   ├── page.tsx                    # Complete landing page (~980 lines)
│   └── globals.css                 # Added animation keyframes
└── components/landing/
    ├── animated-globe.tsx          # Canvas-based rotating globe
    └── animated-beam.tsx           # GridBackground, GlowEffect, FloatingParticles
```

### Landing Page Sections
1. **Sticky Navbar** - Logo, nav links, mobile hamburger menu
2. **Hero Section** - Headline, subheadline, CTA buttons, animated globe, floating stat cards
3. **Stats Section** - 500+ brands, 2.4M visitors, 147% conversion lift, ₹12Cr+ revenue
4. **Features Grid** - 9 feature cards with gradient icons and descriptions
5. **How It Works** - 3-step visual flow (Install → Configure → Convert)
6. **Pricing Section** - 4 tiers (Free, Starter ₹999, Growth ₹2,499, Pro ₹4,999)
7. **Testimonials** - 3 customer quotes with avatars
8. **FAQ Section** - 6 questions using shadcn Accordion
9. **CTA Section** - Gradient background with final call-to-action
10. **Footer** - Links, social icons, copyright

### Animation Features
- Framer-motion scroll-triggered animations with stagger
- Canvas-based rotating globe with Indian city points
- Floating particles with random positions and delays
- Gradient glow effects
- Grid background pattern
- Custom CSS keyframes for float, pulse, shimmer effects

### Current Status
- [x] Landing page complete
- [x] Animated globe
- [x] All 10 sections built
- [x] Mobile responsive
- [x] Build compiles successfully
- [ ] Database setup (user task)
- [ ] Razorpay integration

### Next Steps
1. User: Set up Neon database
2. User: Run Prisma migrations
3. Add Razorpay integration
4. Test end-to-end flow
5. Deploy to Vercel

---

## Session 3 - January 27, 2025

### What We Did
- Built Analytics Dashboard with overview stats
- Built Visitors page with full table and filters
- Built All Campaigns page (cross-website view)
- Built visitor detail sheet component
- Created website selector component for analytics

### How We Did It
- Created `/analytics` page with shadcn Cards and Tables
- Created `/visitors` page with pagination, filters, and visitor detail sheet
- Created `/campaigns` page for cross-website campaign management
- Used shadcn Table, Badge, Tabs, Select components throughout
- Implemented intent breakdown, device breakdown, traffic sources tables

### Files Created
```
src/
├── app/(dashboard)/
│   ├── analytics/page.tsx
│   ├── visitors/page.tsx
│   └── campaigns/page.tsx
└── components/analytics/
    ├── index.ts
    ├── website-selector.tsx
    └── visitor-detail.tsx
```

### Analytics Features
- **Overview Stats:** Total visitors, impressions, conversions, high intent count
- **Intent Breakdown:** Visual progress bars for LOW/MEDIUM/HIGH
- **Device Breakdown:** Desktop vs Mobile comparison
- **Traffic Sources Table:** UTM source breakdown with percentages
- **Top Pages Table:** Most visited pages
- **Campaign Performance Table:** Per-campaign stats
- **Recent Visitors Table:** Latest activity

### Visitors Features
- **Stats Cards:** Total visitors, high intent, avg visits, avg time
- **Filters:** Search, intent level, traffic source
- **Pagination:** 20 visitors per page
- **Visitor Detail Sheet:** Click to view full visitor profile
- **Export CSV:** Button ready (needs backend)

### Current Status
- [x] Analytics dashboard
- [x] Visitors page with filters
- [x] All campaigns page
- [x] Visitor detail sheet
- [ ] Database setup (user task)
- [ ] Landing page
- [ ] Razorpay integration

### Next Steps
1. User: Set up Neon database
2. User: Run Prisma migrations
3. Build landing page
4. Add Razorpay integration
5. Test end-to-end flow

---

## Session 2 - January 27, 2025

### What We Did
- Built complete Campaign Creation UI
- Built Campaign List page with stats
- Built Campaign Edit page
- Built Visual Rules Builder
- Built Live Popup Preview (6 popup types)
- Built Campaign Status Toggle
- Built Delete Campaign functionality
- Created Campaign API endpoints (CRUD)

### How We Did It
- Created `CampaignBuilder` component with tabbed interface (Basics, Content, Style, Rules)
- Created `PopupPreview` component rendering all 6 popup types on simulated website
- Created `RulesBuilder` component with 7 trigger fields and multiple operators
- Used shadcn/ui Tabs, Selects, Switches, Color Inputs for form
- Responsive preview with desktop/mobile toggle
- Quick theme presets for styling
- Example rules for quick setup

### Files Created
```
src/
├── app/
│   ├── api/
│   │   └── campaigns/
│   │       ├── route.ts (GET, POST)
│   │       └── [id]/
│   │           ├── route.ts (GET, PUT, DELETE)
│   │           └── status/route.ts (PATCH)
│   └── (dashboard)/
│       └── websites/
│           └── [id]/
│               └── campaigns/
│                   ├── page.tsx (campaigns list)
│                   ├── new/page.tsx (create campaign)
│                   └── [campaignId]/page.tsx (edit campaign)
└── components/
    └── campaign/
        ├── index.ts
        ├── campaign-builder.tsx
        ├── campaign-editor.tsx
        ├── campaign-status-toggle.tsx
        ├── delete-campaign-button.tsx
        ├── popup-preview.tsx
        └── rules-builder.tsx
```

### Campaign Builder Features
- **Basics Tab:** Name, popup type (6 options), frequency (5 options), priority
- **Content Tab:** Headline, subheadline, body, image URL, lead capture fields, CTA
- **Style Tab:** Colors (background, text, accent), border radius, quick themes
- **Rules Tab:** Visual rule builder with AND/OR logic

### Popup Types Supported
1. Modal - Center popup with overlay
2. Slide-in - Corner slide panel
3. Banner - Top bar
4. Floating - Floating button
5. Bottom Sheet - Mobile-friendly bottom panel
6. Full Screen - Takes entire screen

### Trigger Rules Available
- `visitCount` - Number of visits (>, <, =, etc.)
- `intentScore` - Engagement score 0-100
- `intentLevel` - LOW, MEDIUM, HIGH
- `page` - URL path (contains, starts with, etc.)
- `utmSource` - Traffic source
- `referrer` - Where visitor came from
- `device` - mobile or desktop

### Current Status
- [x] Campaign creation UI
- [x] Campaign list with stats
- [x] Campaign editing
- [x] Visual rules builder
- [x] Live preview
- [x] Status toggle
- [x] Campaign deletion
- [ ] Database setup (user task)
- [ ] Analytics dashboard
- [ ] Visitors list

### Next Steps
1. User: Set up Neon database
2. User: Run Prisma migrations
3. Build analytics dashboard
4. Build visitors list page
5. Test end-to-end flow

---

## Session 1 - January 27, 2025

### What We Did
- Initialized Next.js 14 project with TypeScript
- Set up Tailwind CSS v4
- Installed shadcn/ui with 20+ components
- Created Prisma schema with all tables
- Set up NextAuth with Google provider
- Created dashboard layout with sidebar
- Built websites management pages
- **Built complete tracking script (tracker.js)**
- **Built events API endpoint**
- **Built campaigns API endpoint**

### How We Did It
- `npx create-next-app@latest` with TypeScript + Tailwind
- `npx shadcn@latest init` + added components (button, card, sidebar, etc.)
- `npx prisma init` + wrote full schema
- NextAuth v5 with PrismaAdapter
- shadcn sidebar component for navigation
- Pure JavaScript tracking script with Shadow DOM popups

### Files Created
```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── websites/route.ts
│   │   └── v1/
│   │       ├── events/route.ts      ← NEW
│   │       └── campaigns/route.ts   ← NEW
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   └── websites/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/ (20+ shadcn components)
│   └── dashboard/
│       ├── sidebar.tsx
│       └── copy-button.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
public/
└── embed/
    └── tracker.js                   ← NEW (21KB unminified)
prisma/
└── schema.prisma (complete schema)
```

### Tracking Script Features (tracker.js)
- Visitor identification (cookie + localStorage)
- Visit counting & page tracking
- UTM parameter parsing
- Referrer detection (Google, Instagram, etc.)
- Scroll depth tracking
- Time on page tracking
- Intent scoring algorithm
- Shadow DOM popup rendering (CSS isolated)
- Frequency capping (session, day, week, ever)
- WhatsApp integration support
- Lead capture (email, phone)

### API Endpoints Created
- `POST /api/v1/events` - Track visitor events
- `GET /api/v1/campaigns` - Fetch campaigns for website

### Current Status
- [x] Next.js project initialized
- [x] Tailwind CSS configured
- [x] shadcn/ui components installed
- [x] Prisma schema created
- [x] NextAuth configured
- [x] Dashboard layout with sidebar
- [x] Websites CRUD (list, create, view)
- [x] Tracking script (tracker.js)
- [x] Events API endpoint
- [x] Campaigns API endpoint
- [ ] Database migration (needs Neon setup)
- [ ] Campaign creation UI

### Next Steps
1. Set up Neon database (see TODO.md)
2. Run Prisma migrations
3. Build campaign creation UI
4. Test end-to-end flow

---

## Session 0 - January 27, 2025 (Planning)

### What We Did
- Created complete startup plan
- Defined all features and technical decisions
- Set up project documentation structure

### Key Decisions Made
- **Product:** D2C smart popup tool for India
- **Features:** Visitor memory + UTM tracking + Intent scoring + Smart popups
- **Tech:** Next.js 14 + TypeScript + Prisma + Neon + Razorpay
- **Pricing:** Free → ₹4,999/mo with 17% annual discount
- **WhatsApp:** Click-to-chat + number collection (no API in MVP)

### Files Created
- `CLAUDE.md` - Product context for Claude
- `DEVLOG.md` - This file
- `FEATURES.md` - Feature tracker
- `PLAN.md` - Full business plan

---
