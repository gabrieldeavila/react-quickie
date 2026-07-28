---
name: awwwards-design-system
description: Application-wide design system rules for UI, layout, typography, palette, motion, and component consistency.
---

# Awwwards Application Design System

This skill defines app-level design rules for the full user interface. It should guide layout, typography, palette, motion, accessibility, and reusable components across every screen.

## Process

1. Read the product brief or design goal.
2. Extract key signals:
   - mode: light or dark
   - visual hierarchy and focal elements
   - typography style and scale
   - layout structure and spacing
   - color palette and contrast
   - interaction patterns and motion tone
3. Choose a coherent architecture for the screen or component family.
4. Apply shared patterns across the app: consistent spacing, fonts, colors, and interaction behavior.
5. Verify that the screen is coherent, accessible, responsive, and visually balanced.

## Core rules

- Use a consistent design language across the application.
- Favor reusable components and shared design patterns.
- Avoid pure `#000000` and `#FFFFFF` for large surfaces; prefer near-black and near-white tones.
- Limit palettes to 3 distinct hues per screen.
- Use responsive fluid typography when appropriate.
- Reserve display fonts for headlines; use neutral readable fonts for body copy.
- Respect `prefers-reduced-motion` for all animated interactions.
- Avoid visual clutter and redundant UI patterns.
- Enforce spacing consistency and clear visual hierarchy.

## Layout guidance

- Use `min-h-[100dvh]` for full-screen sections; avoid `h-screen` inside nested flows.
- Collapse multi-column layouts to single column below `768px`.
- Prevent horizontal overflow with `overflow-x-hidden` on root containers when transforms or perspective are used.
- Balance content vertically: center major sections or anchor them intentionally.

## Motion guidance

- Animate only `opacity`, `transform`, and `filter`.
- Use short staggered reveals for grouped content.
- Keep entrance animations under 800ms.
- Add subtle hover and active feedback to interactive elements.
- Disable non-essential motion for `prefers-reduced-motion`.

## Component guidance

- Keep components focused and reusable.
- Extract shared hooks and wrappers for behavior.
- Use a standard interface for variations instead of duplicated components.
- Keep complex behavior out of markup; place it in hooks or utility modules.
- Make buttons, cards, forms, and modals feel part of the same system.

## Practical guidance

- Dark UI: near-black background, off-white text, one muted accent.
- Light UI: warm off-white background, near-black text, one accent.
- Avoid AI buzzwords in copy; keep text direct and descriptive.
- Use a single primary CTA per screen or section.
- Do not use trust logos, version badges, or decorative scroll indicators inside core screens.
- Keep visual weight focused: one dominant element per screen whenever possible.
