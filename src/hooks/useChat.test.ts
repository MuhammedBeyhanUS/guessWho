import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useChat } from './useChat'
import type { P2PMessage } from '../transport/protocol'
import type { ConnectionState } from '../transport/types'

describe('useChat', () => {
  it('appends incoming chat messages on the opponent side', () => {
    let messageHandler: ((message: P2PMessage) => void) | undefined

    const onMessage = vi.fn((handler: (message: P2PMessage) => void) => {
      messageHandler = handler
      return () => {}
    })

    const { result } = renderHook(() =>
      useChat({
        send: vi.fn(),
        onMessage,
        connectionState: 'connected',
      }),
    )

    act(() => {
      messageHandler?.({
        type: 'chat',
        id: 'remote-1',
        text: 'Are you ready?',
        sentAt: 100,
      })
    })

    expect(result.current.messages).toEqual([
      {
        id: 'remote-1',
        text: 'Are you ready?',
        sentAt: 100,
        sender: 'opponent',
        kind: 'chat',
      },
    ])
  })

  it('sends outgoing messages and adds them on the self side', () => {
    const send = vi.fn()

    const { result } = renderHook(() =>
      useChat({
        send,
        onMessage: vi.fn(() => () => {}),
        connectionState: 'connected',
      }),
    )

    act(() => {
      result.current.sendMessage('Hello!')
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chat',
        text: 'Hello!',
      }),
    )
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({
      text: 'Hello!',
      sender: 'self',
      kind: 'chat',
    })
  })

  it('clears chat history when disconnected', () => {
    const onMessage = vi.fn(() => () => {})
    const { result, rerender } = renderHook(
      ({ connectionState }: { connectionState: ConnectionState }) =>
        useChat({
          send: vi.fn(),
          onMessage,
          connectionState,
        }),
      { initialProps: { connectionState: 'connected' as ConnectionState } },
    )

    act(() => {
      result.current.sendMessage('Still here')
    })
    expect(result.current.messages).toHaveLength(1)

    rerender({ connectionState: 'disconnected' })
    expect(result.current.messages).toEqual([])
  })

  it('deduplicates resent messages by id', () => {
    let messageHandler: ((message: P2PMessage) => void) | undefined

    const onMessage = vi.fn((handler: (message: P2PMessage) => void) => {
      messageHandler = handler
      return () => {}
    })

    const { result } = renderHook(() =>
      useChat({
        send: vi.fn(),
        onMessage,
        connectionState: 'connected',
      }),
    )

    const incoming = {
      type: 'chat' as const,
      id: 'dup-1',
      text: 'Ping',
      sentAt: 1,
    }

    act(() => {
      messageHandler?.(incoming)
      messageHandler?.(incoming)
    })

    expect(result.current.messages).toHaveLength(1)
  })

  it('appends game log lines for opponent questions and answers', () => {
    let messageHandler: ((message: P2PMessage) => void) | undefined

    const onMessage = vi.fn((handler: (message: P2PMessage) => void) => {
      messageHandler = handler
      return () => {}
    })

    const { result } = renderHook(() =>
      useChat({
        send: vi.fn(),
        onMessage,
        connectionState: 'connected',
      }),
    )

    act(() => {
      messageHandler?.({
        type: 'question',
        id: 'q-1',
        text: 'Does your person wear glasses?',
      })
      messageHandler?.({
        type: 'answer',
        questionId: 'q-1',
        value: 'yes',
      })
    })

    expect(result.current.messages).toEqual([
      {
        id: 'game-question-q-1',
        text: 'Opponent asked: "Does your person wear glasses?"',
        sentAt: expect.any(Number),
        sender: 'system',
        kind: 'game',
      },
      {
        id: 'game-answer-q-1',
        text: 'Opponent answered: Yes',
        sentAt: expect.any(Number),
        sender: 'system',
        kind: 'game',
      },
    ])
  })

  it('appends local game log lines via appendGameLog', () => {
    const { result } = renderHook(() =>
      useChat({
        send: vi.fn(),
        onMessage: vi.fn(() => () => {}),
        connectionState: 'connected',
      }),
    )

    act(() => {
      result.current.appendGameLog('You answered: No', 'game-answer-local-q-2')
    })

    expect(result.current.messages).toEqual([
      {
        id: 'game-answer-local-q-2',
        text: 'You answered: No',
        sentAt: expect.any(Number),
        sender: 'system',
        kind: 'game',
      },
    ])
  })
})
