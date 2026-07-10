import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useQuestionHistory } from './useQuestionHistory'
import type { P2PMessage } from '../transport/protocol'
import type { ConnectionState } from '../transport/types'

describe('useQuestionHistory', () => {
  it('records opponent questions and answers from P2P messages', () => {
    let messageHandler: ((message: P2PMessage) => void) | undefined

    const onMessage = vi.fn((handler: (message: P2PMessage) => void) => {
      messageHandler = handler
      return () => {}
    })

    const { result } = renderHook(() =>
      useQuestionHistory({
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

    expect(result.current.entries).toEqual([
      {
        id: 'history-question-q-1',
        type: 'question',
        actor: 'opponent',
        text: 'Does your person wear glasses?',
        sentAt: expect.any(Number),
      },
      {
        id: 'history-answer-q-1-opponent',
        type: 'answer',
        actor: 'opponent',
        value: 'yes',
        questionId: 'q-1',
        sentAt: expect.any(Number),
      },
    ])
  })

  it('records local question and answer once via record helpers', () => {
    const { result } = renderHook(() =>
      useQuestionHistory({
        onMessage: vi.fn(() => () => {}),
        connectionState: 'connected',
      }),
    )

    act(() => {
      result.current.recordQuestion('Is your person bald?', 'q-2')
      result.current.recordAnswer('no', 'q-2')
    })

    expect(result.current.entries).toHaveLength(2)
    expect(result.current.entries[0]).toMatchObject({
      type: 'question',
      actor: 'self',
      text: 'Is your person bald?',
    })
    expect(result.current.entries[1]).toMatchObject({
      type: 'answer',
      actor: 'self',
      value: 'no',
      questionId: 'q-2',
    })
  })

  it('clears history when disconnected', () => {
    const { result, rerender } = renderHook(
      ({ connectionState }: { connectionState: ConnectionState }) =>
        useQuestionHistory({
          onMessage: vi.fn(() => () => {}),
          connectionState,
        }),
      { initialProps: { connectionState: 'connected' as ConnectionState } },
    )

    act(() => {
      result.current.recordQuestion('Hello?', 'q-3')
    })
    expect(result.current.entries).toHaveLength(1)

    rerender({ connectionState: 'disconnected' })
    expect(result.current.entries).toEqual([])
  })
})
