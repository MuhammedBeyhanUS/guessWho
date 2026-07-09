import { createInitialBoardState } from '../boardState'
import { CHARACTERS, getCharacterById } from '../characters'
import { deriveAnswer } from './questions'
import { err, ok, type Result } from './result'
import type {
  GameError,
  GameState,
  PendingQuestion,
  PlayerRole,
  YesNo,
} from './types'

const CHARACTER_IDS = CHARACTERS.map((character) => character.id)

function opponent(role: PlayerRole): PlayerRole {
  return role === 'host' ? 'guest' : 'host'
}

function createEmptyBoardFlips(): Record<string, 'open' | 'closed'> {
  return createInitialBoardState(CHARACTER_IDS).tiles
}

function createPlayerState(role: PlayerRole) {
  return {
    role,
    mysteryCharacterId: null,
    boardFlips: createEmptyBoardFlips(),
  }
}

export function createGame(): GameState {
  return {
    phase: 'setup',
    players: {
      host: createPlayerState('host'),
      guest: createPlayerState('guest'),
    },
    currentPlayer: null,
    pendingQuestion: null,
    winner: null,
    gameOverReason: null,
  }
}

export function selectMystery(
  state: GameState,
  role: PlayerRole,
  characterId: string,
): Result<GameState, GameError> {
  if (state.phase !== 'setup') {
    return err('wrong-phase')
  }

  if (getCharacterById(characterId) === undefined) {
    return err('invalid-character')
  }

  return ok({
    ...state,
    players: {
      ...state.players,
      [role]: {
        ...state.players[role],
        mysteryCharacterId: characterId,
      },
    },
  })
}

function bothMysteriesSelected(state: GameState): boolean {
  return (
    state.players.host.mysteryCharacterId !== null &&
    state.players.guest.mysteryCharacterId !== null
  )
}

export function startGame(
  state: GameState,
  firstPlayer: PlayerRole,
): Result<GameState, GameError> {
  if (state.phase !== 'setup') {
    return err('wrong-phase')
  }

  if (!bothMysteriesSelected(state)) {
    return err('not-all-ready')
  }

  return ok({
    ...state,
    phase: 'playing',
    currentPlayer: firstPlayer,
    pendingQuestion: null,
    winner: null,
    gameOverReason: null,
  })
}

function assertPlayingActor(
  state: GameState,
  role: PlayerRole,
): Result<GameState, GameError> | null {
  if (state.phase === 'finished') {
    return err('game-finished')
  }

  if (state.phase !== 'playing') {
    return err('wrong-phase')
  }

  if (state.currentPlayer !== role) {
    return err('not-your-turn')
  }

  if (state.pendingQuestion !== null) {
    return err('pending-question')
  }

  return null
}

let questionIdCounter = 0

function nextQuestionId(): string {
  questionIdCounter += 1
  return `question-${questionIdCounter}`
}

export function askQuestion(
  state: GameState,
  role: PlayerRole,
  text: string,
): Result<GameState, GameError> {
  const actorError = assertPlayingActor(state, role)
  if (actorError !== null) {
    return actorError
  }

  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return err('empty-question')
  }

  const pendingQuestion: PendingQuestion = {
    id: nextQuestionId(),
    text: trimmed,
    askedBy: role,
  }

  return ok({
    ...state,
    pendingQuestion,
  })
}

export function answerQuestion(
  state: GameState,
  role: PlayerRole,
  value: YesNo,
): Result<GameState, GameError> {
  if (state.phase === 'finished') {
    return err('game-finished')
  }

  if (state.phase !== 'playing') {
    return err('wrong-phase')
  }

  const pending = state.pendingQuestion
  if (pending === null) {
    return err('no-pending-question')
  }

  if (role === pending.askedBy) {
    return err('not-your-turn')
  }

  const mysteryId = state.players[role].mysteryCharacterId
  if (mysteryId === null) {
    return err('mystery-not-selected')
  }

  const expected = deriveAnswer(pending.text, mysteryId)
  if (expected === null) {
    return err('unparseable-question')
  }

  if (value !== expected) {
    return err('invalid-answer')
  }

  return ok({
    ...state,
    pendingQuestion: null,
    currentPlayer: role,
  })
}

export function guess(
  state: GameState,
  role: PlayerRole,
  characterId: string,
): Result<GameState, GameError> {
  const actorError = assertPlayingActor(state, role)
  if (actorError !== null) {
    return actorError
  }

  if (getCharacterById(characterId) === undefined) {
    return err('invalid-character')
  }

  const opponentRole = opponent(role)
  const opponentMystery = state.players[opponentRole].mysteryCharacterId
  if (opponentMystery === null) {
    return err('mystery-not-selected')
  }

  const correct = characterId === opponentMystery

  return ok({
    ...state,
    phase: 'finished',
    pendingQuestion: null,
    currentPlayer: null,
    winner: correct ? role : opponentRole,
    gameOverReason: correct ? 'correct-guess' : 'wrong-guess',
  })
}

export function flipBoardTile(
  state: GameState,
  role: PlayerRole,
  characterId: string,
): Result<GameState, GameError> {
  if (state.phase === 'finished') {
    return err('game-finished')
  }

  const current = state.players[role].boardFlips[characterId]
  if (current === undefined) {
    return err('invalid-character')
  }

  return ok({
    ...state,
    players: {
      ...state.players,
      [role]: {
        ...state.players[role],
        boardFlips: {
          ...state.players[role].boardFlips,
          [characterId]: current === 'open' ? 'closed' : 'open',
        },
      },
    },
  })
}

export function resetQuestionIdCounter(): void {
  questionIdCounter = 0
}
