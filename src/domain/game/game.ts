import { createInitialBoardState } from '../boardState'
import { CHARACTERS, getCharacterById } from '../characters'
import { err, ok, type Result } from './result'
import type {
  GameError,
  GameOverReason,
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
    ready: { host: false, guest: false },
    coinFlipResult: null,
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

export function bothPlayersReady(state: GameState): boolean {
  return state.ready.host && state.ready.guest
}

export function markPlayerReady(
  state: GameState,
  role: PlayerRole,
): Result<GameState, GameError> {
  if (state.phase !== 'setup') {
    return err('wrong-phase')
  }

  if (state.ready[role]) {
    return err('already-ready')
  }

  if (state.players[role].mysteryCharacterId === null) {
    return err('mystery-not-selected')
  }

  return ok({
    ...state,
    ready: {
      ...state.ready,
      [role]: true,
    },
  })
}

export function applyRemoteReady(
  state: GameState,
  role: PlayerRole,
): Result<GameState, GameError> {
  if (state.phase !== 'setup') {
    return err('wrong-phase')
  }

  if (state.ready[role]) {
    return ok(state)
  }

  return ok({
    ...state,
    ready: {
      ...state.ready,
      [role]: true,
    },
  })
}

export function applyCoinFlip(
  state: GameState,
  result: PlayerRole,
): Result<GameState, GameError> {
  if (state.phase !== 'setup') {
    return err('wrong-phase')
  }

  if (!bothPlayersReady(state)) {
    return err('not-ready')
  }

  return ok({
    ...state,
    coinFlipResult: result,
  })
}

function resetBoardFlips(players: GameState['players']): GameState['players'] {
  return {
    host: {
      ...players.host,
      boardFlips: createEmptyBoardFlips(),
    },
    guest: {
      ...players.guest,
      boardFlips: createEmptyBoardFlips(),
    },
  }
}

export function beginPlaying(
  state: GameState,
  firstPlayer: PlayerRole,
): Result<GameState, GameError> {
  if (state.phase !== 'setup') {
    return err('wrong-phase')
  }

  if (!bothPlayersReady(state)) {
    return err('not-ready')
  }

  if (state.coinFlipResult === null) {
    return err('coin-flip-pending')
  }

  if (state.coinFlipResult !== firstPlayer) {
    return err('coin-flip-mismatch')
  }

  return ok({
    ...state,
    phase: 'playing',
    currentPlayer: firstPlayer,
    pendingQuestion: null,
    winner: null,
    gameOverReason: null,
    players: resetBoardFlips(state.players),
  })
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
  questionId?: string,
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
    id: questionId ?? nextQuestionId(),
    text: trimmed,
    askedBy: role,
  }

  return ok({
    ...state,
    pendingQuestion,
  })
}

export function applyRemoteQuestion(
  state: GameState,
  questionId: string,
  text: string,
  askedBy: PlayerRole,
): Result<GameState, GameError> {
  if (state.phase === 'finished') {
    return err('game-finished')
  }

  if (state.phase !== 'playing') {
    return err('wrong-phase')
  }

  if (state.pendingQuestion !== null) {
    return err('pending-question')
  }

  if (state.currentPlayer !== askedBy) {
    return err('not-your-turn')
  }

  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return err('empty-question')
  }

  return ok({
    ...state,
    pendingQuestion: {
      id: questionId,
      text: trimmed,
      askedBy,
    },
  })
}

export function answerQuestion(
  state: GameState,
  role: PlayerRole,
  _value: YesNo,
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

  // Trust-based answers like the physical game: any yes/no is accepted.
  // Trait parsing is only used for optional elimination suggestions, not validation.
  return ok({
    ...state,
    pendingQuestion: null,
    currentPlayer: role,
  })
}

export function applyRemoteAnswer(
  state: GameState,
  questionId: string,
  answeredBy: PlayerRole,
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

  if (pending.id !== questionId) {
    return err('no-pending-question')
  }

  if (answeredBy === pending.askedBy) {
    return err('not-your-turn')
  }

  return ok({
    ...state,
    pendingQuestion: null,
    currentPlayer: answeredBy,
  })
}

export function validateGuessRequest(
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

  return ok(state)
}

export function resolveGuess(
  state: GameState,
  guesserRole: PlayerRole,
  characterId: string,
): Result<GameState, GameError> {
  if (state.phase === 'finished') {
    return err('game-finished')
  }

  if (state.phase !== 'playing') {
    return err('wrong-phase')
  }

  if (state.currentPlayer !== guesserRole) {
    return err('not-your-turn')
  }

  if (state.pendingQuestion !== null) {
    return err('pending-question')
  }

  if (getCharacterById(characterId) === undefined) {
    return err('invalid-character')
  }

  const answererRole = opponent(guesserRole)
  const mysteryId = state.players[answererRole].mysteryCharacterId
  if (mysteryId === null) {
    return err('mystery-not-selected')
  }

  const correct = characterId === mysteryId

  return ok({
    ...state,
    phase: 'finished',
    pendingQuestion: null,
    currentPlayer: null,
    winner: correct ? guesserRole : answererRole,
    gameOverReason: correct ? 'correct-guess' : 'wrong-guess',
  })
}

export function applyGameOver(
  state: GameState,
  winner: PlayerRole,
  reason: GameOverReason,
): Result<GameState, GameError> {
  if (state.phase === 'finished') {
    return ok(state)
  }

  if (state.phase !== 'playing') {
    return err('wrong-phase')
  }

  return ok({
    ...state,
    phase: 'finished',
    pendingQuestion: null,
    currentPlayer: null,
    winner,
    gameOverReason: reason,
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
