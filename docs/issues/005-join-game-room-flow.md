# Join game room flow

## User story
As a guest, I want to join a game by opening a shared link or entering a room code so that I can connect to my friend's room.

## Acceptance criteria
- [ ] `/join` page provides an input for 6-character room code and a **Join** button.
- [ ] Valid code navigates to `/play/:roomCode`.
- [ ] Invalid code (wrong length or characters) shows inline validation error without navigating.
- [ ] Opening `/play/:roomCode` directly (shared link) treats the user as guest and attempts join (connection attempt deferred to issue 006; show "Connecting…" state).
- [ ] Guest role is distinguished from host: host is the peer that created the room (first to load `/play/:code` without `?join` or explicit create navigation); document logic in code comments.
- [ ] Join page accessible from landing **Join Game** button.

## Test expectations
- Unit tests: `validateRoomCode()` accepts valid codes and rejects invalid ones.
- Component test: join form submits valid code and navigates to play route (router mock).
- Component test: invalid code shows error message.

## Out of scope
- WebRTC connection establishment (issue 006).
- Handling "room not found" from signaling server (surface generic error in issue 006).

## Suggested owner
worker
