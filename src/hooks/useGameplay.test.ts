import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createGame,
  resetQuestionIdCounter,
  selectMystery,
  startGame,
} from '../domain/game'
import {
  getWinnerLabel,
  handleGameplayMessage,
  useGameplay,
} from './useGameplay'

function setupPlayingGame() {
  let state = createGame()
  state = unwrap(selectMystery(state, 'host', 'eleni'))
  state = unwrap(selectMystery(state, 'guest', 'marco'))
  state = unwrap(startGame(state, 'host'))
  return state
}

function unwrap<T>(result: { ok: boolean; value?: T }): T {
  if (!result.ok) {
    throw new Error('Expected ok result')
  }
  return result.value as T
}

describe('getWinnerLabel', () => {
  it('returns winner text for local and remote winners', () => {
    const state = {
      ...setupPlayingGame(),
      phase: 'finished' as const,
      winner: 'host' as const,
      gameOverReason: 'correct-guess' as const,
      currentPlayer: null,
    }

    expect(getWinnerLabel(state, 'host')).toBe('You win!')
    expect(getWinnerLabel(state, 'guest')).toBe('Host wins')
  })
})

describe('handleGameplayMessage', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
  })

  it('applies remote question from opponent', () => {
    const state = setupPlayingGame()
    const next = handleGameplayMessage(
      { type: 'question', id: 'q-1', text: 'Does your person wear glasses?' },
      'guest',
      state,
      vi.fn(),
    )

    expect(next.pendingQuestion?.askedBy).toBe('host')
    expect(next.pendingQuestion?.text).toBe('Does your person wear glasses?')
  })

  it('resolves guess and emits guess-result and game-over', () => {
    const send = vi.fn()
    const state = setupPlayingGame()
    const next = handleGameplayMessage(
      { type: 'guess', characterId: 'marco' },
      'guest',
      state,
      send,
    )

    expect(next.phase).toBe('finished')
    expect(next.winner).toBe('host')
    expect(send).toHaveBeenCalledWith({ type: 'guess-result', correct: true })
    expect(send).toHaveBeenCalledWith({
      type: 'game-over',
      winner: 'host',
      reason: 'correct-guess',
    })
  })
})

describe('useGameplay', () => {
  beforeEach(() => {
    resetQuestionIdCounter()
    vi.stubGlobal('location', { href: '' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends question when asker submits on their turn', () => {
    const send = vi.fn()
    const initial = setupPlayingGame()

    const { result } = renderHook(() => {
      const [gameState, setGameState] = useState(initial)
      const gameplay = useGameplay({
        gameState,
        localRole: 'host',
        setGameState,
        send,
      })
      return { gameState, gameplay }
    })

    act(() => {
      result.current.gameplay.submitQuestion('Does your person wear glasses?')
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'question',
        text: 'Does your person wear glasses?',
      }),
    )
    expect(result.current.gameState.pendingQuestion).not.toBeNull()
  })

  it('navigates home on play again', () => {
    const send = vi.fn()
    const finished = {
      ...setupPlayingGame(),
      phase: 'finished' as const,
      winner: 'host' as const,
      gameOverReason: 'correct-guess' as const,
      currentPlayer: null,
    }

    const { result } = renderHook(() =>
      useGameplay({
        gameState: finished,
        localRole: 'host',
        setGameState: vi.fn(),
        send,
      }),
    )

    act(() => {
      result.current.playAgain()
    })

    expect(window.location.href).toBe('/')
  })
})
