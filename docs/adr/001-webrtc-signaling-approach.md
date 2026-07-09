# WebRTC Signaling Approach

## Status
Accepted

## Context

Guess Who requires automatic connection when a guest opens a shareable room link. WebRTC provides P2P voice and data channels but **cannot** establish connections without exchanging SDP offers/answers and ICE candidates — the signaling step.

Requirements:

- No traditional application backend (no REST API, DB, game server).
- Acceptable to run a **minimal** signaling relay.
- Must support link-based joining with a 6-character room code.

## Decision

Use **native `RTCPeerConnection`** wrapped in a project-owned transport module, with a **self-hosted PeerJS PeerServer** bundled in the repo.

### Signaling: self-hosted from day one

| Aspect | Choice |
|---|---|
| Server | `peer` npm package (PeerServer) in `signaling/` |
| Dev | `npm run signaling` alongside `npm run dev` |
| Prod | Same PeerServer deployed to Render/Fly free tier |
| Config | `VITE_SIGNALING_URL` env var (e.g. `localhost:9000` dev, `wss://signaling.example.com` prod) |

**Why not PeerJS cloud broker:** third-party availability/rate limits, two configs (dev vs prod), and no control over uptime. Self-hosted PeerServer is ~30 lines, free-tier deployable, and one consistent config.

Signaling server responsibilities are **only**:

1. Register host peer by room code.
2. Forward SDP/ICE between exactly two peers in a room.

The signaling server **never** touches game state, chat content, or media streams.

### ICE / NAT

- **STUN:** Public servers (e.g. `stun:stun.l.google.com:19302`).
- **TURN:** Included from v1 via env-configured credentials (`VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_PASSWORD`). Use a free-tier TURN provider (e.g. Metered, Twilio trial) or self-hosted coturn if needed.

**Rejected alternatives:**

| Alternative | Why rejected |
|---|---|
| PeerJS cloud broker only | Unreliable for production; splits dev/prod config |
| Manual SDP copy-paste | Unacceptable UX for shareable-link product |
| Full custom WebSocket game server | Violates no-game-server goal; unnecessary |
| PeerJS client SDK only | Couples game code to PeerJS API; harder to swap signaling |
| Firebase / Supabase realtime | Adds vendor backend dependency for data that fits P2P |

## Consequences

- Repo includes `signaling/` with PeerServer and `npm run signaling` script.
- Transport layer must be interface-driven so signaling URL and TURN can change without touching game rules.
- HTTPS required on both static host and signaling host for production WebRTC.
- Room codes are "first claim" on the signaling server; no persistence if host never connects.
- Follow-up: ADR 002 defines the data-channel protocol on top of the established peer connection.
