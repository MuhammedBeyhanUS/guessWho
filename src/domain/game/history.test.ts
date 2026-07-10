import { describe, expect, it } from 'vitest'
import {
  appendHistoryEntry,
  createAnswerEntry,
  createQuestionEntry,
  hasAnswerForQuestion,
  hasQuestionForId,
} from './history'

describe('game history', () => {
  it('creates question and answer entries with stable ids', () => {
    expect(
      createQuestionEntry('self', '  Does your person wear glasses? ', 'q-1'),
    ).toEqual({
      id: 'history-question-q-1',
      type: 'question',
      actor: 'self',
      text: 'Does your person wear glasses?',
      sentAt: expect.any(Number),
    })

    expect(createAnswerEntry('opponent', 'yes', 'q-1', 42)).toEqual({
      id: 'history-answer-q-1-opponent',
      type: 'answer',
      actor: 'opponent',
      value: 'yes',
      questionId: 'q-1',
      sentAt: 42,
    })
  })

  it('deduplicates entries by id', () => {
    const first = createQuestionEntry('self', 'Is your person bald?', 'q-2')
    const duplicate = createQuestionEntry('self', 'Is your person bald?', 'q-2')

    expect(appendHistoryEntry([first], duplicate)).toEqual([first])
  })

  it('detects existing question and answer entries by question id', () => {
    const entries = [
      createQuestionEntry('self', 'Glasses?', 'q-3'),
      createAnswerEntry('opponent', 'yes', 'q-3'),
    ]

    expect(hasQuestionForId(entries, 'q-3')).toBe(true)
    expect(hasQuestionForId(entries, 'q-4')).toBe(false)
    expect(hasAnswerForQuestion(entries, 'q-3')).toBe(true)
    expect(hasAnswerForQuestion(entries, 'q-4')).toBe(false)
  })
})
