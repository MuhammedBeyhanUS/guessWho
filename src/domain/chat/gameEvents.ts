import type { YesNo } from '../game/types'
import type { ChatDisplayMessage } from './types'

export function formatYouAsked(question: string): string {
  return `You asked: "${question.trim()}"`
}

export function formatOpponentAsked(question: string): string {
  return `Opponent asked: "${question.trim()}"`
}

export function formatYouAnswered(value: YesNo): string {
  return `You answered: ${value === 'yes' ? 'Yes' : 'No'}`
}

export function formatOpponentAnswered(value: YesNo): string {
  return `Opponent answered: ${value === 'yes' ? 'Yes' : 'No'}`
}

export function createGameLogMessage(
  text: string,
  id: string = crypto.randomUUID(),
  sentAt = Date.now(),
): ChatDisplayMessage {
  return {
    id,
    text,
    sentAt,
    sender: 'system',
    kind: 'game',
  }
}
