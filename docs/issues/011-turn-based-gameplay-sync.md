# Turn-based gameplay sync

## User story
As a player, I want the website to enforce Guess Who rules across both players so that we can ask questions, answer yes/no, guess, and win or lose correctly.

## Acceptance criteria
- [ ] **Asker UI** (on your turn): text input for yes/no question + **Ask** button; **Guess** mode to pick a character and confirm guess.
- [ ] **Answerer UI** (opponent's turn after question): prominent **Yes** / **No** buttons; buttons disabled when not answerer's turn to respond.
- [ ] Actions emit P2P messages: `question`, `answer`, `guess`, `guess-result`, `game-over` per ADR 002 and rules engine (issue 003).
- [ ] **Manual board elimination only** — after receiving `answer`, player flips tiles themselves on their own board; app does **not** auto-flip (physical-game style).
- [ ] Correct guess flow: guesser sends `guess`; answerer responds `guess-result: correct`; game shows win screen for guesser.
- [ ] Incorrect guess flow: `guess-result: incorrect`; game shows loss for guesser / win for answerer immediately.
- [ ] Turn indicator updates after each resolved question or guess.
- [ ] Game over screen: winner announced, **Play Again** (reload or navigate home) CTA.
- [ ] Out-of-turn actions blocked in UI and ignored in rules engine if received over wire.

## Test expectations
- Unit tests: full simulated game over P2P message sequence produces correct winner in rules engine.
- Unit tests: wrong guess on opponent's mystery returns `incorrect` and ends game.
- Unit tests: receiving `answer` does not mutate board state automatically.
- Component test: Yes/No buttons only enabled for answerer during pending question.
- Component test: game over screen renders winner text after terminal state.

## Out of scope
- Auto-flip / elimination suggestions.
- Anti-cheat / answer verification beyond local mystery traits.
- Reconnection mid-game.
- Championship best-of-5 series.

## Suggested owner
worker
