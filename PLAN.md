# Smart Popup Tool with Visitor Memory (Name TBD)

## Startup Plan & Technical Blueprint

**Timeline:** 3 weeks to MVP + polished plan
**Target Market:** Indian D2C brands, course creators, e-commerce stores
**Pricing:** Free tier + ₹999 - ₹4,999/month
**UI Framework:** shadcn/ui (pre-built dashboard components)

---

## 1. Product Overview

### Core Value Proposition
A smart popup tool that **remembers visitors** and shows **personalized offers** based on their behavior - visit count, traffic source, pages viewed, and time spent.

### Key Differentiators (India-First)
- **INR Pricing** - Affordable for Indian SMBs (competitors charge $29-199/mo)
- **WhatsApp Popups** - Direct WhatsApp chat/collect numbers
- **Razorpay Integration** - Native Indian payment gateway
- **Lightweight Script** - Optimized for Indian internet speeds
- **Full Visitor Intelligence** - UTM tracking + Intent scoring + Behavior memory

### Core Feature Stack (All 3 Included)
1. **D2C Popup Tool** - Smart popups triggered by visitor behavior
2. **UTM/Source Tracking** - Know if visitor came from Instagram, Google, WhatsApp, etc.
3. **Intent Scoring** - Auto-score visitors as Low/Medium/High based on engagement

---

## 2. MVP Features (Week 1-2)

### Feature 1: Visitor Memory & Tracking Script (~5KB JS)
- [ ] **Visitor Identification** (cookie/localStorage based)
  - Unique visitor hash (anonymous, privacy-compliant)
  - Persistent across sessions

- [ ] **Behavior Tracking**
  - `visit_count` - How many times they've visited
  - `pages_viewed[]` - Which pages they looked at
  - `time_on_site` - Total engagement time
  - `scroll_depth` - How far they scrolled
  - `device` - Mobile/Desktop
  - `first_seen` / `last_seen` timestamps

### Feature 2: UTM/Source Attribution
- [ ] **Traffic Source Detection**
  - Parse UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`
  - Detect referrer: Instagram, Google, Facebook, WhatsApp, Direct
  - Store first-touch and last-touch attribution

- [ ] **Source-Based Triggers**
  ```
  IF utm_source = "instagram" THEN show "instagram_welcome"
  IF referrer = "google" THEN show "google_discount"
  ```

### Feature 3: Intent Scoring Engine
- [ ] **Auto-Score Visitors** (Low / Medium / High)
  ```
  Scoring Logic:
  ─────────────────────────────────
  visit_count > 1      → +10 pts
  visit_count > 3      → +20 pts
  viewed /pricing      → +30 pts
  viewed /checkout     → +25 pts
  time_on_site > 2min  → +15 pts
  scroll_depth > 50%   → +10 pts
  ─────────────────────────────────
  Score 0-30   = LOW    (browsing)
  Score 31-60  = MEDIUM (interested)
  Score 61+    = HIGH   (ready to buy)
  ```

- [ ] **Intent-Based Triggers**
  ```
  IF intent_score = "high" AND NOT converted THEN show "final_push_offer"
  ```

### Feature 4: Smart Popup Builder
- [ ] **Popup Builder** (Fully Customizable)
  - Visual editor with live preview
  - Customize: colors, fonts, text, images, CTA buttons
  - Popup types: Modal, Slide-in, Banner, Floating button, Full-screen
  - Mobile-responsive previews

- [ ] **Rules Engine** (Combine all triggers)
  ```
  IF visit_count > 3 AND current_page = "/pricing" THEN show "loyalty_discount"
  IF utm_source = "instagram" AND intent = "medium" THEN show "instagram_10off"
  IF time_on_page > 60s AND scroll > 50% THEN show "exit_intent"
  IF intent = "high" AND visits > 5 THEN show "vip_offer"
  ```

### Phase 2: Dashboard
- [ ] **Analytics Dashboard**
  - Popup views, conversions, conversion rate
  - Visitor segments breakdown
  - Revenue attribution (if integrated)

- [ ] **Campaign Management**
  - Create/edit/pause campaigns
  - A/B testing (v2)
  - Scheduling

---

## 3. Technical Architecture

### Tech Stack
```
Frontend:     Next.js 14 + TypeScript + Tailwind CSS
Backend:      Next.js API Routes + Prisma ORM
Database:     PostgreSQL (Supabase/Neon)
Auth:         NextAuth.js (Google, Email)
Payments:     Razorpay
Hosting:      Vercel (frontend) + Railway/Render (if needed)
Analytics:    PostHog (self-hosted or cloud)
```

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        COMPLETE SYSTEM FLOW                          │
└──────────────────────────────────────────────────────────────────────┘

   D2C BRAND'S WEBSITE                    YOUR SAAS PLATFORM
   ─────────────────────                  ─────────────────────

   ┌─────────────────┐                    ┌─────────────────┐
   │  Visitor lands  │                    │   Dashboard     │
   │  on website     │                    │   (Next.js)     │
   └────────┬────────┘                    └────────▲────────┘
            │                                      │
            ▼                                      │
   ┌─────────────────┐     Track & Score    ┌─────┴─────────┐
   │  Embed Script   │────────────────────▶ │   API Routes  │
   │  (~5KB JS)      │                      │  (Next.js)    │
   └────────┬────────┘                      └───────┬───────┘
            │                                       │
            │ Collects:                             ▼
            │ • visit_count                 ┌───────────────┐
            │ • pages_viewed                │  PostgreSQL   │
            │ • utm_source                  │   (Neon)      │
            │ • time_on_site                │               │
            │ • scroll_depth                │  • visitors   │
            │                               │  • campaigns  │
            ▼                               │  • events     │
   ┌─────────────────┐                      └───────────────┘
   │ Intent Scoring  │
   │ ───────────────│
   │ Low / Med / High│
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐     Fetch Rules      ┌───────────────┐
   │  Rules Engine   │◀────────────────────│   Campaigns   │
   │                 │                      │   Database    │
   │ IF intent=high  │                      └───────────────┘
   │ AND visits > 3  │
   │ THEN show popup │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  SHOW POPUP     │
   │  ┌───────────┐  │
   │  │ 🎉 20% OFF│  │
   │  │ [Claim]   │  │
   │  └───────────┘  │
   └─────────────────┘

   INTEGRATIONS
   ─────────────
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Razorpay │  │ WhatsApp │  │ Webhooks │
   │ Payments │  │ Click2Chat│  │ Leads    │
   └──────────┘  └──────────┘  └──────────┘
```

### Database Schema (Core Tables)

```sql
-- Users (website owners / your customers)
users:
  id, email, name, company, plan, razorpay_customer_id, created_at

-- Websites registered by users
websites:
  id, user_id, domain, script_key, settings_json, created_at

-- Popup campaigns
campaigns:
  id, website_id, name, popup_type, trigger_rules_json,
  content_json, status (active/paused), created_at

-- Visitor tracking (anonymized - stored per website)
visitors:
  id, website_id, visitor_hash,
  visit_count, pages_viewed[], time_on_site_seconds,
  utm_source, utm_medium, utm_campaign, referrer,
  intent_score (0-100), intent_level (low/medium/high),
  device, first_seen, last_seen

-- Popup events (analytics)
events:
  id, campaign_id, visitor_hash,
  event_type (impression/click/conversion/dismiss),
  created_at

-- Subscriptions (Razorpay)
subscriptions:
  id, user_id, razorpay_subscription_id, plan, status,
  current_period_start, current_period_end
```

---

## 4. Pricing Strategy (INR)

| Plan | Price | Visitors/mo | Popups | Features |
|------|-------|-------------|--------|----------|
| **Free** | ₹0 | 1,000 | 1 | Basic popup, Limited analytics |
| **Starter** | ₹999/mo | 10,000 | 3 | Full customization, Email support |
| **Growth** | ₹2,499/mo | 50,000 | 10 | + WhatsApp, A/B testing |
| **Pro** | ₹4,999/mo | 200,000 | Unlimited | + Priority support, API access |

**Why this works:**
- Privy starts at $15/mo (~₹1,250) but limited features
- OptiMonk starts at $39/mo (~₹3,250)
- Indian brands get better value + local support

---

## 5. Three-Week Roadmap

### Week 1: Core Engine & Tracking
**Days 1-2: Project Setup**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Tailwind CSS + shadcn/ui dashboard components
- [ ] Configure Prisma + PostgreSQL (Neon)
- [ ] Set up NextAuth (Google + Email login)
- [ ] Create basic dashboard shell (sidebar, layout)

**Days 3-4: Tracking Script (Feature 1 & 2)**
- [ ] Build embeddable tracking script (~5KB)
- [ ] Visitor identification (cookie + localStorage)
- [ ] Behavior tracking: visit_count, pages_viewed, time_on_site, scroll_depth
- [ ] UTM parameter parsing (utm_source, utm_medium, utm_campaign)
- [ ] Referrer detection (Instagram, Google, Direct, etc.)
- [ ] API endpoints for script ↔ server communication

**Days 5-7: Intent Scoring (Feature 3)**
- [ ] Intent scoring algorithm implementation
- [ ] Score calculation on each page view
- [ ] Intent level assignment (Low/Medium/High)
- [ ] Store and update visitor scores in DB
- [ ] API to fetch visitor intent for popup decisions

### Week 2: Popup System & Dashboard
**Days 8-10: Popup Engine (Feature 4)**
- [ ] Popup rendering engine (client-side)
- [ ] Popup types: Modal, Slide-in, Banner, Floating button
- [ ] Rules engine: combine visitor data + triggers
- [ ] Trigger conditions: visit_count, utm_source, intent_level, page, time
- [ ] Popup display logic (frequency capping, don't show twice)

**Days 11-13: Dashboard UI**
- [ ] Campaign creation wizard
- [ ] Visual rules builder (IF this THEN show popup)
- [ ] Popup customization panel (colors, text, CTA, images)
- [ ] Live preview (desktop + mobile)
- [ ] Campaign list with status toggle (active/paused)

**Days 14: Analytics & Visitors**
- [ ] Visitors list with intent scores
- [ ] Source attribution breakdown (pie chart)
- [ ] Popup performance: impressions, clicks, conversions
- [ ] Basic conversion funnel

### Week 3: Integrations & Launch
**Days 15-16: Integrations**
- [ ] Razorpay subscription integration (Free/Starter/Growth/Pro)
- [ ] WhatsApp popup type (click-to-chat, collect number)
- [ ] Email collection + CSV export
- [ ] Webhook for lead notifications

**Days 17-18: Landing Page & Onboarding**
- [ ] Marketing landing page (hero, features, pricing, FAQ)
- [ ] User onboarding flow (add website → get script → install)
- [ ] Script installation guide (copy-paste)
- [ ] Settings page (profile, billing, team)

**Days 19-20: Testing & Polish**
- [ ] Script performance testing (<5KB, <50ms load)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile popup testing (responsive)
- [ ] Security review (XSS prevention, CSRF tokens)

**Day 21: Launch Prep**
- [ ] Beta user invites (5-10 D2C brands)
- [ ] Feedback collection system
- [ ] Bug fixes from beta
- [ ] ProductHunt / Twitter / LinkedIn launch prep

---

## 6. Go-to-Market Strategy (India)

### Launch Channels
1. **ProductHunt India** - Schedule launch
2. **Twitter/X** - D2C founder community is active
3. **LinkedIn** - Target e-commerce decision makers
4. **WhatsApp Groups** - D2C founder groups
5. **YouTube** - Tutorial content in Hindi/English

### Initial Target Segments
1. **Shopify India stores** - Easy integration pitch
2. **Course creators** (Graphy, Teachable users)
3. **D2C brands** on Instagram selling

### Pricing Hook
> "Why pay $50/month for OptiMonk when VisiLead gives you the same at ₹999?"

---

## 7. Competitive Analysis

### vs VisiLead (US B2B Tool - $29-79/mo)
| Feature | Your Product | VisiLead |
|---------|-------------|----------|
| Target Market | D2C India | B2B US |
| Visitor ID Method | Cookies (individuals) | IP lookup (companies) |
| Pricing | ₹999/mo (~$12) | $29-79/mo |
| WhatsApp Integration | ✅ | ❌ |
| Razorpay | ✅ | ❌ (Stripe only) |
| Works for D2C | ✅ | ❌ (B2B only) |
| Intent Scoring | ✅ | ✅ |
| UTM Tracking | ✅ | ✅ |
| Smart Popups | ✅ | ✅ |

### vs D2C Popup Tools (Privy, OptiMonk)
| Feature | Your Product | Privy | OptiMonk |
|---------|-------------|-------|----------|
| INR Pricing | ✅ | ❌ | ❌ |
| WhatsApp Popups | ✅ | ❌ | ❌ |
| Razorpay | ✅ | ❌ | ❌ |
| Visitor Memory | ✅ | ✅ | ✅ |
| Intent Scoring | ✅ | ❌ | Basic |
| UTM Tracking | ✅ | ✅ | ✅ |
| Free Tier | ✅ | ✅ | ✅ |
| Price | ₹999/mo | $15/mo | $39/mo |

### Your Unique Position
**"VisiLead's intelligence + Privy's popups + India pricing"**
- Only tool with full visitor intelligence (memory + UTM + intent) at Indian prices
- WhatsApp-first = massive advantage in India

---

## 8. File Structure (Project)

```
C:\Users\prabh\Desktop\priricing pop-up\
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── popup-builder/     # Popup editor
│   │   └── landing/           # Marketing site
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   └── utils.ts           # Helpers
│   └── embed/
│       └── visilead.js        # Embeddable script
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 9. Success Metrics (First 90 Days)

| Metric | Target |
|--------|--------|
| Beta Users | 50 |
| Paying Customers | 10 |
| MRR | ₹15,000 |
| Script Installs | 100 websites |
| Popup Impressions | 100,000 |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Script performance | Keep under 5KB, lazy load |
| Cookie blocking | Server-side session ID fallback |
| Ad blockers | Disguised endpoints + self-host option v2 |
| Competition | Focus on India-specific features |
| Churn | Strong onboarding, 7-day money-back |

---

## 11. Technical Decisions

### Script & Tracking
| Question | Decision |
|----------|----------|
| Ad blockers | Disguised endpoints (avoid /track, /pixel) + self-host option in v2 |
| CORS | Proper headers + validate request origin matches registered domain |
| Cookies blocked | Server-side session ID as fallback |
| Script caching | CDN cache 1 hour, versioned URL (?v=1.0.2) |

### Product Rules
| Question | Decision |
|----------|----------|
| What counts as "visitor" | Unique visitors/month (same hash = 1 count) |
| Cookie clearing | Accept reset (privacy-first, no fingerprinting) |
| Popup frequency | Customer chooses: once/session, once/day, once/week, once ever |
| Multiple popups | Priority queue (1-10), show highest priority only |

### Security
| Question | Decision |
|----------|----------|
| Domain verification | Server validates origin header against registered domains |
| XSS prevention | DOMPurify sanitization + React auto-escaping |
| Rate limiting | Upstash Redis: 100 req/sec per IP, 10K req/min per key |
| Script key theft | Domain binding (key only works on registered domains) |

### UX
| Question | Decision |
|----------|----------|
| Popup builder | Form-based (MVP), drag-drop in v2 |
| CSS conflicts | Shadow DOM isolation |
| Z-index | Maximum (2147483647) + append to body |
| Mobile popups | Bottom sheet default, customer can change |

### Business Model
| Question | Decision |
|----------|----------|
| Visitor limits | Soft warning at 80% → Hard stop at 120% |
| Overage charges | None - force upgrade instead |
| Annual discount | 17% (2 months free) |
| Refund policy | 7-day money-back guarantee |

---

## 12. WhatsApp Integration (MVP)

### Feature 1: Click-to-Chat (Free, No API)
```
User clicks button → Opens WhatsApp with pre-filled message
Link format: https://wa.me/919876543210?text=Hi%20I%20want%20to%20know%20more
```

### Feature 2: Number Collection (Lead Capture)
```
Popup collects WhatsApp number → Saves to database → Brand follows up manually
```

### NOT in MVP (v2)
- WhatsApp Business API (needs Meta approval, costs ₹0.50-2/msg)

---

## Next Steps After Plan Approval

1. Initialize Next.js project in `C:\Users\prabh\Desktop\priricing pop-up`
2. Set up database schema
3. Build the embeddable tracking script
4. Create dashboard UI
5. Implement Razorpay integration

---

## Verification Plan

After implementation:
1. **Script Test:** Embed on test site, verify visitor tracking
2. **Popup Test:** Create campaign, test triggers work
3. **Payment Test:** Complete Razorpay test transaction
4. **Cross-browser:** Test on Chrome, Firefox, Safari, Edge
5. **Mobile:** Test responsive popups on actual devices

---

## 13. First Step After Approval

### A. Create Project Structure
```
C:\Users\prabh\Desktop\priricing pop-up\
├── CLAUDE.md          # Full product context for Claude
├── DEVLOG.md          # Development progress log
├── FEATURES.md        # Feature specs & status
└── src/               # Code (created with Next.js init)
```

### B. CLAUDE.md (Product Context)
Contains:
- Product overview & positioning
- All technical decisions
- Database schema
- API endpoints reference
- Embed script documentation
- Pricing & business rules
- Competitor analysis summary

### C. DEVLOG.md (Development Log)
Updated after EVERY feature/session:
```markdown
# Development Log

## Session 1 - [Date]
### What We Did
- Initialized Next.js project
- Set up Prisma + Neon database
- Created auth system

### How We Did It
- Used `npx create-next-app@latest`
- Configured Prisma schema for users, websites, campaigns
- Integrated NextAuth with Google provider

### Current Status
- [x] Project setup
- [x] Database schema
- [ ] Tracking script (next)

### Files Changed
- package.json
- prisma/schema.prisma
- src/lib/auth.ts

### Next Session
- Build the embeddable tracking script
- Create /api/track endpoint
---
```

### D. FEATURES.md (Feature Tracker)
```markdown
# Features Status

## Core Features
| Feature | Status | Notes |
|---------|--------|-------|
| Visitor Tracking | 🔴 Not Started | Week 1 |
| UTM Attribution | 🔴 Not Started | Week 1 |
| Intent Scoring | 🔴 Not Started | Week 1 |
| Popup Builder | 🔴 Not Started | Week 2 |
| Dashboard UI | 🔴 Not Started | Week 2 |
| Razorpay | 🔴 Not Started | Week 3 |
| WhatsApp | 🔴 Not Started | Week 3 |

Legend: 🔴 Not Started | 🟡 In Progress | 🟢 Done
```

This way you always know:
- **What** was done
- **How** it was implemented
- **Where** we are in the roadmap
- **What's next**
