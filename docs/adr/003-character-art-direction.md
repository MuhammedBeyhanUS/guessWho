# Character Art Direction

## Status
Accepted

## Context

Guess Who's core appeal is recognizing and eliminating characters by visual traits. The product owner confirmed that **character design is the lifeblood of the game** — illustrations must be a first-class investment, not an afterthought.

Requirements:

- Hasbro-style look and feel: colorful, friendly, readable at small tile sizes.
- **Original custom illustrations** — no Hasbro assets, no copyrighted character likenesses.
- 24 distinct characters with clearly scannable traits (glasses, hat, hair color, facial hair, etc.).
- Consistent art style across the full roster.

## Decision

### Visual style

- **Illustration style:** Flat-to-semi-flat vector portraits inspired by classic board-game cards — bold outlines, saturated colors, simple shapes, expressive faces.
- **Tile format:** Square portrait, ~1:1 aspect ratio, character bust (head + shoulders).
- **Open state:** Full-color portrait on a light card background.
- **Closed state:** Card flipped to a neutral patterned back (not a gray box) — same physical-game feel.

### Roster design principles

1. **Trait legibility** — every distinguishing trait must be obvious at ~80×80 px.
2. **Balanced distribution** — traits are spread across the roster so yes/no questions are meaningful (e.g. ~8 characters with glasses, ~4 with hats).
3. **Diverse representation** — varied skin tones, hair, ages, and presentation without stereotype.
4. **Original identities** — unique names and faces; no "Alex", "Bernard" etc. from the Hasbro set.

### Asset pipeline

```
src/assets/characters/
  alexa.svg        # or .webp for raster exports
  ...
  index.ts         # id → asset path map
```

- **Primary format:** SVG for sharp scaling and small bundle size; export WebP fallback if needed for complex shading.
- **Source of truth:** `domain/characters.ts` holds ids, names, traits; assets keyed by id.
- **Placeholder rule:** emoji/placeholder avatars are **not acceptable** for release — only for pre-asset dev scaffolding behind a `USE_PLACEHOLDER` flag.

### Design deliverable (issue 002)

Before or alongside board UI implementation:

- [ ] Style reference sheet (1 sample character at final quality).
- [ ] Trait distribution table for all 24 characters.
- [ ] All 24 portrait assets + 1 shared card-back asset.

## Consequences

- Issue 002 scope increases: character art is not deferrable polish.
- A dedicated design pass should precede or run in parallel with board component work.
- Bundle size monitored; SVG preferred, lazy-load if needed.
- Future localization only affects display names, not asset ids.
