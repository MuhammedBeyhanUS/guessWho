# Text chat over P2P

## User story
As a player, I want to send and receive text messages with my opponent in real time so that we can communicate during the game.

## Acceptance criteria
- [ ] Chat panel in game layout: scrollable message list, text input, send button (Enter to send).
- [ ] Messages sent as `{ type: 'chat', id, text, sentAt }` over data channel (ADR 002).
- [ ] Received messages append to local chat history with sender side distinction (self vs opponent).
- [ ] Empty messages cannot be sent.
- [ ] Chat works independently of game phase (usable while waiting or playing).
- [ ] Chat history is in-memory only; cleared on disconnect or page reload.
- [ ] Optional: game events (`question`, `answer`) mirrored into chat as system lines (nice-to-have within this issue if trivial).

## Test expectations
- Unit tests: chat message handler appends to history; deduplicates by `id` if resent.
- Component test: typing and submitting adds message to list (mock transport).
- Component test: incoming message from transport appears on opponent side.

## Out of scope
- Message persistence, moderation, or typing indicators.
- Voice chat (issue 009).
- Rich text, emoji picker, or file attachments.

## Suggested owner
worker
