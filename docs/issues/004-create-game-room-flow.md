# Create game room flow

## User story
As a host, I want to create a game and get a shareable link with a room code so that I can invite a friend to join.

## Acceptance criteria
- [ ] `generateRoomCode()` produces a random 6-character string from **`A–Z` and `2–9` only** — excludes `0`/`O`/`1`/`I` for readability.
- [ ] **Create Game** on landing generates a new code and navigates to `/play/:roomCode`.
- [ ] Create page shows: room code prominently, full shareable URL, **Copy Link** button, and **Share** button.
- [ ] **Copy Link** copies URL to clipboard and shows brief success feedback.
- [ ] **Share** uses `navigator.share({ url, title, text })` when available; falls back to copy on unsupported browsers.
- [ ] Waiting state UI: "Waiting for opponent…" with connection status placeholder until P2P layer exists.
- [ ] Room code generation is unit-tested for length, charset `^[A-Z2-9]{6}$`, and `crypto.getRandomValues` usage.

## Test expectations
- Unit tests: `generateRoomCode()` output matches `^[A-Z2-9]{6}$`.
- Component test: create page renders code, URL, Copy and Share buttons.
- Component test: Copy button invokes clipboard API (mocked).

## Out of scope
- Actual peer connection or signaling (issue 006).
- Blocking duplicate room codes on signaling server.
- QR code generation.

## Suggested owner
worker
