# Character roster and interactive board UI

## User story
As a player, I want to see all 24 Guess Who characters on a board with beautiful illustrations and flip them open or closed so that I can eliminate suspects during the game.

## Acceptance criteria
- [ ] `domain/characters.ts` defines 24 characters with stable ids, display names, and trait attributes (hair color, glasses, hat, facial hair, gender presentation, etc.) matching classic Guess Who semantics. Original names — not Hasbro's roster.
- [ ] **24 original Hasbro-style custom portrait illustrations** (SVG preferred) per ADR 003 — bold, colorful, readable at ~80×80 px. This is the visual core of the product; emoji/placeholder is dev-only behind a flag.
- [ ] Shared **card-back** asset for closed tiles (patterned back, not a gray box).
- [ ] Trait distribution table documented: traits spread meaningfully across 24 characters (e.g. ~8 with glasses).
- [ ] `CharacterBoard` component renders a responsive grid of 24 character tiles with illustrations.
- [ ] Clicking/tapping a tile toggles its state: **open** (face-up, in play) ↔ **closed** (face-down, eliminated).
- [ ] Closed tiles show card-back; open tiles show full portrait.
- [ ] Board state is managed via React state or a small hook; flips are local-only (no network).
- [ ] **Manual flip only** — no auto-elimination after questions/answers.
- [ ] `selectionMode` prop allows picking exactly one character as Mystery Person (highlight selected; disable further picks until reset).
- [ ] Character data and board reducer logic are importable without React for testing.

## Test expectations
- Unit tests: character roster has 24 unique ids; trait accessors return expected values for sample characters.
- Unit tests: board reducer/hook toggles flip state correctly; cannot flip same tile twice without toggling back.
- Component test: clicking a tile changes its visual/state to closed (card-back visible).
- Component test: all 24 tiles render with image assets (not broken src).

## Out of scope
- Networking or syncing flip state to opponent.
- Game turn rules enforcement (issue 003).
- Mystery Person secrecy from peer (issue 010).

## Suggested owner
worker
