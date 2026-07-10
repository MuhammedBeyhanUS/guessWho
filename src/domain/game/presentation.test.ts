import { describe, expect, it } from 'vitest'
import { createGame, guess, selectMystery, startGame } from './game'
import { getGameOverPresentation } from './presentation'

function unwrap<T>(result: { ok: boolean; value?: T }): T {
  if (!result.ok) {
    throw new Error('Expected ok result')
  }
  return result.value as T
}

function setupPlayingGame() {
  let state = createGame()
  state = unwrap(selectMystery(state, 'host', 'eleni'))
  state = unwrap(selectMystery(state, 'guest', 'marco'))
  return unwrap(startGame(state, 'host'))
}

describe('getGameOverPresentation', () => {
  it('returns null when the game is not finished', () => {
    expect(getGameOverPresentation(setupPlayingGame(), 'host')).toBeNull()
  })

  it('celebrates a correct guess by the local player', () => {
    const state = unwrap(guess(setupPlayingGame(), 'host', 'marco'))

    expect(getGameOverPresentation(state, 'host')).toEqual({
      title: 'Correct guess!',
      message: 'Congratulations — you win!',
      revealedCharacterId: 'marco',
      isLocalWinner: true,
    })
  })

  it('reveals the mystery character after a wrong local guess', () => {
    const state = unwrap(guess(setupPlayingGame(), 'host', 'eleni'))

    expect(getGameOverPresentation(state, 'host')).toEqual({
      title: 'Wrong guess',
      message: 'The mystery person was actually:',
      revealedCharacterId: 'marco',
      isLocalWinner: false,
    })
  })

  it('shows the local mystery when the opponent guessed correctly', () => {
    const state = unwrap(guess(setupPlayingGame(), 'host', 'marco'))

    expect(getGameOverPresentation(state, 'guest')).toEqual({
      title: 'Game over',
      message: 'Your opponent guessed correctly.',
      revealedCharacterId: 'marco',
      isLocalWinner: false,
    })
  })

  it('shows the local mystery when the opponent guessed wrong', () => {
    const state = unwrap(guess(setupPlayingGame(), 'host', 'eleni'))

    expect(getGameOverPresentation(state, 'guest')).toEqual({
      title: 'Wrong guess!',
      message: 'Your opponent guessed incorrectly. You win!',
      revealedCharacterId: 'marco',
      isLocalWinner: true,
    })
  })
})
