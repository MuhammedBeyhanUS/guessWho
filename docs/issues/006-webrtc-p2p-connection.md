# WebRTC P2P connection layer

## User story
As a player, I want my browser to automatically connect to my opponent when we share the same room code so that voice, chat, and game sync can work without a game server.

## Acceptance criteria
- [ ] `signaling/` directory with self-hosted PeerServer (`peer` package) and `npm run signaling` script (ADR 001).
- [ ] `transport/` module exposes a narrow interface, e.g. `P2PConnection`: `connectAsHost(roomCode)`, `connectAsGuest(roomCode)`, `send(message)`, `onMessage`, `onConnectionStateChange`, `close()`.
- [ ] Implements WebRTC per ADR 001: `RTCPeerConnection` + ordered `RTCDataChannel` for JSON messages.
- [ ] Signaling via configurable `VITE_SIGNALING_URL` (default: `localhost:9000` for dev).
- [ ] Host registers with room code; guest joins host; SDP/ICE exchanged through signaling.
- [ ] ICE config includes public STUN server(s) and **TURN credentials from env** (`VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_PASSWORD`).
- [ ] Connection states surfaced: `connecting`, `connected`, `failed`, `disconnected`.
- [ ] On `/play/:roomCode`, host auto-connects on create path; guest auto-connects on join/direct link path.
- [ ] README documents running `npm run signaling` + `npm run dev` for local development.
- [ ] Failed connection shows user-friendly error with retry option.

## Test expectations
- Unit tests: message serialize/deserialize round-trip for all P2P message types in ADR 002.
- Unit tests: connection state machine transitions (mock signaling/WebRTC).
- Manual test documented in PR: two tabs connect with same room code and exchange a test message.

## Out of scope
- Voice tracks (issue 009).
- Game-specific message handling beyond transport (issues 008, 010, 011).
- Automated CI test with real WebRTC.

## Suggested owner
worker
