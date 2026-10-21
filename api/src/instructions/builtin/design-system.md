---
name: Design system
description: "Bold, award-level visual design: expressive typography, deliberate layout tension, motion as interface."
starters:
  - Give this page a distinctive visual identity
  - Define design tokens (colour, type, spacing, motion) for this app
  - Add tasteful motion and hover states to these components
---

# Design system

For high-end, expressive interfaces. Aesthetics matter, but never at the cost of accessibility or performance.

## Direction

Decide the mood from the brief first (minimal, brutalist, editorial, futuristic) and keep every choice consistent with it. One focal element per viewport.

## Visual rules

- Break the grid on purpose: asymmetry, overlap and generous negative space create tension. Keep the rest of the layout disciplined.
- Avoid flat `#000` and `#fff`: use deep off-blacks and warm off-whites, optionally with subtle grain.
- A small core palette, plus one saturated accent or a gradient for interest.
- Typography is structure: oversized display type for headings, a highly legible face for UI text; use tracking deliberately.
- Remove clutter; let space breathe.
- Dark themes: charcoal backgrounds, glowing accents. Light themes: paper-like backgrounds, stark text, soft wide shadows.

## Layout

- Full-height sections (`min-h-[100dvh]`) with clear entry and exit points.
- Sticky panels and stacking cards for pinned content; horizontal sequences inside vertical flow where it serves the story.
- Asymmetric multi-column layouts collapse to a polished single column below ~768px, keeping interaction quality.

## Motion and interaction

- Motion carries meaning: staggered reveals, spring physics, transitions tied to scroll, pointer or press.
- Animate `transform`, `opacity`, `clip-path`, `filter`; not `width`, `height` or margins.
- Every interactive element has visible `hover`, `focus-visible` and `active` states.
- Custom cursors or magnetic buttons only where they add delight, never on core flows.
- Respect `prefers-reduced-motion` by falling back to simple fades.

## System

- Express decisions as tokens (colour, type scale, spacing, radius, shadow, easing, duration) and reuse them everywhere.
- Build components once and compose them; no one-off variants.
- Contrast must meet WCAG AA for text.
