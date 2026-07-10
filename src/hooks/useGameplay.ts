import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  answerQuestion,
  applyGameOver,
  applyRemoteAnswer,
  applyRemoteQuestion,
  askQuestion,
  flipBoardTile,
  resolveGuess,
  validateGuessRequest,
  type GameState,
  type PlayerRole,
  type YesNo,
} from '../domain/game'
import type { P2PMessage } from '../transport/protocol'

export type GameplayMode = 'idle' | 'guess'

export type GameplayView = {
  gameplayMode: GameplayMode
  isMyTurn: boolean
  canAsk: boolean
  canAnswer: boolean
  canGuess: boolean
  pendingQuestionText: string | null
  selectedGuessId: string | null
  gameOverVisible: boolean
  winnerLabel: string | null
  isWinner: boolean
  submitQuestion: (text: string) => void
  submitAnswer: (value: YesNo) => void
  submitGuess: (characterId: string) => void
  flipTile: (characterId: string) => void
  enterGuessMode: () => void
  exitGuessMode: () => void
  selectGuessCharacter: (characterId: string) => void
  playAgain: () => void
}

type UseGameplayOptions = {
  gameState: GameState
  localRole: PlayerRole
  setGameState: Dispatch<SetStateAction<GameState>>
  send: (message: P2PMessage) => void
  recordQuestion?: (text: string, questionId: string) => void
  recordAnswer?: (value: YesNo, questionId: string) => void
}

function opponentRole(role: PlayerRole): PlayerRole {
  return role === 'host' ? 'guest' : 'host'
}

function roleLabel(role: PlayerRole): string {
  return role === 'host' ? 'Host' : 'Guest'
}

export function getWinnerLabel(
  gameState: GameState,
  localRole: PlayerRole,
): string | null {
  if (gameState.phase !== 'finished' || gameState.winner === null) {
    return null
  }

  if (gameState.winner === localRole) {
    return 'You win!'
  }

  return `${roleLabel(gameState.winner)} wins`
}

export function handleGameplayMessage(
  message: P2PMessage,
  localRole: PlayerRole,
  current: GameState,
  send: (message: P2PMessage) => void,
): GameState {
  const opponent = opponentRole(localRole)

  if (message.type === 'question') {
    const result = applyRemoteQuestion(
      current,
      message.id,
      message.text,
      opponent,
    )
    return result.ok ? result.value : current
  }

  if (message.type === 'answer') {
    const result = applyRemoteAnswer(current, message.questionId, opponent)
    return result.ok ? result.value : current
  }

  if (message.type === 'guess') {
    const result = resolveGuess(current, opponent, message.characterId)
    if (!result.ok) {
      return current
    }

    const finished = result.value
    if (finished.winner !== null && finished.gameOverReason !== null) {
      send({
        type: 'guess-result',
        correct: finished.gameOverReason === 'correct-guess',
      })
      send({
        type: 'game-over',
        winner: finished.winner,
        reason: finished.gameOverReason,
      })
    }

    return finished
  }

  if (message.type === 'game-over') {
    const result = applyGameOver(current, message.winner, message.reason)
    return result.ok ? result.value : current
  }

  return current
}

export function useGameplay({
  gameState,
  localRole,
  setGameState,
  send,
  recordQuestion,
  recordAnswer,
}: UseGameplayOptions): GameplayView {
  const [gameplayMode, setGameplayMode] = useState<GameplayMode>('idle')
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null)

  const isPlaying = gameState.phase === 'playing'
  const isMyTurn = isPlaying && gameState.currentPlayer === localRole
  const pending = gameState.pendingQuestion
  const isAnswerer =
    pending !== null && pending.askedBy !== localRole && isPlaying

  const canTakeTurn = isMyTurn && pending === null
  const canAsk = canTakeTurn && gameplayMode === 'idle'
  const canGuess = canTakeTurn && gameplayMode === 'idle'
  const canAnswer = isAnswerer

  const submitQuestion = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      const result = askQuestion(gameState, localRole, trimmed)
      if (!result.ok) {
        return
      }

      const next = result.value
      const questionId = next.pendingQuestion?.id
      setGameState(next)
      setGameplayMode('idle')
      setSelectedGuessId(null)

      if (questionId !== undefined) {
        send({ type: 'question', id: questionId, text: trimmed })
        recordQuestion?.(trimmed, questionId)
      }
    },
    [gameState, localRole, recordQuestion, send, setGameState],
  )

  const submitAnswer = useCallback(
    (value: YesNo) => {
      const result = answerQuestion(gameState, localRole, value)
      if (!result.ok) {
        return
      }

      const questionId = gameState.pendingQuestion?.id
      setGameState(result.value)

      if (questionId !== undefined) {
        send({ type: 'answer', questionId, value })
        recordAnswer?.(value, questionId)
      }
    },
    [gameState, localRole, recordAnswer, send, setGameState],
  )

  const submitGuess = useCallback(
    (characterId: string) => {
      setGameState((current) => {
        const result = validateGuessRequest(current, localRole, characterId)
        if (!result.ok) {
          return current
        }

        send({ type: 'guess', characterId })
        return current
      })
      setGameplayMode('idle')
      setSelectedGuessId(null)
    },
    [localRole, send, setGameState],
  )

  const flipTile = useCallback(
    (characterId: string) => {
      setGameState((current) => {
        const result = flipBoardTile(current, localRole, characterId)
        return result.ok ? result.value : current
      })
    },
    [localRole, setGameState],
  )

  const enterGuessMode = useCallback(() => {
    if (!canTakeTurn) {
      return
    }
    setGameplayMode('guess')
    setSelectedGuessId(null)
  }, [canTakeTurn])

  const exitGuessMode = useCallback(() => {
    setGameplayMode('idle')
    setSelectedGuessId(null)
  }, [])

  const selectGuessCharacter = useCallback((characterId: string) => {
    setSelectedGuessId(characterId)
  }, [])

  const playAgain = useCallback(() => {
    window.location.href = '/'
  }, [])

  const gameOverVisible =
    gameState.phase === 'finished' && gameState.winner !== null

  return {
    gameplayMode,
    isMyTurn,
    canAsk,
    canAnswer,
    canGuess,
    pendingQuestionText: pending?.text ?? null,
    selectedGuessId,
    gameOverVisible,
    winnerLabel: getWinnerLabel(gameState, localRole),
    isWinner: gameState.winner === localRole,
    submitQuestion,
    submitAnswer,
    submitGuess,
    flipTile,
    enterGuessMode,
    exitGuessMode,
    selectGuessCharacter,
    playAgain,
  }
}
