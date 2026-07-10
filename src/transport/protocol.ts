export type P2PMessage =
  | { type: 'chat'; id: string; text: string; sentAt: number }
  | { type: 'ready' }
  | { type: 'coin-flip'; result: 'host' | 'guest' }
  | { type: 'game-start'; firstPlayer: 'host' | 'guest' }
  | { type: 'question'; id: string; text: string }
  | { type: 'answer'; questionId: string; value: 'yes' | 'no' }
  | { type: 'guess'; characterId: string }
  | { type: 'guess-result'; correct: boolean }
  | {
      type: 'game-over'
      winner: 'host' | 'guest'
      reason: 'correct-guess' | 'wrong-guess'
    }
  | { type: 'rematch' }

export function serializeP2PMessage(message: P2PMessage): string {
  return JSON.stringify(message)
}

export function deserializeP2PMessage(raw: string): P2PMessage | null {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isRecord(parsed) || typeof parsed.type !== 'string') {
    return null
  }

  switch (parsed.type) {
    case 'chat':
      return isChatMessage(parsed) ? parsed : null
    case 'ready':
      return { type: 'ready' }
    case 'coin-flip':
      return parsed.result === 'host' || parsed.result === 'guest'
        ? { type: 'coin-flip', result: parsed.result }
        : null
    case 'game-start':
      return parsed.firstPlayer === 'host' || parsed.firstPlayer === 'guest'
        ? { type: 'game-start', firstPlayer: parsed.firstPlayer }
        : null
    case 'question':
      return typeof parsed.id === 'string' && typeof parsed.text === 'string'
        ? { type: 'question', id: parsed.id, text: parsed.text }
        : null
    case 'answer':
      return typeof parsed.questionId === 'string' &&
        (parsed.value === 'yes' || parsed.value === 'no')
        ? {
            type: 'answer',
            questionId: parsed.questionId,
            value: parsed.value,
          }
        : null
    case 'guess':
      return typeof parsed.characterId === 'string'
        ? { type: 'guess', characterId: parsed.characterId }
        : null
    case 'guess-result':
      return typeof parsed.correct === 'boolean'
        ? { type: 'guess-result', correct: parsed.correct }
        : null
    case 'game-over':
      return (parsed.winner === 'host' || parsed.winner === 'guest') &&
        (parsed.reason === 'correct-guess' || parsed.reason === 'wrong-guess')
        ? {
            type: 'game-over',
            winner: parsed.winner,
            reason: parsed.reason,
          }
        : null
    case 'rematch':
      return { type: 'rematch' }
    default:
      return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChatMessage(
  value: Record<string, unknown>,
): value is Extract<P2PMessage, { type: 'chat' }> {
  return (
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.sentAt === 'number'
  )
}
