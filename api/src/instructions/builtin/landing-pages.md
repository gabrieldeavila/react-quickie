---
name: Landing pages
description: "Landing pages built as a narrative: section pacing, one design system, scroll motion and performance."
starters:
  - Build a landing page for a SaaS product with pricing and FAQ
  - Turn this hero section into a full landing page
  - Review the pacing and consistency of our landing page
---

# Landing pages

A landing page is a sequential argument: hero → problem → solution → proof → offer → call to action. Decide the story before the layout.

## Read the brief

- **Pacing**: fast and dense (SaaS, developer tools) or slow and atmospheric (luxury, editorial, portfolio)?
- **Trust assets**: logos, metrics, testimonials. Put them where a doubt would arise.
- **Feature depth**: a bento grid, a sticky deep-dive, or an interactive demo?
- **Footer**: a mega-footer with a site map, or a minimal brand sign-off?

## Pick one page shape

- **Conversion (SaaS)**: hero → logo marquee → bento grid of 3–5 features → sticky deep-dive (text left, product UI scrolling right) → metrics or testimonials → high-contrast pre-footer CTA.
- **Editorial (brand, agency)**: full-bleed or typographic hero → manifesto paragraph → pinned horizontal gallery → offset image/text showcases → minimal footer.
- **Product showcase (hardware, single feature)**: cinematic hero → scroll-scrubbed video or 3D → pinned product with callouts → dense spec table → floating buy bar.

## Rhythm

- No two consecutive sections share the same layout; break repetition with full-bleed media, a typographic intermission or a horizontal section.
- Alternate density and breathing room; give the reader at least one whitespace-only pause.
- Use contrast thresholds (dark → light) to mark chapters. Design the transitions between sections (overlap, wipe, typographic bridge) instead of stacking boxes.
- Keep a 12-column grid for most of the page and break it on purpose where impact matters.

## One system

- Buttons, tags, cards and inputs share the same tokens: radius, stroke, hover behaviour. Never invent a new button style halfway down the page.
- Build reusable section modules (`<FeatureCard />`, `<Testimonial />`) that take props; the page only composes them.
- Type scale with `clamp()`: section titles around `clamp(2rem, 5vw, 4.5rem)`, body `clamp(1rem, 1vw, 1.125rem)` with line-height 1.6 and `max-width: 60–65ch`.
- Colours come from one palette (primary, surface, background, accent).

## Motion and performance

- Drive scroll effects with the animation library's scroll hooks (e.g. Framer Motion `useScroll` + `useTransform`) and `position: sticky`; never store scroll position in React state.
- Animate `transform` and `opacity`; respect `prefers-reduced-motion`.
- Horizontal sections use sticky + transforms, not scroll-jacking.
- Lazy-load images below the fold; size media explicitly to avoid layout shift.
- Grids collapse to a single deliberate column on mobile.

## Before you finish

Check: no repeated consecutive layouts, consistent buttons and card hovers, paragraph width ≤ 65 characters, an obvious primary CTA, and the page works on a phone.
