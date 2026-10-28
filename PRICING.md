# Intentify — Pricing (Single Source of Truth)

> ⚠️ This file is the **canonical** pricing. If any other doc (CLAUDE.md, landing page, code) disagrees, **this wins.** Update here first, then propagate.
> Locked: 2026-06-05

---

## Principle

We price on **value, not cheapness.** For a D2C store with a ₹8,000–₹25,000 AOV, **one extra sale pays back the whole subscription** — even Pro. So we are *not* the cheap analytics tool. We charge like a tool that makes you money.

- Billing metric: **Tracked Visitors / month** (always use this exact phrase — not "visitors", not "events").
- Marketers think in **Campaigns**, not "popups". Use "Campaigns" in UI and pricing.
- People buy **outcomes and identity**, not limits → every tier has a "For…" tagline.
- India is geo-priced (INR, lightly localized); rest of world pays USD.

---

## The plans

### Free — ₹0 / $0
*For new stores testing visitor intent*
- 3,000 tracked visitors/month
- 3 active campaigns
- 1 website
- Intent scoring
- Source / UTM tracking
- Visitor journey tracking
- All campaign (popup) formats
- 90-day data retention
- Intentify branding
- Community support

### Starter — ₹1,999 / $24 per month
*For stores getting their first conversions*
- 20,000 tracked visitors/month
- 10 active campaigns
- 2 websites
- **Remove Intentify branding**
- Revenue attribution
- Conversion tracking
- Coupon tracking
- 180-day data retention
- Email support

### Growth — ₹3,999 / $49 per month ⭐ Most Popular
*For brands optimizing revenue*
- 75,000 tracked visitors/month
- Unlimited campaigns
- 5 websites
- AI intent insights *(roadmap)*
- Advanced segmentation *(roadmap)*
- Team access — 5 members *(roadmap)*
- Revenue dashboard
- Visitor source intelligence
- 1-year data retention
- Priority support

### Pro — ₹7,999 / $99 per month
*For teams managing multiple stores*
- 250,000 tracked visitors/month
- Unlimited campaigns
- 10 websites
- API access *(roadmap)*
- Webhooks *(roadmap)*
- Team access — 15 members *(roadmap)*
- Multi-site reporting *(roadmap)*
- Advanced attribution
- Slack support
- 2-year data retention

### Enterprise — Custom
*Built for large brands*
- 250k+ tracked visitors/month
- Unlimited websites
- Dedicated infrastructure, SSO, custom integrations
- Dedicated success manager, priority SLA, custom retention

**Annual billing:** 2 months free (~17% off) on all paid tiers.

---

## Dashboard hero metrics (tie every screen to money)

Surface these at the top of the dashboard — they're what a founder brags about internally:
- **Revenue Influenced** — ₹ this month
- **High-Intent Visitors** — count
- **Conversion Lift** — % (honest version; true lift needs a holdout group — that's v2)

---

## ⚠️ Honesty ledger — what's REAL on day 1 vs roadmap

Do **not** advertise features we can't deliver. Status as of 2026-06-05:

| Feature | Status |
|---|---|
| Intent scoring | ✅ Built |
| Source / UTM tracking | ✅ Built |
| Visitor journey tracking | ✅ Built |
| Campaign formats (popups) | ✅ Built (some types still in progress) |
| Revenue / conversion / coupon attribution | ✅ Built |
| Revenue dashboard | ✅ Built |
| Remove branding | 🟡 Needs plan-enforcement logic |
| Tiered data retention (90/180/365/730d) | 🔴 Needs retention job |
| Plan limits / visitor caps | 🔴 Not built (Task #4) |
| Billing (Dodo) | 🔴 Not built (Task #4) |
| AI intent insights / recommendations | 🔴 Roadmap (v2 — do NOT lead with this) |
| Advanced segmentation / custom audiences | 🔴 Roadmap |
| Team access (multi-user) | 🔴 Not built |
| API access / webhooks | 🔴 Not built |
| Multi-site reporting | 🟡 Partial |
| SSO / Enterprise | 🔴 Roadmap |

**Rule:** before a feature appears on the public pricing page, it must be ✅ or removed from that tier's bullet list. Roadmap items can be shown as "Coming soon" at most.
