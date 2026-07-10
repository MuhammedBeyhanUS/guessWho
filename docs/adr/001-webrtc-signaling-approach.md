# WebRTC Signaling Approach

## Status
Accepted (updated 2026-03-20)

## Context

Guess Who requires automatic connection when a guest opens a shareable room link. WebRTC provides P2P voice and data channels but **cannot** establish connections without exchanging SDP offers/answers and ICE candidates — the signaling step.

Requirements:

- No traditional application backend (no REST API, DB, game server).
- Minimal setup for local development (single `npm run dev` preferred).
- Must support link-based joining with a 6-character room code.

## Decision

Use the **PeerJS client SDK** with the **PeerJS cloud broker** (`0.peerjs.com`) as the default signaling path.

| Aspect | Choice |
|---|---|
| Client | `peerjs` npm package |
| Default signaling | PeerJS cloud broker (no local process) |
| Dev | `npm run dev` only |
| Optional override | `VITE_SIGNALING_URL=localhost:9000` + `npm run signaling` for self-hosted PeerServer |
| Peer ID | `guesswho-{ROOM_CODE}` on the broker |
| Game/voice data | PeerJS `DataConnection` + `MediaConnection` (still P2P after handshake) |

### Why PeerJS cloud (default)

- **Zero local infra for dev** — matches the `dev/game` prototype workflow; two browser tabs connect without a second terminal.
- **Same config for quick deploys** — static frontend only; no signaling VM required for hobby/small-scale use.
- **PeerJS still establishes true P2P** — broker only relays SDP/ICE; game state and media do not pass through the broker.

### Optional self-hosted signaling

`signaling/` (PeerServer) remains in the repo for teams that want a private broker:

```bash
VITE_SIGNALING_URL=localhost:9000 npm run signaling   # terminal 1
VITE_SIGNALING_URL=localhost:9000 npm run dev           # terminal 2
```

Set `VITE_SIGNALING_URL=cloud` (or leave unset) to use the public broker.

The signaling server **never** touches game state, chat content, or media streams.

### ICE / NAT

- PeerJS cloud path uses PeerJS-managed STUN/TURN defaults.
- Self-hosted path may still use `VITE_TURN_*` env vars via custom RTC config if we re-enable the legacy native transport.

### Rejected / superseded

| Alternative | Outcome |
|---|---|
| Self-hosted only (previous ADR) | Superseded as default — higher dev friction |
| Manual SDP copy-paste | Unacceptable UX |
| Full custom WebSocket game server | Violates no-game-server goal |
| Firebase / Supabase realtime | Vendor backend for data that fits P2P |

The previous **native `RTCPeerConnection` + self-hosted PeerServer** implementation remains in `webrtcConnection.ts` as an optional legacy transport (`createWebRtcP2PConnection`).

## Consequences

- `peerjs` is a runtime dependency; transport stays behind `P2PConnection`.
- Room codes are "first claim" on the broker; duplicate host IDs return "room already in use".
- PeerJS cloud availability and rate limits are an external dependency for the default path.
- Production on custom domains still requires HTTPS for WebRTC.
- Follow-up: ADR 002 defines the data-channel message protocol (unchanged).
- Product requirements aligned in `docs/PRD.md` (signaling, deployment, resolved decisions).
