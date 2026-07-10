import { useReducer } from 'react'
import { CHARACTERS } from '../domain/characters'
import {
  boardReducer,
  createInitialBoardState,
  isCharacterSelected,
  type BoardState,
  type TileState,
} from '../domain/boardState'
import { cardBackUrl, getCharacterPortraitUrl } from '../assets/characters'
import styles from './CharacterBoard.module.css'

export interface CharacterBoardProps {
  selectionMode?: boolean
  guessMode?: boolean
  initialState?: BoardState
  tiles?: Record<string, TileState>
  selectedGuessId?: string | null
  onSelectionChange?: (characterId: string | null) => void
  onGuessSelect?: (characterId: string) => void
  onTileToggle?: (characterId: string) => void
}

const defaultInitialState = createInitialBoardState(
  CHARACTERS.map((character) => character.id),
)

function CharacterBoard({
  selectionMode = false,
  guessMode = false,
  initialState = defaultInitialState,
  tiles,
  selectedGuessId = null,
  onSelectionChange,
  onGuessSelect,
  onTileToggle,
}: CharacterBoardProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState)
  const controlledTiles = tiles ?? state.tiles
  const selectionLocked = selectionMode && state.selectedId !== null

  function handleTileClick(characterId: string) {
    if (guessMode) {
      onGuessSelect?.(characterId)
      return
    }

    if (selectionMode) {
      if (selectionLocked && state.selectedId !== characterId) {
        return
      }

      if (state.selectedId === characterId) {
        return
      }

      dispatch({ type: 'select', characterId })
      onSelectionChange?.(characterId)
      return
    }

    if (onTileToggle) {
      onTileToggle(characterId)
      return
    }

    dispatch({ type: 'toggle', characterId })
  }

  return (
    <section className={styles.board} aria-label="Character board">
      {selectionMode && (
        <p className={styles.selectionHint}>
          {selectionLocked
            ? `Mystery person: ${CHARACTERS.find((c) => c.id === state.selectedId)?.name ?? 'Selected'}`
            : 'Tap a character to choose your mystery person'}
        </p>
      )}
      {guessMode && (
        <p className={styles.selectionHint}>
          {selectedGuessId
            ? `Guessing: ${CHARACTERS.find((c) => c.id === selectedGuessId)?.name ?? 'Selected'}`
            : 'Tap a character to make your guess'}
        </p>
      )}
      <div className={styles.grid}>
        {CHARACTERS.map((character) => {
          const closed = controlledTiles[character.id] === 'closed'
          const selected =
            selectionMode && isCharacterSelected(state, character.id)
          const guessed = guessMode && selectedGuessId === character.id
          const disabled =
            (selectionMode && selectionLocked && !selected) ||
            (guessMode && closed)

          return (
            <button
              key={character.id}
              type="button"
              className={[
                styles.tile,
                closed ? styles.flipped : '',
                selected || guessed ? styles.tileSelected : '',
                disabled ? styles.tileDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${character.name}${closed ? ', eliminated' : ''}${selected ? ', selected as mystery person' : ''}${guessed ? ', selected for guess' : ''}`}
              aria-pressed={
                selectionMode ? selected : guessMode ? guessed : closed
              }
              disabled={disabled}
              onClick={() => handleTileClick(character.id)}
            >
              <div className={styles.flipInner}>
                <div className={`${styles.face} ${styles.front}`}>
                  <img
                    className={styles.portrait}
                    src={getCharacterPortraitUrl(character.id)}
                    alt={character.name}
                  />
                  <span className={styles.label}>{character.name}</span>
                </div>
                <div className={`${styles.face} ${styles.back}`}>
                  <img
                    className={styles.cardBack}
                    src={cardBackUrl}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default CharacterBoard
