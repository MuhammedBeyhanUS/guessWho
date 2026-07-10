import { getCharacterPortraitUrl } from '../assets/characters'
import { getCharacterById } from '../domain/characters'
import type { GameOverPresentation } from '../domain/game/presentation'
import Button from './Button'
import styles from './GameOverOverlay.module.css'

export type GameOverOverlayProps = {
  visible: boolean
  presentation: GameOverPresentation | null
  onPlayAgain: () => void
}

function GameOverOverlay({
  visible,
  presentation,
  onPlayAgain,
}: GameOverOverlayProps) {
  if (!visible || presentation === null) {
    return null
  }

  const revealedCharacter =
    presentation.revealedCharacterId === null
      ? null
      : getCharacterById(presentation.revealedCharacterId)

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Game over"
    >
      <div
        className={[
          styles.card,
          presentation.isLocalWinner ? styles.cardWin : styles.cardLose,
        ].join(' ')}
      >
        <h2 className={styles.title}>{presentation.title}</h2>
        <p className={styles.message} role="status">
          {presentation.message}
        </p>

        {revealedCharacter ? (
          <figure className={styles.reveal}>
            <img
              className={styles.portrait}
              src={getCharacterPortraitUrl(revealedCharacter.id)}
              alt={revealedCharacter.name}
            />
            <figcaption className={styles.characterName}>
              {revealedCharacter.name}
            </figcaption>
          </figure>
        ) : null}

        <Button
          variant="primary"
          className={styles.playAgainButton}
          onClick={onPlayAgain}
        >
          Play Again
        </Button>
      </div>
    </div>
  )
}

export default GameOverOverlay
