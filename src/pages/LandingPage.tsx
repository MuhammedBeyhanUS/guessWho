import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { generateRoomCode } from '../domain/roomCode'
import styles from './LandingPage.module.css'

function LandingPage() {
  const navigate = useNavigate()

  function handleCreateGame() {
    const roomCode = generateRoomCode()
    navigate(`/play/${roomCode}`, { state: { isHost: true } })
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Guess Who</h1>
        <p className={styles.tagline}>
          Play the classic face-to-face deduction game online with a friend. Ask
          yes-or-no questions, eliminate suspects, and guess their mystery
          person first.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleCreateGame}>
            Create Game
          </Button>
          <Button variant="secondary" onClick={() => navigate('/join')}>
            Join Game
          </Button>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
