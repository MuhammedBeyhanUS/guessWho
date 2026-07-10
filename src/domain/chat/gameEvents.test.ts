import { describe, expect, it } from 'vitest'
import {
  createGameLogMessage,
  formatOpponentAnswered,
  formatOpponentAsked,
  formatYouAnswered,
  formatYouAsked,
} from './gameEvents'

describe('gameEvents', () => {
  it('formats question and answer lines for both players', () => {
    expect(formatYouAsked('Does your person wear glasses?')).toBe(
      'You asked: "Does your person wear glasses?"',
    )
    expect(formatOpponentAsked('Is your person bald?')).toBe(
      'Opponent asked: "Is your person bald?"',
    )
    expect(formatYouAnswered('yes')).toBe('You answered: Yes')
    expect(formatYouAnswered('no')).toBe('You answered: No')
    expect(formatOpponentAnswered('yes')).toBe('Opponent answered: Yes')
    expect(formatOpponentAnswered('no')).toBe('Opponent answered: No')
  })

  it('creates system game log messages', () => {
    expect(createGameLogMessage('You answered: Yes', 'log-1', 42)).toEqual({
      id: 'log-1',
      text: 'You answered: Yes',
      sentAt: 42,
      sender: 'system',
      kind: 'game',
    })
  })
})
