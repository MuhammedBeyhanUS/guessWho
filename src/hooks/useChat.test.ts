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
    })
  })

  it('clears chat history when disconnected', () => {
    const onMessage = vi.fn(() => () => {})
    const { result, rerender } = renderHook(
      ({
        connectionState,
      }: {
        connectionState: ConnectionState
      }) =>
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
})
