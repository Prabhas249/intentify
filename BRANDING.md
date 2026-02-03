# Intentify - Brand Guidelines

> Brand identity and design system for Intentify - Smart Popups for Indian D2C Brands

---

## Brand Identity

### Name
**Intentify** (stylized as `Intentify` or `Popup Go`)

### Tagline Options
- "Smart Popups. Real Conversions."
- "Know Your Visitors. Convert Them Better."
- "Popups That Remember"

### Brand Positioning
India's first smart popup tool with visitor memory - affordable, lightweight, WhatsApp-native.

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Orange 500** | `#F97316` | Primary brand color, CTAs, accents |
| **Orange 600** | `#EA580C` | Hover states, borders |
| **Orange 400** | `#FB923C` | Gradients, highlights |

### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Gray 900** | `#0F172A` | Headings, primary text |
| **Gray 700** | `#374151` | Body text |
| **Gray 500** | `#6B7280` | Secondary text |
| **Gray 200** | `#E5E7EB` | Borders, dividers |
| **Gray 50** | `#F9FAFB` | Backgrounds |
| **White** | `#FFFFFF` | Cards, surfaces |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Green 500** | `#22C55E` | Success, high intent |
| **Yellow 500** | `#EAB308` | Warning, medium intent |
| **Red 500** | `#EF4444` | Error, low intent |
| **Blue 500** | `#3B82F6` | Info, links |

---

## Typography

### Font Stack
```css
--font-heading: 'Geist', system-ui, sans-serif;
--font-body: 'Geist', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;
```

### Type Scale
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| H1 (Hero) | 5rem / 8rem (sm) | 600 | -0.025em |
| H2 (Section) | 2.25rem / 3rem | 600 | -0.025em |
| H3 (Card) | 1.25rem | 600 | -0.015em |
| Body | 1rem / 1.25rem | 400 | normal |
| Small | 0.875rem | 400 | normal |
| Caption | 0.75rem | 500 | 0.025em |

---

## Logo

### Primary Logo
Text-based logo: **Intentify** with stylized "Go" in orange

### Logo Mark
Stylized popup window icon with arrow/cursor

### Logo Sizes
- Navbar: 120px width
- Footer: 100px width
- Favicon: 32x32px
- OG Image: Include full logo

### Logo Clearspace
Minimum padding = height of the "P" character

---

## Voice & Tone

### Brand Voice
- **Direct** - No fluff, clear value props
- **Confident** - We know Indian D2C
- **Friendly** - Approachable, not corporate
- **Technical but accessible** - Smart without being intimidating

### Writing Guidelines
- Use "you/your" not "users/customers"
- Lead with benefits, not features
- INR pricing always (₹ symbol)
- Avoid jargon unless necessary
- Short sentences, active voice

### Example Copy
```
❌ "Our sophisticated visitor identification system leverages..."
✅ "Know exactly who's visiting. Show them what converts."

❌ "Utilize our platform to maximize conversion rates"
✅ "Turn visitors into buyers with smart popups"
```

---

## UI Components

### Buttons
```
Primary: bg-orange-500 text-white hover:bg-orange-600
Secondary: bg-white text-gray-900 border border-gray-200 hover:bg-gray-50
Ghost: text-gray-700 hover:text-gray-900 hover:bg-gray-100
```

### Cards
```
Background: white
Border: 1px solid gray-200
Shadow: shadow-sm or shadow-lg for emphasis
Border Radius: 8px (rounded-lg)
```

### Badges/Pills
```
Intent High: bg-green-100 text-green-700
Intent Medium: bg-yellow-100 text-yellow-700
Intent Low: bg-red-100 text-red-700
Neutral: bg-gray-100 text-gray-700
```

---

## Imagery

### Style
- Clean, minimal illustrations
- Abstract geometric patterns
- Data visualization aesthetics
- No stock photos of people

### Icons
- Remix Icon (primary)
- Lucide React (secondary)
- Consistent 20-24px size
- 1.5px stroke weight

### Illustrations
- Flat design with subtle gradients
- Orange accent color
- Gray/neutral base colors
- Tech/SaaS aesthetic

---

## Landing Page Sections

### 1. Hero
- Headline: "Smart Popups for Every Indian Brand"
- Subheadline: Value prop about visitor memory + conversions
- CTA: "Start Free" (primary) + "See Demo" (secondary)
- Visual: Abstract popup/analytics illustration

### 2. Stats Bar
- 500+ Brands
- 2.4M+ Visitors Tracked
- 147% Avg Conversion Lift
- ₹12Cr+ Revenue Generated

### 3. Features Grid
1. **Visitor Memory** - Remember returning visitors
2. **Intent Scoring** - Know who's ready to buy
3. **UTM Tracking** - Full source attribution
4. **Smart Triggers** - Right popup, right time
5. **WhatsApp Popups** - Click-to-chat + collection
6. **Lightweight Script** - 5KB, loads in <50ms
7. **Mobile-First** - Bottom sheets, responsive
8. **INR Pricing** - Affordable for Indian brands
9. **Easy Setup** - One script, 2 minute install

### 4. How It Works
1. Add one script to your website
2. We track & score every visitor
3. Show personalized popups that convert

### 5. Pricing
| Plan | Price | Visitors | Popups |
|------|-------|----------|--------|
| Free | ₹0 | 1,000 | 1 |
| Starter | ₹999/mo | 10,000 | 3 |
| Growth | ₹2,499/mo | 50,000 | 10 |
| Pro | ₹4,999/mo | 200,000 | Unlimited |

### 6. Testimonials
- D2C brand founders
- Course creators
- E-commerce store owners
- Focus on Indian businesses

### 7. FAQ
- How does visitor tracking work?
- Is it GDPR/privacy compliant?
- How lightweight is the script?
- Can I use WhatsApp popups?
- What payment methods do you accept?
- How do I install the script?

### 8. CTA Section
- "Ready to convert more visitors?"
- Start Free button
- No credit card required messaging

---

## Navigation

### Navbar Links
- Features (#features)
- Pricing (#pricing)
- Analytics (#analytics)
- Login (/login)
- **Get Started** (CTA button)

### Footer Sections
**Product**
- Features
- Pricing
- Analytics
- Integrations

**Resources**
- Documentation
- Blog
- Help Center
- API Reference

**Company**
- About
- Contact
- Privacy Policy
- Terms of Service

**Connect**
- Twitter/X
- LinkedIn
- Email

---

## Animations

### Micro-interactions
- Button hover: scale(1.02) + shadow
- Card hover: translateY(-2px) + shadow-lg
- Link hover: color transition 200ms

### Page Transitions
- Fade in on scroll (Framer Motion)
- Stagger children 50ms delay
- Duration: 400-600ms
- Easing: ease-out

### Loading States
- Skeleton loaders for data
- Spinner for actions
- Progress bar for multi-step

---

## Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Approach
- Stack layouts on mobile
- Bottom sheet popups
- Touch-friendly tap targets (44px min)
- Hamburger menu for nav

---

## File Naming

### Components
```
popup-preview.tsx       (kebab-case)
PopupPreview            (PascalCase export)
```

### Assets
```
logo-dark.svg
logo-light.svg
icon-visitor.svg
illustration-hero.svg
```

### CSS Variables
```
--color-primary
--color-text
--radius-lg
--shadow-card
```
