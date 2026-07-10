import type { YesNo } from './types'

export type GameHistoryActor = 'self' | 'opponent'

export type GameHistoryEntry =
  | {
      id: string
      type: 'question'
      actor: GameHistoryActor
      text: string
      sentAt: number
    }
  | {
      id: string
      type: 'answer'
      actor: GameHistoryActor
      value: YesNo
      questionId: string
      sentAt: number
    }

export function questionEntryId(questionId: string): string {
  return `history-question-${questionId}`
}

export function answerEntryId(
  questionId: string,
  actor: GameHistoryActor,
): string {
  return `history-answer-${questionId}-${actor}`
}

export function createQuestionEntry(
  actor: GameHistoryActor,
  text: string,
  questionId: string,
  sentAt = Date.now(),
): GameHistoryEntry {
  return {
    id: questionEntryId(questionId),
    type: 'question',
    actor,
    text: text.trim(),
    sentAt,
  }
}

export function createAnswerEntry(
  actor: GameHistoryActor,
  value: YesNo,
  questionId: string,
  sentAt = Date.now(),
): GameHistoryEntry {
  return {
    id: answerEntryId(questionId, actor),
    type: 'answer',
    actor,
    value,
    questionId,
    sentAt,
  }
}

export function appendHistoryEntry(
  entries: GameHistoryEntry[],
  entry: GameHistoryEntry,
): GameHistoryEntry[] {
  if (entries.some((existing) => existing.id === entry.id)) {
    return entries
  }

  return [...entries, entry]
}

export function hasQuestionForId(
  entries: GameHistoryEntry[],
  questionId: string,
): boolean {
  const id = questionEntryId(questionId)
  return entries.some((entry) => entry.type === 'question' && entry.id === id)
}

export function hasAnswerForQuestion(
  entries: GameHistoryEntry[],
  questionId: string,
): boolean {
  return entries.some(
    (entry) => entry.type === 'answer' && entry.questionId === questionId,
  )
}

export function actorLabel(actor: GameHistoryActor): string {
  return actor === 'self' ? 'You' : 'Opponent'
}
