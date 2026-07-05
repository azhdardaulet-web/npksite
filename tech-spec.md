# Tech Spec — Народная Партия Казахстана

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0 | UI framework |
| react-dom | ^19.0 | DOM renderer |
| react-router-dom | ^7.0 | Multi-page routing |
| three | ^0.172 | WebGL map hero (MeshLine border drawing) |
| three.meshline | ^1.4 | MeshLineGeometry & MeshLineMaterial for border lines |
| gsap | ^3.12 | Animation engine, ScrollTrigger, timeline sequences |
| @gsap/react | ^2.1 | useGSAP hook for React lifecycle-safe GSAP |
| lucide-react | ^0.460 | Stroke-only icons (scale, banknote, shield, users, building, user-plus, heart, eye, home, newspaper, search, play, chevron-down, x, arrow-right, phone, map-pin, message-circle, send, download) |
| tailwindcss | ^4.0 | Utility CSS |
| @tailwindcss/vite | ^4.0 | Tailwind Vite integration |
| typescript | ^5.7 | Type safety |
| @types/react | ^19.0 | React types |
| @types/react-dom | ^19.0 | ReactDOM types |
| @types/three | ^0.172 | Three.js types |
| vite | ^6.0 | Build tool |
| @vitejs/plugin-react | ^4.0 | React Vite plugin |

No shadcn/ui — the design is fully custom dark theme with bespoke components. No animation libraries beyond GSAP (no Framer Motion, no Lenis — GSAP covers all needs).

---

## Component Inventory

### Layout (shared across all pages)

| Component | Source | Notes |
|-----------|--------|-------|
| DesktopHeader | Custom | Sticky 64px, frosted glass, KAZ/RUS toggle, nav links, CTA button |
| MobileBottomNav | Custom | 56px frosted glass bottom bar, 5 icons with raised center CTA |
| Footer | Custom | 4-column layout + bottom bar |
| PageLayout | Custom | Wraps all pages — renders DesktopHeader + MobileBottomNav + Footer + children |

### Sections (homepage only, used once each)

| Section | Notes |
|---------|-------|
| HeroSection | Full-viewport. Contains Three.js map canvas + Canvas2D glow bg + countdown + CTAs |
| TrustCountersSection | 4 stat counters, IntersectionObserver-triggered count-up |
| CandidatesSection | Filter bar + candidate card grid. Client-side filtering by region tag |
| ProgramSection | 3+2 grid of program direction blocks |
| ReceptionSection | 60/40 split: form panel + WhatsApp/counter/testimonials |
| MediaSection | Deep Black bg, 3-column: YouTube embed, news cards, social stats |
| JoinSection | Background image overlay, 3 join role cards |
| BranchMapSection | Interactive SVG map of Kazakhstan + region list + popup card |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| CandidateCard | Custom | CandidatesSection |
| ProgramBlock | Custom | ProgramSection |
| NewsCard | Custom | MediaSection, inner News page |
| JoinRoleCard | Custom | JoinSection |
| RegionBadge | Custom | CandidatesSection (filter), BranchMapSection (region list) |
| CountUp | Custom | TrustCountersSection, ReceptionSection (resolved counter) |
| CountdownTimer | Custom | HeroSection |
| PrimaryButton | Custom | Throughout (red pill CTA) |
| OutlinedButton | Custom | Throughout (white outlined) |
| DarkActionButton | Custom | Cards (Поддержать, Подробнее) |
| AnnouncementBanner | Custom | HeroSection (top red bar) |
| WhatsAppBlock | Custom | ReceptionSection |
| SectionHeader | Custom | Multiple sections (heading with inline weight contrast) |
| ScrollReveal | Custom | Wrapper component — IntersectionObserver + GSAP entrance |

### Hooks

| Hook | Purpose |
|------|---------|
| useScrollReveal | Registers GSAP ScrollTrigger for entrance animations on a ref |
| useCountUp | Animates a number from 0 to target over duration with easing |
| useCountdown | Returns days/hours/minutes/seconds to a target date, updates every second |
| useMobileDetect | Returns boolean — viewport width < 768px |
| useLanguage | Context hook for KAZ/RUS language state |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Procedural border line drawing (MeshLine) | three + three.meshline | Custom LineGroup and MeshLine classes. MeshLineMaterial with dashArray=2, dashOffset animated from 0 to -1 in draw() each frame. 3 LineGroup instances (central/left/right border regions). click-to-draw via Raycaster on hidden PlaneGeometry. | **High** 🔒 |
| Glowing background (Canvas2D) | Native Canvas2D API | Custom Orb class with radial gradients, drifting positions, life cycle (0→1). 6 max orbs, motion-trail via rgba fill. Grid lines at 0.015 opacity. Mouse attraction on last orb. Own animation loop separate from Three.js. | **High** 🔒 |
| Hero text entrance | GSAP | Timeline: staggered fadeIn + translateY(30→0) for slogan → subtitle → timer blocks → CTAs → scroll indicator. Delays 0.12s between elements. 0.7s duration, ease-out. Starts 0.3s after page load. | Low |
| Scroll-triggered section entrances | GSAP + ScrollTrigger | useScrollReveal hook wraps each section. IntersectionObserver at threshold 0.15. Elements translateY(24→0) + opacity(0→1), 0.5s, cubic-bezier(0.25,1,0.5,1). | Low |
| Staggered card entrances | GSAP + ScrollTrigger | Same as above but with stagger: 0.08s between sibling cards/blocks. | Low |
| Count-up counters | Custom hook (useCountUp) | requestAnimationFrame with cubic-bezier(0.25,1,0.5,1) easing. Triggered by IntersectionObserver. Duration 1.5s. Stagger 0.15s between counters. | Low |
| Countdown timer | Custom hook (useCountdown) | setInterval 1s. Seconds digit opacity transition 0→1 (0.15s). Colon blink: opacity 1→0.3, 0.5s cycle via CSS animation. | Low |
| Map region hover/fill | CSS transitions | SVG path fill and stroke transitions, 0.2s ease. No JS animation needed. | Low |
| Card hover lift | CSS transitions | transform translateY(-4px), border-color change. 0.2s ease. | Low |
| Button hover scale | CSS transitions | Primary: scale(1.02). Outlined: border-color brightens. 0.2s ease. | Low |
| Mobile CTA pulse | GSAP | scale(1→1.04→1) yoyo repeat, starts after 30s inactivity (setTimeout). | Low |
| Reception split entrance | GSAP + ScrollTrigger | Left panel translateX(-30→0), right panel translateX(30→0), both fade in. Right column items stagger 0.1s. | Low |
| Media section column entrance | GSAP + ScrollTrigger | 3 columns stagger 0.15s, translateY(30→0) + fade in. | Low |
| Arrow link animation | CSS | translateX(0→4px) on hover, 0.2s ease. | Low |
| Nav underline hover | CSS | pseudo-element width 0→100%, 0.2s ease. | Low |

---

## State & Logic Plan

### Three.js ↔ React Bridge (HeroSection)

The Three.js scene and Canvas2D are **not React-managed**. They run in their own imperative animation loops via refs. The HeroSection component:

1. Creates a container div ref.
2. On mount (useEffect), initializes the Canvas2D glowing background first (z-index 0), then the Three.js scene (z-index 1).
3. Both renderers append their canvas elements to the container.
4. Both run independent `requestAnimationFrame` loops.
5. On unmount, disposes both renderers, geometries, materials, and cancels animation frames.
6. Resize handler updates both canvases.

The Three.js scene setup (camera, renderer, LineGroup classes, MeshLine classes) lives in a standalone module `hero-map.ts`, exported as a single `initHeroMap(container: HTMLElement, onComplete?: () => void)` function. The Canvas2D background similarly lives in `hero-glow.ts` as `initGlowBackground(container: HTMLElement)`.

### Language Switching

React Context (`LanguageContext`) provides current language ('ru' | 'kz') and a toggle function. All text content is stored in a flat translation object. The `useLanguage` hook returns the current language and a `t(key)` function. `lang` attribute on `<html>` updates reactively.

### Candidate Region Filtering

Client-side only. `activeRegion` state (string, default 'Все'). Filter tags toggle this state. Candidate data array is filtered before rendering. No URL params — simple React state.

### SVG Map Interaction

The Kazakhstan SVG is an inline `<svg>` with 20 `<path>` elements (one per region). Each path has `data-region` attribute. Hover uses CSS `:hover`. Click sets `selectedRegion` state, which triggers the popup card below. The region list below uses the same `selectedRegion` state, bidirectionally linked.

### Mobile/Desktop Layout Switch

`useMobileDetect` hook checks `window.innerWidth < 768`. Used to:
- Render MobileBottomNav vs DesktopHeader
- Adjust grid columns (CSS handles most, but some conditional rendering needed)
- Full-width stacked CTAs on mobile

---

## Other Key Decisions

**No shadcn/ui** — every component has bespoke styling (custom colors, custom radii, dark-only theme). Using shadcn would require overriding every default, adding complexity with no benefit.

**No Lenis/Framer Motion** — GSAP ScrollTrigger handles all scroll-triggered and entrance animations. Adding another animation library would be redundant.

**No SSR** — Client-side rendered SPA with React Router. Political campaign site doesn't need SEO optimization. All pages load the same JS bundle; React Router handles client-side navigation.

**Video embed** — Section 6 YouTube uses a static thumbnail with play button overlay that opens the video in a new tab or lightbox. No iframe auto-load to avoid performance impact. The `hero-video-loop` asset is **not used** — the hero is the WebGL map + Canvas2D glow, not a video.

**Form submissions** — All forms (reception, join) are client-side only with simulated success states. No backend integration.
