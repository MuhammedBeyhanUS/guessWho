# Game setup sync (mystery selection and start)

## User story
As a player, I want to secretly choose my Mystery Person and start the game once both players are ready so that we can begin playing by the rules.

## Acceptance criteria
- [ ] When connected, game phase is `setup`: boards shown in `selectionMode`; player must pick one Mystery Person.
- [ ] Mystery selection stays **local only**; `{ type: 'ready' }` sent to opponent carries no character id (per ADR 002).
- [ ] **Ready** button enabled after mystery selected; sends `ready` message over P2P.
- [ ] After both peers are ready, **host runs coin flip** (animated UI visible to both); sends `{ type: 'coin-flip', result: 'host' | 'guest' }`.
- [ ] Host sends `{ type: 'game-start', firstPlayer }` matching coin flip result.
- [ ] Both clients transition to `playing` phase; status bar shows whose turn it is.
- [ ] Boards exit selection mode; flips reset to all open for gameplay eliminations.
- [ ] If opponent disconnects during setup, show clear message and return to waiting/error state.

## Test expectations
- Unit tests: game engine transitions `setup → playing` only when both ready, coin-flip received, and `game-start` received.
- Unit tests: cannot send `ready` without mystery selected.
- Unit tests: `firstPlayer` in `game-start` matches `coin-flip` result.
- Component test: Ready button disabled until selection made; enabled after (mock state).
- Component test: coin flip animation triggers before game-start.
- Integration test (mock transport): host + guest ready → coin-flip → game-start triggers `playing` on both sides.

## Out of scope
- Question/guess turn UI (issue 011).
- Rematch or return to lobby without reload.
- Validating that ready message doesn't expose mystery in network tab (document trust model).

## Suggested owner
worker
