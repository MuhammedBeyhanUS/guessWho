import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getGameStatusText, useGameSession } from './useGameSession'
import {
  applyCoinFlip,
  applyRemoteReady,
  beginPlaying,
  createGame,
  markPlayerReady,
  selectMystery,
} from '../domain/game'
import type { P2PMessage } from '../transport/protocol'
import type { ConnectionState } from '../transport/types'

type MessageHandler = (message: P2PMessage) => void

function unwrapState<T>(result: {
  ok: boolean
  value?: T
  error?: unknown
}): T {
  if (!result.ok) {
    throw new Error(`Expected ok result: ${String(result.error)}`)
  }

  return result.value as T
}

function createMockTransport() {
  let hostHandler: MessageHandler | undefined
  let guestHandler: MessageHandler | undefined
  const hostSend = vi.fn((message: P2PMessage) => {
    guestHandler?.(message)
  })
  const guestSend = vi.fn((message: P2PMessage) => {
    hostHandler?.(message)
  })

  return {
    hostSend,
    guestSend,
    hostOnMessage: vi.fn((handler: MessageHandler) => {
      hostHandler = handler
      return () => {
        hostHandler = undefined
      }
    }),
    guestOnMessage: vi.fn((handler: MessageHandler) => {
      guestHandler = handler
      return () => {
        guestHandler = undefined
      }
    }),
  }
}

describe('getGameStatusText', () => {
  it('shows turn indicator during playing phase', () => {
    let state = createGame()
    state = {
      ...state,
      phase: 'playing',
      currentPlayer: 'host',
    }

    expect(getGameStatusText(state, 'host', false)).toBe('Your turn')
    expect(getGameStatusText(state, 'guest', false)).toBe("Opponent's turn")
  })
})

describe('useGameSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('cannot send ready without mystery selected', () => {
    const transport = createMockTransport()
    const { result } = renderHook(() =>
      useGameSession({
        isHost: true,
        connectionState: 'connected',
        send: transport.hostSend,
        onMessage: transport.hostOnMessage,
      }),
    )

    expect(result.current.canSendReady).toBe(false)

    act(() => {
      result.current.sendReady()
    })

    expect(transport.hostSend).not.toHaveBeenCalled()
    expect(result.current.isLocalReady).toBe(false)
  })

  it('enables ready after mystery selection and sends ready message', () => {
    const transport = createMockTransport()
    const { result } = renderHook(() =>
      useGameSession({
        isHost: true,
        connectionState: 'connected',
        send: transport.hostSend,
        onMessage: transport.hostOnMessage,
      }),
    )

    act(() => {
      result.current.selectMysteryCharacter('eleni')
    })

    expect(result.current.canSendReady).toBe(true)

    act(() => {
      result.current.sendReady()
    })

    expect(transport.hostSend).toHaveBeenCalledWith({ type: 'ready' })
    expect(result.current.isLocalReady).toBe(true)
  })

  it('runs host coin flip before game-start and transitions both sides to playing', async () => {
    const transport = createMockTransport()
    const randomCoinFlip = vi.fn(() => 'guest' as const)

    const { result: hostResult } = renderHook(() =>
      useGameSession({
        isHost: true,
        connectionState: 'connected',
        send: transport.hostSend,
        onMessage: transport.hostOnMessage,
        coinFlipDelayMs: 50,
        randomCoinFlip,
      }),
    )

    const { result: guestResult } = renderHook(() =>
      useGameSession({
        isHost: false,
        connectionState: 'connected',
        send: transport.guestSend,
        onMessage: transport.guestOnMessage,
        coinFlipDelayMs: 50,
        randomCoinFlip,
      }),
    )

    act(() => {
      hostResult.current.selectMysteryCharacter('eleni')
      hostResult.current.sendReady()
      guestResult.current.selectMysteryCharacter('marco')
      guestResult.current.sendReady()
    })

    expect(hostResult.current.coinFlipVisible).toBe(true)
    expect(guestResult.current.coinFlipVisible).toBe(true)
    expect(transport.hostSend).toHaveBeenCalledWith({
      type: 'coin-flip',
      result: 'guest',
    })
    expect(transport.hostSend).not.toHaveBeenCalledWith({
      type: 'game-start',
      firstPlayer: 'guest',
    })

    await act(async () => {
      vi.advanceTimersByTime(50)
    })

    expect(hostResult.current.phase).toBe('playing')
    expect(guestResult.current.phase).toBe('playing')

    expect(transport.hostSend).toHaveBeenCalledWith({
      type: 'game-start',
      firstPlayer: 'guest',
    })
    expect(hostResult.current.gameState.currentPlayer).toBe('guest')
    expect(guestResult.current.gameState.currentPlayer).toBe('guest')
    expect(hostResult.current.coinFlipVisible).toBe(false)
  })

  it('shows setup disconnect error when opponent leaves during setup', () => {
    const transport = createMockTransport()
    const { result, rerender } = renderHook(
      ({ connectionState }: { connectionState: ConnectionState }) =>
        useGameSession({
          isHost: true,
          connectionState,
          send: transport.hostSend,
          onMessage: transport.hostOnMessage,
        }),
      { initialProps: { connectionState: 'connected' as ConnectionState } },
    )

    act(() => {
      result.current.selectMysteryCharacter('eleni')
    })

    rerender({ connectionState: 'disconnected' })

    expect(result.current.sessionError).toBe(
      'Opponent disconnected during game setup.',
    )
  })
})

describe('setup sync reducers', () => {
  it('firstPlayer in game-start must match coin-flip result', () => {
    let state = createGame()
    state = unwrapState(selectMystery(state, 'host', 'eleni'))
    state = unwrapState(markPlayerReady(state, 'host'))
    state = unwrapState(applyRemoteReady(state, 'guest'))
    state = unwrapState(applyCoinFlip(state, 'guest'))
    const mismatch = beginPlaying(state, 'host')
    expect(mismatch.ok).toBe(false)

    state = unwrapState(beginPlaying(state, 'guest'))
    expect(state.currentPlayer).toBe('guest')
    expect(state.coinFlipResult).toBe('guest')
  })
})
