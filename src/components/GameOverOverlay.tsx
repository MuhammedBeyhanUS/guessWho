import Button from './Button'
import styles from './GameOverOverlay.module.css'

export type GameOverOverlayProps = {
  visible: boolean
  winnerLabel: string | null
  onPlayAgain: () => void
}

function GameOverOverlay({
  visible,
  winnerLabel,
  onPlayAgain,
}: GameOverOverlayProps) {
  if (!visible || winnerLabel === null) {
    return null
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Game over"
    >
      <div className={styles.card}>
        <h2 className={styles.title}>Game Over</h2>
        <p className={styles.winner} role="status">
          {winnerLabel}
        </p>
        <Button variant="primary" onClick={onPlayAgain}>
          Play Again
        </Button>
      </div>
    </div>
  )
}

export default GameOverOverlay
