# Smart Popup Tool - Project Context

> This file provides Claude with full context about the project. Read this first in every session.

## Product Overview

**What:** A D2C smart popup tool with visitor memory for the Indian market
**Target:** Indian D2C brands, course creators, e-commerce stores
**Pricing:** Free tier + ₹999-4,999/month
**Timeline:** 3 weeks to MVP

### Core Value Proposition
A smart popup tool that **remembers visitors** and shows **personalized offers** based on their behavior - visit count, traffic source, pages viewed, and time spent.

### Key Differentiators (India-First)
- **INR Pricing** - Affordable (competitors charge $29-199/mo)
- **WhatsApp Popups** - Click-to-chat + number collection
- **Razorpay Integration** - Native Indian payments
- **Lightweight Script** - ~5KB, optimized for Indian internet
- **Full Visitor Intelligence** - UTM + Intent scoring + Behavior memory

---

## Core Features (All 3 Included in MVP)

### 1. Visitor Memory & Tracking Script
- Cookie/localStorage based identification
- Tracks: visit_count, pages_viewed, time_on_site, scroll_depth, device
- Server-side session ID fallback when cookies blocked

### 2. UTM/Source Attribution
- Parse: utm_source, utm_medium, utm_campaign
- Detect referrer: Instagram, Google, Facebook, WhatsApp, Direct
- First-touch and last-touch attribution

### 3. Intent Scoring Engine
```
Scoring Logic:
visit_count > 1      → +10 pts
visit_count > 3      → +20 pts
viewed /pricing      → +30 pts
viewed /checkout     → +25 pts
time_on_site > 2min  → +15 pts
scroll_depth > 50%   → +10 pts

Score 0-30   = LOW    (browsing)
Score 31-60  = MEDIUM (interested)
Score 61+    = HIGH   (ready to buy)
```

### 4. Smart Popup Builder
- Form-based editor (MVP), drag-drop in v2
- Types: Modal, Slide-in, Banner, Floating button
- Fully customizable: colors, fonts, text, images, CTA
- Shadow DOM isolation (no CSS conflicts)
- Mobile: Bottom sheet default

---

## Tech Stack

```
Frontend:     Next.js 14 + TypeScript + Tailwind CSS
UI:           shadcn/ui dashboard components
Backend:      Next.js API Routes + Prisma ORM
Database:     PostgreSQL (Supabase)
Auth:         NextAuth.js (Google, Email)
Payments:     Razorpay
Hosting:      Vercel
Rate Limit:   Upstash Redis
```

---

## Database Schema

```sql
users:
  id, email, name, company, plan, razorpay_customer_id, created_at

websites:
  id, user_id, domain, script_key, settings_json, created_at

campaigns:
  id, website_id, name, popup_type, trigger_rules_json,
  content_json, status (active/paused), priority, created_at

visitors:
  id, website_id, visitor_hash,
  visit_count, pages_viewed[], time_on_site_seconds,
  utm_source, utm_medium, utm_campaign, referrer,
  intent_score (0-100), intent_level (low/medium/high),
  device, first_seen, last_seen

events:
  id, campaign_id, visitor_hash,
  event_type (impression/click/conversion/dismiss),
  created_at

subscriptions:
  id, user_id, razorpay_subscription_id, plan, status,
  current_period_start, current_period_end
```

---

## Pricing Tiers

| Plan | Price | Visitors/mo | Popups | Features |
|------|-------|-------------|--------|----------|
| Free | ₹0 | 1,000 | 1 | Basic popup, Limited analytics |
| Starter | ₹999/mo | 10,000 | 3 | Full customization, Email support |
| Growth | ₹2,499/mo | 50,000 | 10 | + WhatsApp, A/B testing |
| Pro | ₹4,999/mo | 200,000 | Unlimited | + Priority support, API access |

**Annual:** 17% discount (2 months free)

---

## Technical Decisions

### Script & Tracking
| Decision | Implementation |
|----------|----------------|
| Ad blockers | Disguised endpoints (avoid /track, /pixel) |
| CORS | Proper headers + validate origin |
| Cookies blocked | Server-side session ID fallback |
| Script caching | CDN 1 hour, versioned URL |

### Product Rules
| Decision | Implementation |
|----------|----------------|
| Visitor counting | Unique visitors/month |
| Cookie clearing | Accept reset (privacy-first) |
| Popup frequency | Customer chooses (default: once/session) |
| Multiple popups | Priority queue, show highest only |

### Security
| Decision | Implementation |
|----------|----------------|
| Domain verification | Server validates origin header |
| XSS prevention | DOMPurify + React auto-escaping |
| Rate limiting | Upstash Redis: 100/sec per IP |
| Key security | Domain binding |

### UX
| Decision | Implementation |
|----------|----------------|
| Popup builder | Form-based (MVP) |
| CSS conflicts | Shadow DOM isolation |
| Z-index | Maximum (2147483647) |
| Mobile popups | Bottom sheet default |

### Business
| Decision | Implementation |
|----------|----------------|
| Visitor limits | Soft warn 80% → Hard stop 120% |
| Overage | Force upgrade, no overage fees |
| Refunds | 7-day money-back guarantee |

---

## WhatsApp Integration (MVP)

### Click-to-Chat (Free)
```
Link: https://wa.me/919876543210?text=Hi%20I%20want%20to%20know%20more
```

### Number Collection
Popup collects number → Saves to DB → Brand follows up manually

### NOT in MVP
WhatsApp Business API (v2 - needs Meta approval)

---

## File Structure

```
C:\Users\prabh\Desktop\priricing pop-up\
├── CLAUDE.md          # This file - product context
├── DEVLOG.md          # Development progress log
├── FEATURES.md        # Feature status tracker
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── popup-builder/
│   │   └── landing/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── embed/
│       └── tracker.js
├── prisma/
│   └── schema.prisma
├── public/
├── package.json
└── tailwind.config.ts
```

---

## API Endpoints (Planned)

### Public (Embed Script)
- `POST /api/v1/events` - Track visitor events
- `GET /api/v1/campaigns` - Fetch active campaigns for domain

### Dashboard (Authenticated)
- `GET/POST /api/websites` - Manage websites
- `GET/POST /api/campaigns` - Manage campaigns
- `GET /api/analytics` - Fetch analytics data
- `GET /api/visitors` - List visitors with scores
- `POST /api/billing/subscribe` - Razorpay subscription

---

## Competitor Reference

### VisiLead (US B2B - $29-79/mo)
- Uses IP lookup for company identification
- B2B focused, not D2C
- No WhatsApp, no Razorpay

### Privy ($15/mo), OptiMonk ($39/mo)
- D2C popup tools
- USD pricing only
- No Indian payment methods
- No WhatsApp integration

### Our Position
**"VisiLead's intelligence + Privy's popups + India pricing"**

---

## Session Instructions

1. Read DEVLOG.md to see current progress
2. Read FEATURES.md to see what's done/pending
3. Continue from where we left off
4. Update DEVLOG.md after each session
5. Update FEATURES.md when feature status changes
