import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import CharacterBoard from '../components/CharacterBoard'
import Button from '../components/Button'
import { getShareableUrl } from '../domain/roomCode'
import styles from './PlayPage.module.css'

type PlayLocationState = {
  isHost?: boolean
}

function PlayPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const location = useLocation()
  const locationState = location.state as PlayLocationState | null
  // Host: arrived via Create Game (location.state.isHost === true).
  // Guest: opened /play/:roomCode directly or via join flow (issue 005).
  const isHost = locationState?.isHost === true
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const shareUrl = roomCode ? getShareableUrl(roomCode) : ''

  async function copyShareLink() {
    if (!shareUrl) {
      return
    }

    await navigator.clipboard.writeText(shareUrl)
    setCopyFeedback('Link copied!')
    window.setTimeout(() => setCopyFeedback(null), 2000)
  }

  async function shareLink() {
    if (!shareUrl || !roomCode) {
      return
    }

    if (navigator.share) {
      await navigator.share({
        url: shareUrl,
        title: 'Guess Who',
        text: `Join my Guess Who game! Room code: ${roomCode}`,
      })
      return
    }

    await copyShareLink()
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Game Room</h1>

        {isHost ? (
          <div className={styles.hostView}>
            <p className={styles.hostLabel}>Your room code</p>
            <p className={styles.roomCode}>{roomCode}</p>
            <p className={styles.shareUrl}>{shareUrl}</p>
            <div className={styles.shareActions}>
              <Button variant="primary" onClick={() => void copyShareLink()}>
                Copy Link
              </Button>
              <Button variant="secondary" onClick={() => void shareLink()}>
                Share
              </Button>
            </div>
            {copyFeedback ? (
              <p className={styles.copyFeedback} role="status">
                {copyFeedback}
              </p>
            ) : null}
            <p className={styles.waiting}>Waiting for opponent…</p>
            <p className={styles.connectionStatus}>
              Connection status: waiting for peer
            </p>
          </div>
        ) : (
          <div className={styles.guestView}>
            <p className={styles.message}>
              Room code: <strong>{roomCode}</strong>
            </p>
            <p className={styles.connecting}>Connecting…</p>
            <p className={styles.connectionStatus}>
              Connection status: joining room
            </p>
          </div>
        )}
      </section>
      {isHost ? (
        <section className={styles.boardSection}>
          <CharacterBoard />
        </section>
      ) : null}
    </main>
  )
}

export default PlayPage
