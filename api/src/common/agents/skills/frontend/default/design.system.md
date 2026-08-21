---
name: awwwards-level-design-system
description: Application-wide design system rules for immersive, award-winning web experiences, focusing on experimental UI, brutalist/minimalist aesthetics, kinetic typography, and advanced motion.
---

# Awwwards Experience Design System

This skill defines app-level design rules for high-end, award-winning user interfaces. It guides developers to build experimental, highly interactive, and visually striking layouts that prioritize aesthetics, fluid motion, and technical excellence without sacrificing accessibility.

## Process

1. Read the product brief and determine the core "vibe" (e.g., hyper-minimalist, brutalist, futuristic, editorial).
2. Extract key signals:
   - Mode: High-contrast light or dark themes.
   - Focal elements: Relentless prioritization of a single hero element per viewport.
   - Typography: Oversized, expressive display fonts mixed with hyper-legible utility fonts.
   - Interaction: Cursor-driven effects, magnetic elements, and scroll-bound animations.
3. Choose an unconventional but highly deliberate architecture (e.g., asymmetrical grids, horizontal scrolling sections, sticky overlapping panels).
4. Build using modular, reusable components optimized for performance in modern frameworks (React/Next.js), ensuring state-driven animations remain fluid.
5. Verify the experience: Is the scroll smooth? Are the transitions seamless? Is the visual weight dramatic but balanced?

## Core rules

- Break the grid intentionally: use asymmetrical layouts, overlapping elements, and extreme negative space to create tension.
- Avoid flat `#000000` and `#FFFFFF`. Use noisy textures, grain overlays, or deep chromatic off-blacks/off-whites.
- Limit the core palette but use high-saturation accents or fluid gradients (e.g., mesh gradients, WebGL shaders) for visual interest.
- Typography is UI: Use massive, fluid typography as the primary structural element. Mix extreme tracking (tight/loose) purposefully.
- Implement custom cursors or cursor-tracking hover states (e.g., masks revealing content, magnetic buttons).
- Ruthlessly eliminate visual clutter. Let negative space breathe.

## Layout guidance

- Embrace `min-h-[100dvh]` sections with distinct entry/exit transition points.
- Use smooth scrolling (e.g., Lenis, Locomotive Scroll) principles: design for continuous flow rather than static pages.
- Integrate horizontal scroll within vertical flow (`overflow-x-hidden` on root, mapped horizontal translations).
- Use sticky positioning (`sticky top-0`) to create stacking card effects or pinned content while secondary elements scroll past.
- Collapse multi-column asymmetrical layouts to deliberate, highly polished single columns on mobile (below `768px`), maintaining the interaction quality.

## Motion & Interaction guidance

- Motion is not an afterthought; it is the interface. Use staggered reveals, spring physics, and kinematic animations.
- Animate `transform`, `opacity`, `clip-path`, and `filter`. Avoid animating layout properties (`width`, `height`, `margin`).
- Tie animations to user intent: scroll progress, mouse movement, and click-and-hold states.
- Transition between pages/states seamlessly (no harsh reloads).
- Add magnetic physics to primary CTAs and critical links.
- Respect `prefers-reduced-motion` by gracefully degrading complex animations to simple fades.

## Practical guidance

- Dark UI: Deep charcoal/obsidian backgrounds, subtle noise overlay, glowing or vibrant neon accents.
- Light UI: Plaster/warm paper backgrounds, stark black typography, subtle drop shadows with large spread and low opacity.
- Treat every component as an interactive object. Provide visual feedback for `hover`, `focus`, and `active` states immediately.
- Strip away generic UI patterns (standard cards, basic navbars). Replace them with fullscreen menus, floating action islands, or hidden-until-hover navigations.