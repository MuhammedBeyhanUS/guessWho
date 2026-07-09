import { useReducer } from 'react'
import { CHARACTERS } from '../domain/characters'
import {
  boardReducer,
  createInitialBoardState,
  isCharacterSelected,
  isTileClosed,
  type BoardState,
} from '../domain/boardState'
import { cardBackUrl, getCharacterPortraitUrl } from '../assets/characters'
import styles from './CharacterBoard.module.css'

export interface CharacterBoardProps {
  selectionMode?: boolean
  initialState?: BoardState
  onSelectionChange?: (characterId: string | null) => void
}

const defaultInitialState = createInitialBoardState(
  CHARACTERS.map((character) => character.id),
)

function CharacterBoard({
  selectionMode = false,
  initialState = defaultInitialState,
  onSelectionChange,
}: CharacterBoardProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState)
  const selectionLocked = selectionMode && state.selectedId !== null

  function handleTileClick(characterId: string) {
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
      <div className={styles.grid}>
        {CHARACTERS.map((character) => {
          const closed = isTileClosed(state, character.id)
          const selected = isCharacterSelected(state, character.id)
          const disabled = selectionMode && selectionLocked && !selected

          return (
            <button
              key={character.id}
              type="button"
              className={[
                styles.tile,
                closed ? styles.flipped : '',
                selected ? styles.tileSelected : '',
                disabled ? styles.tileDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${character.name}${closed ? ', eliminated' : ''}${selected ? ', selected as mystery person' : ''}`}
              aria-pressed={selectionMode ? selected : closed}
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
