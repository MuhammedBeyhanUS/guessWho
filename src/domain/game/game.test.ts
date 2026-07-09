import { describe, expect, it, beforeEach } from 'vitest'
import {
  askQuestion,
  answerQuestion,
  createGame,
  flipBoardTile,
  guess,
  resetQuestionIdCounter,
  selectMystery,
  startGame,
  suggestEliminations,
} from './index'

function setupPlayingGame(firstPlayer: 'host' | 'guest' = 'host') {
  let state = createGame()
  state = unwrap(selectMystery(state, 'host', 'eleni'))
  state = unwrap(selectMystery(state, 'guest', 'marco'))
  state = unwrap(startGame(state, firstPlayer))
  return state
}

function unwrap<T>(result: { ok: boolean; value?: T; error?: unknown }): T {
  expect(result.ok).toBe(true)
  return result.value as T
}

function expectError(
  result: { ok: boolean; error?: unknown },
  error: string,
): void {
  expect(result.ok).toBe(false)
  if (!result.ok) {
    expect(result.error).toBe(error)
  }
}

describe('createGame', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('starts in setup phase with empty mysteries and open boards', () => {
    const state = createGame()
    expect(state.phase).toBe('setup')
    expect(state.players.host.mysteryCharacterId).toBeNull()
    expect(state.players.guest.mysteryCharacterId).toBeNull()
    expect(state.currentPlayer).toBeNull()
    expect(state.pendingQuestion).toBeNull()
    expect(state.players.host.boardFlips.eleni).toBe('open')
  })
})

describe('selectMystery', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('sets a player mystery during setup', () => {
    let state = createGame()
    state = unwrap(selectMystery(state, 'host', 'theo'))
    expect(state.players.host.mysteryCharacterId).toBe('theo')
  })

  it('rejects invalid characters', () => {
    expectError(
      selectMystery(createGame(), 'host', 'unknown'),
      'invalid-character',
    )
  })

  it('rejects selection after setup', () => {
    const state = setupPlayingGame()
    expectError(selectMystery(state, 'host', 'theo'), 'wrong-phase')
  })
})

describe('startGame', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('requires both mysteries before starting', () => {
    let state = createGame()
    state = unwrap(selectMystery(state, 'host', 'eleni'))
    expectError(startGame(state, 'host'), 'not-all-ready')
  })

  it('transitions to playing with the chosen first player', () => {
    const state = setupPlayingGame('guest')
    expect(state.phase).toBe('playing')
    expect(state.currentPlayer).toBe('guest')
  })
})

describe('turn cycle', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('runs question → answer → turn switch', () => {
    let state = setupPlayingGame('host')

    state = unwrap(askQuestion(state, 'host', 'Does your person wear glasses?'))
    expect(state.pendingQuestion?.askedBy).toBe('host')
    expect(state.currentPlayer).toBe('host')

    state = unwrap(answerQuestion(state, 'guest', 'yes'))
    expect(state.pendingQuestion).toBeNull()
    expect(state.currentPlayer).toBe('guest')
  })

  it('rejects acting out of turn', () => {
    const state = setupPlayingGame('host')
    expectError(
      askQuestion(state, 'guest', 'Does your person wear glasses?'),
      'not-your-turn',
    )
  })

  it('rejects answering when not prompted', () => {
    const state = setupPlayingGame('host')
    expectError(answerQuestion(state, 'guest', 'yes'), 'no-pending-question')
  })

  it('rejects the asker answering their own question', () => {
    let state = setupPlayingGame('host')
    state = unwrap(askQuestion(state, 'host', 'Does your person wear glasses?'))
    expectError(answerQuestion(state, 'host', 'yes'), 'not-your-turn')
  })

  it('rejects guessing on the same turn as asking', () => {
    let state = setupPlayingGame('host')
    state = unwrap(askQuestion(state, 'host', 'Does your person wear glasses?'))
    expectError(guess(state, 'host', 'marco'), 'pending-question')
  })

  it('rejects incorrect answers that do not match mystery traits', () => {
    let state = setupPlayingGame('host')
    state = unwrap(askQuestion(state, 'host', 'Does your person wear glasses?'))
    expectError(answerQuestion(state, 'guest', 'no'), 'invalid-answer')
  })
})

describe('guess', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('ends the game with the guesser as winner on a correct guess', () => {
    let state = setupPlayingGame('host')
    state = unwrap(guess(state, 'host', 'marco'))
    expect(state.phase).toBe('finished')
    expect(state.winner).toBe('host')
    expect(state.gameOverReason).toBe('correct-guess')
  })

  it('ends the game with the opponent as winner on an incorrect guess', () => {
    let state = setupPlayingGame('host')
    state = unwrap(guess(state, 'host', 'eleni'))
    expect(state.phase).toBe('finished')
    expect(state.winner).toBe('guest')
    expect(state.gameOverReason).toBe('wrong-guess')
  })

  it('rejects guesses after the game is finished', () => {
    let state = setupPlayingGame('host')
    state = unwrap(guess(state, 'host', 'marco'))
    expectError(guess(state, 'guest', 'eleni'), 'game-finished')
  })
})

describe('flipBoardTile', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('flips a local board tile without changing turn state', () => {
    let state = setupPlayingGame('host')
    state = unwrap(flipBoardTile(state, 'host', 'priya'))
    expect(state.players.host.boardFlips.priya).toBe('closed')
    expect(state.currentPlayer).toBe('host')
    expect(state.pendingQuestion).toBeNull()
  })

  it('does not auto-flip tiles after answering', () => {
    let state = setupPlayingGame('host')
    state = unwrap(askQuestion(state, 'host', 'Does your person wear glasses?'))
    state = unwrap(answerQuestion(state, 'guest', 'yes'))

    const suggestions = suggestEliminations(
      'Does your person wear glasses?',
      'yes',
    )
    expect(suggestions.length).toBeGreaterThan(0)
    for (const characterId of suggestions) {
      expect(state.players.host.boardFlips[characterId]).toBe('open')
    }
  })
})

describe('immutability', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('returns new state objects from reducers', () => {
    const initial = setupPlayingGame('host')
    const asked = unwrap(
      askQuestion(initial, 'host', 'Does your person wear glasses?'),
    )
    expect(asked).not.toBe(initial)
    expect(initial.pendingQuestion).toBeNull()
    expect(asked.pendingQuestion).not.toBeNull()

    const flipped = unwrap(flipBoardTile(initial, 'host', 'priya'))
    expect(flipped).not.toBe(initial)
    expect(flipped.players).not.toBe(initial.players)
    expect(flipped.players.host).not.toBe(initial.players.host)
    expect(initial.players.host.boardFlips.priya).toBe('open')
  })
})
