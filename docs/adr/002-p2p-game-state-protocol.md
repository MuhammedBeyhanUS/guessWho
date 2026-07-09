# P2P Game State Protocol

## Status
Accepted

## Context

Once WebRTC connects, game events, text chat, and session setup must sync between two browsers. Guess Who has a critical privacy rule: **each player's board eliminations are local only**. Only turn actions, answers, guesses, and outcomes need to cross the wire.

## Decision

Use a **single ordered `RTCDataChannel`** carrying JSON messages with a `type` discriminator. Voice uses a separate `MediaStream` on the same `RTCPeerConnection`.

### Message types

```typescript
type P2PMessage =
  | { type: 'chat'; id: string; text: string; sentAt: number }
  | { type: 'ready' }  // opaque signal only; mysteryCharacterId stays local
  | { type: 'coin-flip'; result: 'host' | 'guest' }  // host sends after both ready
  | { type: 'game-start'; firstPlayer: 'host' | 'guest' }
  | { type: 'question'; id: string; text: string }
  | { type: 'answer'; questionId: string; value: 'yes' | 'no' }
  | { type: 'guess'; characterId: string }
  | { type: 'guess-result'; correct: boolean }
  | { type: 'game-over'; winner: 'host' | 'guest'; reason: 'correct-guess' | 'wrong-guess' };
```

### Turn order: coin flip

After both players send `ready`, the **host** runs a coin flip (animated UI on both clients), sends `coin-flip` with the result, then sends `game-start` with `firstPlayer` matching the flip. This matches the physical game's chance element and avoids always-favoring the host.

### Authority model

- **Host** generates room code and orchestrates setup (`coin-flip`, `game-start`).
- **Answerer** validates `answer` against their locally stored mystery character traits.
- **Guess target** validates `guess` against their mystery character id.
- **Board flips** are never transmitted; each player flips tiles **manually** on their own board (physical-game style — no auto-elimination).

### Ordering

- Data channel created with `ordered: true` to preserve message sequence.
- Game rules engine is the single source of truth for turn legality on each client; invalid messages are ignored and optionally surfaced as UI warnings.

## Consequences

- Protocol module in `domain/` or `transport/` must have unit tests for serialization and state transitions.
- Cheating (lying about answers) is possible — acceptable for casual trust-based play, same as physical game.
- Reconnection mid-game is **out of scope** for v1; disconnect ends session.
- Adding new message types requires version discipline; no explicit versioning in v1 (two known clients).
