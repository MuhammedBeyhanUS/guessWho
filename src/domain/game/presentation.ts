import type { GameState, PlayerRole } from './types'

export type GameOverPresentation = {
  title: string
  message: string
  revealedCharacterId: string | null
  isLocalWinner: boolean
}

function opponentRole(role: PlayerRole): PlayerRole {
  return role === 'host' ? 'guest' : 'host'
}

export function getGameOverPresentation(
  gameState: GameState,
  localRole: PlayerRole,
): GameOverPresentation | null {
  if (
    gameState.phase !== 'finished' ||
    gameState.winner === null ||
    gameState.gameOverReason === null
  ) {
    return null
  }

  const isLocalWinner = gameState.winner === localRole
  const opponent = opponentRole(localRole)
  const opponentMystery = gameState.players[opponent].mysteryCharacterId
  const localMystery = gameState.players[localRole].mysteryCharacterId

  if (gameState.gameOverReason === 'correct-guess') {
    if (isLocalWinner) {
      return {
        title: 'Correct guess!',
        message: 'Congratulations — you win!',
        revealedCharacterId: opponentMystery,
        isLocalWinner: true,
      }
    }

    return {
      title: 'Game over',
      message: 'Your opponent guessed correctly.',
      revealedCharacterId: localMystery,
      isLocalWinner: false,
    }
  }

  if (isLocalWinner) {
    return {
      title: 'Wrong guess!',
      message: 'Your opponent guessed incorrectly. You win!',
      revealedCharacterId: localMystery,
      isLocalWinner: true,
    }
  }

  return {
    title: 'Wrong guess',
    message: 'The mystery person was actually:',
    revealedCharacterId: opponentMystery,
    isLocalWinner: false,
  }
}
