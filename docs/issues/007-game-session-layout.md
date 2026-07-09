# Game session layout shell

## User story
As a connected player, I want a game screen showing my board, opponent status, chat, and voice controls so that I have everything needed to play in one view.

## Acceptance criteria
- [ ] `/play/:roomCode` connected state renders a game session layout (replaces bare waiting UI from issues 004/005).
- [ ] Layout includes:
  - Local player's `CharacterBoard` (issue 002).
  - Opponent panel (name/role label, connection indicator; opponent board **not** shown — eliminations are private).
  - Text chat panel placeholder region.
  - Voice control bar placeholder (mute button, mic status).
  - Turn/status bar placeholder (current phase, whose turn).
- [ ] Responsive layout: stacked on narrow screens, side-by-side panels on wide screens.
- [ ] When `P2PConnection` is not `connected`, show waiting or error overlay instead of interactive game controls.
- [ ] Host and guest see appropriate role labels.

## Test expectations
- Component test: layout renders board, chat region, and voice bar when connection state is `connected` (mock connection).
- Component test: waiting overlay shown when connection state is `connecting`.

## Out of scope
- Functional text chat (issue 008).
- Functional voice (issue 009).
- Gameplay actions and turn UI (issues 010, 011).

## Suggested owner
worker
