---
name: Premium EdTech System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is engineered for a premium SaaS learning experience, prioritizing cognitive clarity and intellectual focus. Drawing inspiration from industry leaders like Linear and Stripe, the aesthetic is defined by high-end minimalism: expansive whitespace, precise mathematical alignments, and a sophisticated interplay of light and depth.

The brand personality is authoritative yet enabling. It avoids the "playful" tropes of traditional education platforms in favor of a professional toolset environment that respects the learner's time and ambition. The emotional response should be one of "effortless progress"—where the interface recedes to allow the educational content to lead.

## Colors

The palette is anchored by a deep Indigo primary, signaling stability and intelligence. We utilize a "Pure Light" approach where the background is primarily `#FFFFFF`, using subtle shifts to `#F8FAFC` for secondary containers to maintain a sense of airiness.

- **Primary (#4F46E5):** Used for primary actions, active states, and brand moments.
- **Success/Progress (#10B981):** A vibrant emerald reserved strictly for completion states, badges, and positive growth metrics.
- **Neutral:** A slate-based scale. We avoid pure blacks, opting for `#0F172A` for primary headings to maintain a softer, more "ink-like" premium feel.
- **Accents:** Subtle gradients are permitted only on primary buttons and progress indicators, moving from the primary hex to a slightly more vibrant shade (e.g., Indigo-600 to Indigo-500).

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic, Swiss-inspired functionalism. The type scale is optimized for high readability in dense learning environments.

Key typographic rules:
1. **Headings:** Use tighter letter-spacing (`-0.01em` to `-0.02em`) for larger sizes to maintain a "tight," premium look.
2. **Body:** Maintain a generous line-height (1.5x - 1.6x) to reduce eye strain during long reading sessions.
3. **Labels:** All-caps should be reserved for `label-sm` only, paired with increased letter spacing for categorization or overlines.

## Layout & Spacing

The layout follows a strict 12-column fluid grid for desktop and a single-column flow for mobile. We employ a "Variable Density" strategy: dashboards use tighter spacing (`sm` to `md`) for information density, while lesson pages use expansive spacing (`lg` to `xl`) to eliminate distractions.

- **Breakpoints:** Mobile (under 640px), Tablet (640px–1024px), Desktop (1024px+).
- **Max Width:** Content containers should max out at 1280px to prevent excessive line lengths in educational text.
- **Rhythm:** Every component must align to the 4px baseline grid.

## Elevation & Depth

Depth is used sparingly to define hierarchy. We avoid heavy shadows in favor of "Luminous Layers":

1. **Surface Level (0):** Pure white background.
2. **Subtle Depth (Level 1):** A 1px border of `Slate-200` with no shadow. Used for secondary cards and inactive states.
3. **Interactive Depth (Level 2):** A soft, multi-layered shadow (0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)). Used for primary hover states and cards.
4. **Overlay Depth (Level 3):** Reserved for modals and dropdowns. Features a high-blur, low-opacity shadow to simulate significant elevation.

We also utilize a subtle inner-glow (1px white top border) on primary buttons to create a "tactile plastic" high-end feel.

## Shapes

The design system uses a "Sophisticated Rounded" language. Standard components like inputs and small buttons use a 0.5rem (8px) radius. Larger structural elements like course cards and containers utilize the `rounded-xl` (1.5rem / 24px) setting to create a modern, approachable container style that feels "friendly-premium."

Consistency is key: if an outer container is `rounded-xl`, internal elements should scale down proportionally (e.g., `rounded-lg`) to maintain visual harmony.

## Components

### Buttons
- **Primary:** Indigo background, white text, subtle linear gradient (top to bottom), and a 1px inner border for depth.
- **Secondary:** Ghost style with a Slate-200 border. Transitions to a light Indigo-50 background on hover.

### Cards
- **Course Cards:** Use `rounded-xl`. Include a subtle Slate-200 border. On hover, the border color shifts to Primary Indigo and the shadow increases to Level 2.

### Inputs
- **Fields:** High-contrast text on a white background with a Slate-200 border. On focus, use a 2px Indigo ring with a light indigo outer glow.

### Progress Indicators
- **Bars:** Use a height of 8px with fully rounded caps. The track is Slate-100; the fill is the Success Emerald.

### Chips/Badges
- Small, uppercase `label-sm` text. Use low-saturation background tints (e.g., Emerald-50 background with Emerald-700 text) for a refined, professional look.

### Navigation
- A top-anchored, frosted glass (backdrop-blur) navigation bar with a subtle bottom border. Use `Slate-500` for inactive links and `Indigo-600` with a 2px bottom "pill" indicator for active states.