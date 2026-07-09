import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { ROOM_CODE_LENGTH, validateRoomCode } from '../domain/roomCode'
import styles from './JoinPage.module.css'

function JoinPage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateRoomCode(roomCode)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setError(null)
    // Guest join: navigate without isHost so PlayPage treats user as guest.
    navigate(`/play/${result.code}`)
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Join Game</h1>
        <p className={styles.message}>
          Enter a room code to connect with your opponent.
        </p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor="room-code">
            Room code
          </label>
          <input
            id="room-code"
            className={styles.input}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={ROOM_CODE_LENGTH}
            value={roomCode}
            onChange={(event) => {
              setRoomCode(event.target.value.toUpperCase())
              if (error) {
                setError(null)
              }
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'room-code-error' : undefined}
          />
          {error ? (
            <p className={styles.error} id="room-code-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button variant="primary" type="submit">
            Join
          </Button>
        </form>
      </section>
    </main>
  )
}

export default JoinPage
