import type { TileState } from '../boardState'

export type PlayerRole = 'host' | 'guest'

export type GamePhase = 'setup' | 'playing' | 'finished'

export type YesNo = 'yes' | 'no'

export type GameOverReason = 'correct-guess' | 'wrong-guess'

export interface PlayerState {
  role: PlayerRole
  mysteryCharacterId: string | null
  boardFlips: Record<string, TileState>
}

export interface PendingQuestion {
  id: string
  text: string
  askedBy: PlayerRole
}

export interface GameState {
  phase: GamePhase
  players: Record<PlayerRole, PlayerState>
  currentPlayer: PlayerRole | null
  pendingQuestion: PendingQuestion | null
  winner: PlayerRole | null
  gameOverReason: GameOverReason | null
  ready: Record<PlayerRole, boolean>
  coinFlipResult: PlayerRole | null
}

export type GameError =
  | 'wrong-phase'
  | 'not-your-turn'
  | 'pending-question'
  | 'no-pending-question'
  | 'invalid-character'
  | 'invalid-answer'
  | 'unparseable-question'
  | 'mystery-not-selected'
  | 'not-all-ready'
  | 'not-ready'
  | 'already-ready'
  | 'coin-flip-mismatch'
  | 'coin-flip-pending'
  | 'empty-question'
  | 'game-finished'
