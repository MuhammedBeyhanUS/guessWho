import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import QuestionHistoryPanel from './QuestionHistoryPanel'
import type { GameHistoryEntry } from '../domain/game/history'

const entries: GameHistoryEntry[] = [
  {
    id: 'history-question-q-1',
    type: 'question',
    actor: 'self',
    text: 'Does your person wear glasses?',
    sentAt: 1,
  },
  {
    id: 'history-answer-q-1-opponent',
    type: 'answer',
    actor: 'opponent',
    value: 'yes',
    questionId: 'q-1',
    sentAt: 2,
  },
]

describe('QuestionHistoryPanel', () => {
  it('renders empty state when there is no history', () => {
    render(<QuestionHistoryPanel entries={[]} />)

    expect(
      screen.getByText(/questions and answers will appear here/i),
    ).toBeInTheDocument()
  })

  it('renders question and answer entries with actor labels', () => {
    render(<QuestionHistoryPanel entries={entries} />)

    expect(screen.getByText('You asked')).toBeInTheDocument()
    expect(
      screen.getByText('“Does your person wear glasses?”'),
    ).toBeInTheDocument()
    expect(screen.getByText('Opponent answered')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })
})
