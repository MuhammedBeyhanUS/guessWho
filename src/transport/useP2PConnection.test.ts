import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useP2PConnection } from './useP2PConnection'
import type { ConnectionState, P2PConnection } from './types'
import type { P2PMessage } from './protocol'

function createMockConnection(initialState: ConnectionState = 'disconnected') {
  let state = initialState
  let connectionHandler: ((message: P2PMessage) => void) | undefined
  const stateHandlers = new Set<(state: ConnectionState) => void>()

  const connection: P2PConnection = {
    connectAsHost: vi.fn(async () => {
      state = 'connected'
      for (const handler of stateHandlers) {
        handler('connected')
      }
    }),
    connectAsGuest: vi.fn(async () => {
      state = 'connected'
      for (const handler of stateHandlers) {
        handler('connected')
      }
    }),
    send: vi.fn((message: P2PMessage) => {
      connectionHandler?.(message)
    }),
    onMessage: vi.fn((handler) => {
      connectionHandler = handler
      return () => {
        connectionHandler = undefined
      }
    }),
    onConnectionStateChange: vi.fn((handler) => {
      stateHandlers.add(handler)
      handler(state)
      return () => {
        stateHandlers.delete(handler)
      }
    }),
    getConnectionState: () => state,
    close: vi.fn(() => {
      state = 'disconnected'
    }),
    getVoicePermission: () => 'granted',
    isMuted: () => false,
    setMuted: vi.fn(),
    onRemoteStream: vi.fn(() => () => {}),
    onVoicePermissionChange: vi.fn(() => () => {}),
  }

  return connection
}

describe('useP2PConnection', () => {
  it('delivers messages to handlers registered before connect completes', async () => {
    const connection = createMockConnection()
    const received: P2PMessage[] = []

    const { result } = renderHook(() =>
      useP2PConnection({
        roomCode: 'ABC234',
        isHost: true,
        connectionFactory: () => connection,
      }),
    )

    act(() => {
      result.current.onMessage((message) => {
        received.push(message)
      })
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      connection.send({
        type: 'question',
        id: 'q-1',
        text: 'Does your person wear glasses?',
      })
    })

    expect(received).toEqual([
      {
        type: 'question',
        id: 'q-1',
        text: 'Does your person wear glasses?',
      },
    ])
  })

  it('fans out messages to multiple subscribers', async () => {
    const connection = createMockConnection()
    const gameMessages: P2PMessage[] = []
    const chatMessages: P2PMessage[] = []

    const { result } = renderHook(() =>
      useP2PConnection({
        roomCode: 'ABC234',
        isHost: false,
        connectionFactory: () => connection,
      }),
    )

    act(() => {
      result.current.onMessage((message) => {
        if (message.type === 'question') {
          gameMessages.push(message)
        }
      })
      result.current.onMessage((message) => {
        if (message.type === 'chat') {
          chatMessages.push(message)
        }
      })
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      connection.send({
        type: 'question',
        id: 'q-2',
        text: 'Is your person bald?',
      })
      connection.send({
        type: 'chat',
        id: 'chat-1',
        text: 'Hello',
        sentAt: 1,
      })
    })

    expect(gameMessages).toHaveLength(1)
    expect(chatMessages).toHaveLength(1)
  })

  it('swallows send failures instead of breaking gameplay handlers', () => {
    const connection = createMockConnection('connected')
    connection.send = vi.fn(() => {
      throw new Error('Data channel is not open')
    })

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() =>
      useP2PConnection({
        roomCode: 'ABC234',
        isHost: true,
        connectionFactory: () => connection,
      }),
    )

    expect(() => {
      act(() => {
        result.current.send({
          type: 'question',
          id: 'q-3',
          text: 'Test?',
        })
      })
    }).not.toThrow()

    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
