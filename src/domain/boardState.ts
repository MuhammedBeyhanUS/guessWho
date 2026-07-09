export type TileState = 'open' | 'closed'

export interface BoardState {
  tiles: Record<string, TileState>
  selectedId: string | null
}

export type BoardAction =
  | { type: 'toggle'; characterId: string }
  | { type: 'select'; characterId: string }
  | { type: 'resetSelection' }
  | { type: 'reset' }

export function createInitialBoardState(
  characterIds: readonly string[],
): BoardState {
  const tiles = Object.fromEntries(
    characterIds.map((id) => [id, 'open' as const]),
  )

  return {
    tiles,
    selectedId: null,
  }
}

export function boardReducer(
  state: BoardState,
  action: BoardAction,
): BoardState {
  switch (action.type) {
    case 'toggle': {
      const current = state.tiles[action.characterId]
      if (current === undefined) {
        return state
      }

      return {
        ...state,
        tiles: {
          ...state.tiles,
          [action.characterId]: current === 'open' ? 'closed' : 'open',
        },
      }
    }
    case 'select': {
      if (state.selectedId !== null) {
        return state
      }

      if (state.tiles[action.characterId] === undefined) {
        return state
      }

      return {
        ...state,
        selectedId: action.characterId,
      }
    }
    case 'resetSelection':
      return {
        ...state,
        selectedId: null,
      }
    case 'reset':
      return createInitialBoardState(Object.keys(state.tiles))
    default:
      return state
  }
}

export function isTileClosed(state: BoardState, characterId: string): boolean {
  return state.tiles[characterId] === 'closed'
}

export function isCharacterSelected(
  state: BoardState,
  characterId: string,
): boolean {
  return state.selectedId === characterId
}
