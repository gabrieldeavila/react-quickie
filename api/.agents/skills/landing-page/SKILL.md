---
name: landing-page
description: Full-page pipeline for building Awwwards/FWA-tier landing pages. Orchestrates narrative pacing, section-to-section momentum, global design systems, and advanced scroll interactions. Enforces fundamentals of pacing, unified typography, modular architecture, and extreme performance.
---

# Landing Page

> This skill governs the FULL LANDING PAGE. It assumes you already have a Hero Section strategy and now need to architect the journey from the fold down to the footer. It focuses on narrative flow, vertical rhythm, sticky interactions, and modular component reuse.

---

## The Pipeline

┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   BRIEF IN ──→ Phase 1: Narrative ──→ Phase 2: Page Architecture    │
│                  (extract flow)       (pick a scroll journey)        │
│                                                                      │
│                              ──→ Phase 3: Build & Bind               │
│                                   (systems, pacing, transitions,     │
│                                    scroll motion, footers)           │
│                                                                      │
│                              ──→ Phase 4: Verify                     │
│                                   (rhythm diff, scroll fatigue)      │
│                                                                      │
│   Each phase has a ✓ Quality Gate. Failing a gate blocks the next.   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

## **Phase 0: Global Design Integrity (Mandatory)**

Before generating the page layout, establish the global constraints that prevent a page from feeling like a disconnected Frankenstein of UI kits.

- **The "Scroll Fatigue" Rule**: No two consecutive sections should have the exact same layout (e.g., alternating left/right text-image blocks for 4 sections). Break the grid. Use full-bleed media, massive typographic intermissions, or horizontal scroll sections to reset the user's brain.
- **Contrast Pacing**: If the hero is dark, consider dropping into a light section for the narrative intro to create an immediate visual threshold, or vice versa. Avoid monotonous single-background-color pages unless heavily textured.
- **The Component Ecosystem**:
- Buttons, tags, cards, and form inputs MUST share a single design token system (border-radius, stroke width, hover physics).
- Never invent a new button style in section 4. Use the global <Button variant="secondary" />.

## **Phase 1: Read the Narrative**

Extract the core story the page needs to tell. A landing page is a sequential argument.

### **→ Extract these signals**

| **Signal** | **What to look for** |
| **Pacing Model** | Fast (SaaS conversion, high info density) vs. Slow (Luxury, editorial, atmospheric storytelling)? |
| **Trust Assets** | Are there client logos, metrics, or testimonials? Where do they carry the most weight? |
| **Feature Complexity** | Does the product need a Bento grid, deep-dive sticky scroll, or interactive demo? |
| **Section Count** | How many distinct narrative beats (e.g., Hero -> Problem -> Solution -> Proof -> Pricing -> CTA)? |
| **Footer Style** | Massive mega-footer with site map, or minimal striking brand sign-off? |

### **→ Output a Narrative Extraction**

State in 2-3 lines exactly what you extracted:

_"Narrative Extraction: Slow-paced luxury editorial flow. Dark mode primary with one light-mode intermission. Features heavy use of sticky-scroll image reveals and large typographic breaks. Ends in a massive minimalist footer. Feels like: High-end architectural studio."_

### **✓ Quality Gate: Read**

Confirm:

- You have extracted the narrative signals.
- You have written the Narrative Extraction summary.

## **Phase 2: Pick a Page Architecture**

Select ONE scroll architecture below. Commit fully.

### **Architecture A: The Modular SaaS (The Conversion Engine)**

_Best for: B2B SaaS, developer tools, AI startups._

High rhythm, highly scannable, dense but breathable. Relies heavily on grid systems, bento boxes, and crisp typography.

**Flow:**

1. **Hero**
2. **Social Proof Marquee** (Grayscale, muted client logos)
3. **The Bento Grid** (3-5 asymmetrical cards highlighting core features)
4. **Deep Dive** (Sticky left column with text, scrolling right column with UI mockups)
5. **Metrics/Testimonials** (Massive typography numbers or masonry grid of tweets/reviews)
6. **Pre-Footer CTA** (High contrast, centered, massive conversion focus)

### **Architecture B: The Editorial Journey (The Brand Builder)**

_Best for: Creative agencies, luxury products, fashion, portfolios._

Slow pacing. Relies on massive whitespace, huge typography, and breaking the traditional grid. Content often overlaps or uses asymmetric alignments.

**Flow:**

1. **Hero** (Full bleed or Typographic)
2. **The Manifesto** (Massive paragraph text spanning 80vw, acts as a breather)
3. **Horizontal Scroll** (Pin the section, scroll horizontally through a gallery or case studies)
4. **Asymmetric Showcases** (Alternating but offset image/text relationships with heavy parallax)
5. **Minimal Footer** (Just a massive logo, copyright, and social links)

### **Architecture C: The Interactive Product Showcase**

_Best for: Hardware (Apple-style), physical goods, single-feature deep dives._

The page feels like a presentation. Highly cinematic, relying on 3D elements, video scrubs linked to scroll, and dramatic reveals.

**Flow:**

1. **Hero** (3D product or high-end video)
2. **Scroll-Scrub Video** (As the user scrolls, a video or 3D sequence plays forward/backward)
3. **Feature Callouts** (Product stays pinned in center, text fades in/out around it)
4. **Technical Specs** (Tight, dense, monospace tabular data)
5. **Floating Buy Bar** (Appears on scroll, stays sticky at bottom or top of viewport)

### **✓ Quality Gate: Architecture**

Confirm:

- You selected ONE architecture.
- You have mapped the specific sections you will build.

## **Phase 3: Build & Bind**

### **→ Section Transitions (The "Glue")**

Avoid hard lines between sections unless intentional. Use these techniques:

- **The Bleed**: An image or card from Section 1 overflows into Section 2 by margin-bottom: -100px; z-index: 10.
- **The Inverted Wipe**: Section 1 is dark. Section 2 is light. Pin Section 1 and have Section 2 slide OVER it.
- **The Typographic Bridge**: A massive, fluid text element that acts as the divider between two distinct content areas.

### **→ The Bento Grid Blueprint (For Architecture A)**

CSS

/\* BLUEPRINT: Responsive Bento Grid
  WHY: CSS Grid with varying spans creates visual hierarchy
  without feeling chaotic. Use gap-4 or gap-8 globally. \*/
.bento-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(300px, auto);
  gap: 1.5rem;
}
.bento-hero-card { grid-column: span 8; } /\* Large feature \*/
.bento-side-card { grid-column: span 4; } /\* Supporting feature \*/
.bento-wide-card { grid-column: span 12; } /\* Full width break \*/

@media (max-width: 768px) {
  .bento-container > \* { grid-column: span 12 !important; }
}

### **→ Scroll-Linked Animation (Motion)**

Never tie raw scroll values to DOM positions via useState. Always use Framer Motion's useScroll and useTransform.

TypeScript

/\* BLUEPRINT: Sticky Scroll Reveal
  WHY: Keeps the user anchored while content changes.
  Creates a feeling of depth and presentation. \*/
const { scrollYProgress } = useScroll({ target: containerRef });
const y = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

// Apply to elements inside a position: sticky container.

### **→ Global Typography Scale**

Establish a strict clamp scale for the body to maintain vertical rhythm.

- **H2 (Section Headers):** clamp(2rem, 5vw, 4.5rem) — tight tracking.
- **H3 (Card Headers):** clamp(1.25rem, 2vw, 1.75rem) — normal tracking.
- **Body (Paragraphs):** clamp(1rem, 1vw, 1.125rem) — line-height: 1.6, max-width: 60ch.

### **✓ Quality Gate: Build**

Confirm:

- Transitions between sections are designed, not just stacked.
- Bento/Grid systems collapse properly on mobile.
- Scroll animations use performant wrappers (no state-driven scroll listeners).
- Paragraph widths never exceed 65-70 characters.

## **Phase 4: Verify**

### **Pacing & Rhythm Diff**

| **Check** | **PASS/FAIL** |
| No two consecutive sections use the exact same grid layout | |
| User is given a "visual breather" (whitespace/text only) at least once | |
| Text blocks do not exceed 65 characters in width to prevent reading fatigue | |

### **System Consistency Diff**

| **Check** | **PASS/FAIL** |
| All buttons share the same border-radius, hover physics, and font weights | |
| Card hover states are uniform across different sections | |
| Colors belong to the strict global palette (Primary, Surface, Background, Accent) | |

### **Performance & Motion Diff**

| **Check** | **PASS/FAIL** |
| Images below the fold use loading="lazy" | |
| Horizontal scrolls use CSS position: sticky and transforms, not scroll jacking | |
| Pre-footer CTAs have clear, immediately obvious click targets | |

## **The Core Principles**

**Protect the Grid, Then Break It.** Establish a rigid 12-column foundation. Use it for 80% of the page. Intentionally break it for the 20% that needs maximum impact.

**Pacing is Everything.** A landing page is a song. You cannot have the chorus playing constantly. Build tension with dense features, release it with massive whitespace and typography.

**Module Over Page.** Never style an element for a specific section. Build a <FeatureCard /> that accepts props. The landing page is just an orchestration of these agnostic modules.
