import type { PlayerRole } from '../domain/game/types'
import styles from './CoinFlipOverlay.module.css'

export type CoinFlipOverlayProps = {
  result: PlayerRole | null
  visible: boolean
}

function CoinFlipOverlay({ result, visible }: CoinFlipOverlayProps) {
  if (!visible || result === null) {
    return null
  }

  const label = result === 'host' ? 'Host' : 'Guest'

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Coin flip"
    >
      <div className={styles.card}>
        <p className={styles.title}>Coin flip</p>
        <div className={styles.coin} data-result={result} aria-hidden="true">
          <span className={styles.coinFace}>{label}</span>
        </div>
        <p className={styles.result} role="status">
          {label} goes first
        </p>
      </div>
    </div>
  )
}

export default CoinFlipOverlay
