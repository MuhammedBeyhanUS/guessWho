import { describe, expect, it } from 'vitest'
import {
  boardReducer,
  createInitialBoardState,
  isTileClosed,
} from './boardState'
import { CHARACTERS } from './characters'

const characterIds = CHARACTERS.map((character) => character.id)

describe('boardReducer', () => {
  it('starts with all tiles open', () => {
    const state = createInitialBoardState(characterIds)
    for (const id of characterIds) {
      expect(state.tiles[id]).toBe('open')
    }
    expect(state.selectedId).toBeNull()
  })

  it('toggles a tile from open to closed and back', () => {
    let state = createInitialBoardState(characterIds)

    state = boardReducer(state, { type: 'toggle', characterId: 'eleni' })
    expect(isTileClosed(state, 'eleni')).toBe(true)

    state = boardReducer(state, { type: 'toggle', characterId: 'eleni' })
    expect(isTileClosed(state, 'eleni')).toBe(false)
  })

  it('ignores toggle for unknown character ids', () => {
    let state = createInitialBoardState(characterIds)
    state = boardReducer(state, { type: 'toggle', characterId: 'marco' })
    expect(state.tiles.marco).toBe('closed')

    const unchanged = boardReducer(state, {
      type: 'toggle',
      characterId: 'unknown',
    })
    expect(unchanged).toBe(state)
  })

  it('selects exactly one character in selection mode', () => {
    let state = createInitialBoardState(characterIds)
    state = boardReducer(state, { type: 'select', characterId: 'priya' })
    expect(state.selectedId).toBe('priya')

    const blocked = boardReducer(state, { type: 'select', characterId: 'theo' })
    expect(blocked.selectedId).toBe('priya')
  })

  it('resets selection and board state', () => {
    let state = createInitialBoardState(characterIds)
    state = boardReducer(state, { type: 'toggle', characterId: 'yuki' })
    state = boardReducer(state, { type: 'select', characterId: 'yuki' })

    state = boardReducer(state, { type: 'resetSelection' })
    expect(state.selectedId).toBeNull()

    state = boardReducer(state, { type: 'reset' })
    expect(state.tiles.yuki).toBe('open')
  })
})
