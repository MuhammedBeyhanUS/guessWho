import { useParams } from 'react-router-dom'
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
          Game setup coming soon. Share this link with your opponent to play
          together.
        </p>
      </section>
    </main>
  )
}

export default PlayPage
