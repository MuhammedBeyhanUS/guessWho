# Voice chat over P2P

## User story
As a player, I want live voice chat with my opponent when we connect so that we can speak naturally while playing.

## Acceptance criteria
- [ ] On P2P connection, request microphone via `navigator.mediaDevices.getUserMedia({ audio: true })`.
- [ ] Local audio track added to `RTCPeerConnection`; remote audio played via `<audio autoPlay>` or `Audio` element (handle browser autoplay policies).
- [ ] Voice control bar: **Mute / Unmute** self, visual mic-on/mic-off indicator, connection indicator.
- [ ] Permission denied: show non-blocking banner; game and text chat continue without voice.
- [ ] Mute toggles track `enabled` without dropping the connection.
- [ ] Remote stream `ontrack` handler attaches incoming audio to player element.
- [ ] Voice connects automatically when second player joins (no extra "start voice" step).

## Test expectations
- Unit tests: mute toggle sets `track.enabled` to expected boolean (mock `MediaStreamTrack`).
- Component test: voice bar renders mute button and status; permission-denied state shows banner (mock `getUserMedia` rejection).
- Manual test documented: two tabs hear each other after allowing microphone.

## Out of scope
- Video / screen share.
- Noise suppression configuration beyond browser defaults.
- Push-to-talk mode.
- TURN-specific audio fallbacks.

## Suggested owner
worker
