import styles from './JoinPage.module.css'

function JoinPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Join Game</h1>
        <p className={styles.message}>
          Enter a room code to connect with your opponent.
        </p>
        <p className={styles.hint}>Join flow coming soon.</p>
      </section>
    </main>
  )
}

export default JoinPage
