import { useParams } from 'react-router-dom'
import CharacterBoard from '../components/CharacterBoard'
import styles from './PlayPage.module.css'

function PlayPage() {
  const { roomCode } = useParams<{ roomCode: string }>()

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Game Room</h1>
        <p className={styles.message}>
          Room code: <strong>{roomCode}</strong>
        </p>
        <p className={styles.hint}>
          Preview the character board below. Flip tiles to eliminate suspects,
          or use selection mode when choosing a mystery person.
        </p>
      </section>
      <section className={styles.boardSection}>
        <CharacterBoard />
      </section>
    </main>
  )
}

export default PlayPage
