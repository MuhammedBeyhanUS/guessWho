import { describe, expect, it } from 'vitest'
import {
  deserializeP2PMessage,
  serializeP2PMessage,
  type P2PMessage,
} from './protocol'

const messages: P2PMessage[] = [
  { type: 'chat', id: 'chat-1', text: 'Hello!', sentAt: 1_700_000_000_000 },
  { type: 'ready' },
  { type: 'coin-flip', result: 'host' },
  { type: 'game-start', firstPlayer: 'guest' },
  { type: 'question', id: 'q-1', text: 'Does your person wear glasses?' },
  { type: 'answer', questionId: 'q-1', value: 'yes' },
  { type: 'guess', characterId: 'theo' },
  { type: 'guess-result', correct: false },
  {
    type: 'game-over',
    winner: 'guest',
    reason: 'correct-guess',
  },
  { type: 'rematch' },
]

describe('P2P protocol serialization', () => {
  it.each(messages)('round-trips message %#', (message) => {
    const serialized = serializeP2PMessage(message)
    expect(deserializeP2PMessage(serialized)).toEqual(message)
  })

  it('returns null for invalid JSON', () => {
    expect(deserializeP2PMessage('{not-json')).toBeNull()
  })

  it('returns null for unknown message types', () => {
    expect(
      deserializeP2PMessage(JSON.stringify({ type: 'unknown' })),
    ).toBeNull()
  })

  it('returns null for malformed chat messages', () => {
    expect(
      deserializeP2PMessage(
        JSON.stringify({ type: 'chat', id: '1', text: 'hi' }),
      ),
    ).toBeNull()
  })
})
