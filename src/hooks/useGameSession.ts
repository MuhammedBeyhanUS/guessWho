import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyCoinFlip,
  applyRemoteReady,
  beginPlaying,
  createGame,
  markPlayerReady,
  selectMystery,
  type GameState,
  type PlayerRole,
} from '../domain/game'
import {
  handleGameplayMessage,
  useGameplay,
  type GameplayView,
} from './useGameplay'
import type { P2PMessage } from '../transport/protocol'
import type { ConnectionState } from '../transport/types'
import type { YesNo } from '../domain/game/types'

export const COIN_FLIP_ANIMATION_MS = 1500

type UseGameSessionOptions = {
  isHost: boolean
  connectionState: ConnectionState
  send: (message: P2PMessage) => void
  onMessage: (handler: (message: P2PMessage) => void) => () => void
  recordQuestion?: (text: string, questionId: string) => void
  recordAnswer?: (value: YesNo, questionId: string) => void
  coinFlipDelayMs?: number
  randomCoinFlip?: () => PlayerRole
}

export type GameSessionView = {
  gameState: GameState
  localRole: PlayerRole
  phase: GameState['phase']
  selectionMode: boolean
  canSendReady: boolean
  isLocalReady: boolean
  isOpponentReady: boolean
  statusText: string
  coinFlipVisible: boolean
  coinFlipResult: PlayerRole | null
  boardKey: string
  sessionError: string | null
  selectMysteryCharacter: (characterId: string) => void
  sendReady: () => void
} & GameplayView

function opponentRole(role: PlayerRole): PlayerRole {
  return role === 'host' ? 'guest' : 'host'
}

function defaultRandomCoinFlip(): PlayerRole {
  return Math.random() < 0.5 ? 'host' : 'guest'
}

export function getGameStatusText(
  gameState: GameState,
  localRole: PlayerRole,
  coinFlipVisible: boolean,
): string {
  if (gameState.phase === 'playing') {
    if (gameState.pendingQuestion !== null) {
      if (gameState.pendingQuestion.askedBy === localRole) {
        return 'Waiting for answer…'
      }
      return 'Answer the question'
    }

    const turnLabel =
      gameState.currentPlayer === localRole ? 'Your' : "Opponent's"
    return `${turnLabel} turn`
  }

  if (gameState.phase === 'finished') {
    return 'Game over'
  }

  if (coinFlipVisible) {
    return 'Flipping coin…'
  }

  const localReady = gameState.ready[localRole]
  const opponentReady = gameState.ready[opponentRole(localRole)]
  const mysterySelected =
    gameState.players[localRole].mysteryCharacterId !== null

  if (!mysterySelected) {
    return 'Choose your mystery person'
  }

  if (!localReady) {
    return 'Tap Ready when you have chosen'
  }

  if (!opponentReady) {
    return 'Waiting for opponent to get ready…'
  }

  return 'Both players ready — starting soon…'
}

export function useGameSession({
  isHost,
  connectionState,
  send,
  onMessage,
  recordQuestion,
  recordAnswer,
  coinFlipDelayMs = COIN_FLIP_ANIMATION_MS,
  randomCoinFlip = defaultRandomCoinFlip,
}: UseGameSessionOptions): GameSessionView {
  const localRole: PlayerRole = isHost ? 'host' : 'guest'
  const [gameState, setGameState] = useState<GameState>(() => createGame())
  const [coinFlipVisible, setCoinFlipVisible] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [boardKey, setBoardKey] = useState('setup-0')
  const coinFlipSentRef = useRef(false)
  const wasConnectedRef = useRef(false)
  const onMessageRef = useRef(onMessage)
  const sendRef = useRef(send)

  useEffect(() => {
    onMessageRef.current = onMessage
    sendRef.current = send
  }, [onMessage, send])

  useEffect(() => {
    if (connectionState === 'connected') {
      wasConnectedRef.current = true
      setSessionError(null)
      return
    }

    if (
      wasConnectedRef.current &&
      gameState.phase === 'setup' &&
      (connectionState === 'disconnected' || connectionState === 'failed')
    ) {
      setSessionError('Opponent disconnected during game setup.')
    }
  }, [connectionState, gameState.phase])

  useEffect(() => {
    if (connectionState !== 'connected') {
      setGameState(createGame())
      setCoinFlipVisible(false)
      coinFlipSentRef.current = false
      setBoardKey('setup-0')
      return
    }

    const unsubscribe = onMessageRef.current((message) => {
      if (message.type === 'ready') {
        setGameState((current) => {
          const result = applyRemoteReady(current, opponentRole(localRole))
          return result.ok ? result.value : current
        })
        return
      }

      if (message.type === 'coin-flip') {
        setGameState((current) => {
          const result = applyCoinFlip(current, message.result)
          return result.ok ? result.value : current
        })
        setCoinFlipVisible(true)
        return
      }

      if (message.type === 'game-start') {
        setGameState((current) => {
          const result = beginPlaying(current, message.firstPlayer)
          return result.ok ? result.value : current
        })
        setCoinFlipVisible(false)
        setBoardKey(`playing-${message.firstPlayer}`)
        return
      }

      setGameState((current) =>
        handleGameplayMessage(message, localRole, current, sendRef.current),
      )
    })

    return unsubscribe
  }, [connectionState, localRole])

  useEffect(() => {
    if (!isHost || connectionState !== 'connected') {
      return
    }

    if (
      gameState.phase !== 'setup' ||
      !gameState.ready.host ||
      !gameState.ready.guest ||
      gameState.coinFlipResult !== null
    ) {
      return
    }

    if (coinFlipSentRef.current) {
      return
    }

    coinFlipSentRef.current = true
    const result = randomCoinFlip()
    const flipResult = applyCoinFlip(gameState, result)
    if (!flipResult.ok) {
      coinFlipSentRef.current = false
      return
    }

    setGameState(flipResult.value)
    setCoinFlipVisible(true)
    sendRef.current({ type: 'coin-flip', result })
  }, [isHost, connectionState, gameState, randomCoinFlip])

  useEffect(() => {
    if (!isHost || connectionState !== 'connected') {
      return
    }

    if (gameState.phase !== 'setup' || gameState.coinFlipResult === null) {
      return
    }

    const firstPlayer = gameState.coinFlipResult

    const timer = window.setTimeout(() => {
      sendRef.current({ type: 'game-start', firstPlayer })
      setGameState((current) => {
        const startResult = beginPlaying(current, firstPlayer)
        return startResult.ok ? startResult.value : current
      })
      setCoinFlipVisible(false)
      setBoardKey(`playing-${firstPlayer}`)
    }, coinFlipDelayMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    isHost,
    connectionState,
    gameState.phase,
    gameState.coinFlipResult,
    coinFlipDelayMs,
  ])

  const selectMysteryCharacter = useCallback(
    (characterId: string) => {
      setGameState((current) => {
        const result = selectMystery(current, localRole, characterId)
        return result.ok ? result.value : current
      })
    },
    [localRole],
  )

  const sendReady = useCallback(() => {
    setGameState((current) => {
      const result = markPlayerReady(current, localRole)
      if (!result.ok) {
        return current
      }

      sendRef.current({ type: 'ready' })
      return result.value
    })
  }, [localRole])

  const opponent = opponentRole(localRole)

  const gameplay = useGameplay({
    gameState,
    localRole,
    setGameState,
    send,
    recordQuestion,
    recordAnswer,
  })

  return {
    gameState,
    localRole,
    phase: gameState.phase,
    selectionMode: gameState.phase === 'setup',
    canSendReady:
      connectionState === 'connected' &&
      gameState.phase === 'setup' &&
      gameState.players[localRole].mysteryCharacterId !== null &&
      !gameState.ready[localRole],
    isLocalReady: gameState.ready[localRole],
    isOpponentReady: gameState.ready[opponent],
    statusText: getGameStatusText(gameState, localRole, coinFlipVisible),
    coinFlipVisible,
    coinFlipResult: gameState.coinFlipResult,
    boardKey,
    sessionError,
    selectMysteryCharacter,
    sendReady,
    ...gameplay,
  }
}
