# Features Status

> Track progress of all features. Update status as work progresses.

**Legend:**
- Not Started
- In Progress
- Done
- Blocked

---

## Week 1: Core Engine & Tracking

### Days 1-2: Project Setup
| Task | Status | Notes |
|------|--------|-------|
| Initialize Next.js 14 + TypeScript | Done | Next.js 16.1.5 |
| Set up Tailwind CSS | Done | v4 |
| Install shadcn/ui components | Done | 20+ components |
| Configure Prisma ORM | Done | v5.22.0 |
| Set up Neon PostgreSQL | Not Started | Need to create account |
| Set up NextAuth (Google + Email) | Done | v5 beta |
| Create dashboard shell layout | Done | Sidebar + pages |

### Days 3-4: Tracking Script (Feature 1 & 2)
| Task | Status | Notes |
|------|--------|-------|
| Build embed script (~5KB) | Done | 21KB unminified, will minify |
| Visitor identification (cookies) | Done | Cookie + localStorage |
| Behavior tracking (visit_count, pages, time, scroll) | Done | All tracked |
| UTM parameter parsing | Done | source, medium, campaign |
| Referrer detection | Done | Google, Instagram, etc. |
| Server-side session fallback | In Progress | Basic session support |
| API endpoint: POST /api/v1/events | Done | Full event tracking |

### Days 5-7: Intent Scoring (Feature 3)
| Task | Status | Notes |
|------|--------|-------|
| Scoring algorithm | Done | Visit + page + time + scroll |
| Score calculation per page view | Done | Client-side calculation |
| Intent level assignment (Low/Med/High) | Done | 0-30/31-60/61+ |
| Store scores in database | Done | Via events API |
| API to fetch intent for popup decisions | Done | GET /api/v1/campaigns |

---

## Week 2: Popup System & Dashboard

### Days 8-10: Popup Engine (Feature 4)
| Task | Status | Notes |
|------|--------|-------|
| Popup rendering engine | Done | Shadow DOM isolation |
| Popup types: Modal, Slide-in, Banner, Float | In Progress | Modal + bottom sheet done |
| Rules engine (combine triggers) | Done | AND/OR conditions |
| Trigger conditions implementation | Done | 12+ operators |
| Frequency capping logic | Done | session/day/week/ever |
| Mobile bottom sheet | Done | Responsive design |

### Days 11-13: Dashboard UI
| Task | Status | Notes |
|------|--------|-------|
| Campaign creation wizard | Done | Full form-based builder |
| Visual rules builder | Done | AND/OR conditions, 7 fields |
| Popup customization panel | Done | Content, style, CTA |
| Live preview (desktop + mobile) | Done | All popup types |
| Campaign list with toggle | Done | Status toggle, stats |
| Priority setting (1-10) | Done | Configurable |

### Day 14: Analytics & Visitors
| Task | Status | Notes |
|------|--------|-------|
| Visitors list with scores | Done | Full table with filters |
| Source attribution chart | Done | Table-based breakdown |
| Popup performance metrics | Done | Per-campaign stats |
| Basic conversion funnel | Done | Impressions→Clicks→Conversions |
| Scroll depth tracking + display | Done | Persisted on visitor, shown in dashboard |
| Country/City detection | Done | Via Vercel geo headers (free) |
| OS detection | Done | iOS, macOS, Windows, Android, Linux, ChromeOS |
| Bounce rate | Done | Calculated from existing data |
| New vs Returning chart | Done | Recharts donut chart |
| Conversion path visualization | Done | Flow diagrams + journey timelines |

---

## Week 3: Integrations & Launch

### Days 15-16: Integrations
| Task | Status | Notes |
|------|--------|-------|
| Razorpay subscription setup | Not Started | |
| Plan enforcement logic | Not Started | 80% warn, 120% stop |
| WhatsApp click-to-chat popup | Not Started | |
| WhatsApp number collection | Not Started | |
| Email collection + CSV export | Not Started | |
| Webhook for lead notifications | Not Started | |

### Days 17-18: Landing Page & Onboarding
| Task | Status | Notes |
|------|--------|-------|
| Marketing landing page | Done | Full page with 10 sections |
| User onboarding flow | Not Started | |
| Script installation guide | Done | In website detail page |
| Settings page | Not Started | |
| Billing page | Not Started | |

### Days 19-20: Testing & Polish
| Task | Status | Notes |
|------|--------|-------|
| Script performance (<5KB, <50ms) | Not Started | |
| Cross-browser testing | Not Started | |
| Mobile popup testing | Not Started | |
| Security review (XSS, CSRF) | Not Started | |
| Rate limiting setup | Not Started | Upstash Redis |

### Day 21: Launch Prep
| Task | Status | Notes |
|------|--------|-------|
| Beta user invites (5-10) | Not Started | |
| Feedback collection | Not Started | |
| Bug fixes | Not Started | |
| Launch prep (PH, Twitter) | Not Started | |

---

## Summary

| Week | Focus | Status |
|------|-------|--------|
| Week 1 | Core Engine & Tracking | Done (Days 1-7 complete) |
| Week 2 | Popup System & Dashboard | Done (Campaign UI + Analytics complete) |
| Week 3 | Integrations & Launch | In Progress (Landing page done) |

**Overall Progress:** ~88% complete (Core tracking + popup engine + dashboard UI + analytics + landing page + advanced analytics done)

---

## Completed Items
- [x] Next.js 16.1.5 + TypeScript project
- [x] Tailwind CSS v4 configured
- [x] 20+ shadcn/ui components installed
- [x] Prisma schema with all models
- [x] NextAuth v5 configured (Google)
- [x] Dashboard layout with sidebar
- [x] Websites list page
- [x] Add website page
- [x] Website detail page with script installation
- [x] **Tracking script (tracker.js)**
- [x] **Visitor identification**
- [x] **UTM & referrer tracking**
- [x] **Intent scoring algorithm**
- [x] **Popup rendering (Shadow DOM)**
- [x] **Events API endpoint**
- [x] **Campaigns API endpoint**
- [x] **Rules engine (AND/OR conditions)**
- [x] **Frequency capping**
- [x] **Campaign creation wizard**
- [x] **Campaign list page with stats**
- [x] **Campaign edit page**
- [x] **Visual rules builder (7 fields)**
- [x] **Popup customization (content, style, CTA)**
- [x] **Live preview (desktop + mobile)**
- [x] **6 popup types preview**
- [x] **Campaign status toggle**
- [x] **Campaign delete with confirmation**
- [x] **Quick theme presets**
- [x] **WhatsApp CTA integration**

- [x] **Analytics dashboard**
- [x] **Visitors list page**
- [x] **Campaign stats (impressions, clicks, conversions)**
- [x] **Intent breakdown chart**
- [x] **Device breakdown**
- [x] **Traffic sources table**
- [x] **Top pages table**
- [x] **Visitor detail sheet**
- [x] **Website selector for analytics**
- [x] **Pagination for visitors**

- [x] **Scroll depth persistence + display**
- [x] **Country/City detection (Vercel geo headers)**
- [x] **OS detection (tracker.js)**
- [x] **Bounce rate calculation**
- [x] **New vs Returning donut chart**
- [x] **Conversion path visualization**
- [x] **Geography tab (countries + cities)**
- [x] **OS breakdown card**
- [x] **8 stat cards (2 rows)**

- [x] **Marketing landing page**
- [x] **Animated globe component**
- [x] **Framer-motion animations**
- [x] **Hero section with floating stats**
- [x] **Features grid (9 features)**
- [x] **Pricing section (4 tiers)**
- [x] **Testimonials section**
- [x] **FAQ with shadcn Accordion**
- [x] **Mobile responsive navbar**

## Next Priority
1. Set up Supabase database (see TODO.md)
2. Set up Google OAuth
3. Run `npx prisma db push`
4. Razorpay billing integration
5. WhatsApp popup types
6. User onboarding flow

---

## v2 Features (Post-MVP)
| Feature | Priority | Notes |
|---------|----------|-------|
| Drag-drop popup builder | High | |
| A/B testing | High | |
| WhatsApp Business API | Medium | Needs Meta approval |
| Self-hosted script option | Medium | For ad blocker bypass |
| Team collaboration | Low | |
| API access | Low | Pro plan |
