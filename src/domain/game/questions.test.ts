import { describe, expect, it } from 'vitest'
import {
  answerFromMystery,
  deriveAnswer,
  parseQuestion,
  suggestEliminations,
} from './questions'

describe('parseQuestion', () => {
  it('parses boolean trait questions', () => {
    expect(parseQuestion('Does your person wear glasses?')).toEqual({
      kind: 'boolean',
      trait: 'glasses',
    })
    expect(parseQuestion('Is your character wearing a hat?')).toEqual({
      kind: 'boolean',
      trait: 'hat',
    })
    expect(parseQuestion('Does your person have facial hair?')).toEqual({
      kind: 'boolean',
      trait: 'facialHair',
    })
  })

  it('parses hair color questions', () => {
    expect(parseQuestion('Does your person have blonde hair?')).toEqual({
      kind: 'hairColor',
      value: 'blonde',
    })
    expect(parseQuestion('Is your character bald?')).toEqual({
      kind: 'hairColor',
      value: 'bald',
    })
  })

  it('parses gender presentation questions', () => {
    expect(parseQuestion('Is your person a woman?')).toEqual({
      kind: 'gender',
      value: 'feminine',
    })
    expect(parseQuestion('Does your character look masculine?')).toEqual({
      kind: 'gender',
      value: 'masculine',
    })
  })

  it('returns null for unparseable questions', () => {
    expect(parseQuestion('Are they happy?')).toBeNull()
    expect(parseQuestion('   ')).toBeNull()
  })
})

describe('deriveAnswer', () => {
  it('derives yes/no from mystery traits', () => {
    expect(deriveAnswer('Does your person wear glasses?', 'marco')).toBe('yes')
    expect(deriveAnswer('Does your person wear glasses?', 'eleni')).toBe('no')
    expect(deriveAnswer('Does your person have blonde hair?', 'theo')).toBe(
      'yes',
    )
    expect(deriveAnswer('Is your person bald?', 'sam')).toBe('yes')
  })
})

describe('answerFromMystery', () => {
  it('answers parsed boolean traits', () => {
    const parsed = parseQuestion('Does your person wear glasses?')
    expect(parsed).not.toBeNull()
    if (parsed !== null) {
      expect(answerFromMystery(parsed, 'fatima')).toBe('yes')
      expect(answerFromMystery(parsed, 'priya')).toBe('no')
    }
  })
})

describe('suggestEliminations', () => {
  it('suggests characters without glasses when answer is yes', () => {
    const suggestions = suggestEliminations(
      'Does your person wear glasses?',
      'yes',
    )
    expect(suggestions).toContain('eleni')
    expect(suggestions).not.toContain('marco')
  })

  it('suggests characters with glasses when answer is no', () => {
    const suggestions = suggestEliminations(
      'Does your person wear glasses?',
      'no',
    )
    expect(suggestions).toContain('marco')
    expect(suggestions).not.toContain('eleni')
  })

  it('returns empty list for unparseable questions', () => {
    expect(suggestEliminations('Are they tall?', 'yes')).toEqual([])
  })
})
