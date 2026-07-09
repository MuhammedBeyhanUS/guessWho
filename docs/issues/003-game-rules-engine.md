# Game rules engine (pure TypeScript)

## User story
As a developer, I want a testable rules engine that enforces classic Guess Who rules so that gameplay logic is correct and independent of UI and networking.

## Acceptance criteria
- [ ] `domain/game/` module implements game phases: `setup`, `playing`, `finished`.
- [ ] Each player has local state: `mysteryCharacterId` (secret), `boardFlips` (local eliminations), `role` (`host` | `guest`).
- [ ] Turn actions supported: `askQuestion(text)`, `answerQuestion(yes | no)`, `guess(characterId)`.
- [ ] Rules enforced:
  - Only the player whose turn it is may act.
  - One action per turn: question **or** guess, not both.
  - Answers must be `yes` or `no` and derive from answerer's mystery character traits (helper provided).
  - After answer, asker's board eliminations are computed locally from question + answer (optional helper; manual flips still allowed in UI).
  - Correct guess → game over, guesser wins.
  - Incorrect guess → game over, opponent wins immediately.
- [ ] `createGame()`, `selectMystery()`, `startGame(firstPlayer)`, and action reducers return immutable new state or `Result` with error reasons.
- [ ] No React, WebRTC, or DOM imports in `domain/`.

## Test expectations
- Full turn cycle: question → answer → turn switches to other player.
- Incorrect guess ends game with opponent as winner.
- Correct guess ends game with guesser as winner.
- Acting out of turn returns error / no state change.
- Answering when not prompted returns error.
- Guessing on same turn as asking is rejected.

## Out of scope
- UI components.
- P2P message serialization (issue 006 / ADR 002).
- Championship series or rematch flow.

## Suggested owner
worker
