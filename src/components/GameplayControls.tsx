import { useState } from 'react'
import type { FormEvent } from 'react'
import Button from './Button'
import styles from './GameplayControls.module.css'

export type GameplayControlsProps = {
  canAsk: boolean
  canAnswer: boolean
  canGuess: boolean
  gameplayMode: 'idle' | 'guess'
  pendingQuestionText: string | null
  selectedGuessId: string | null
  onSubmitQuestion: (text: string) => void
  onSubmitAnswer: (value: 'yes' | 'no') => void
  onEnterGuessMode: () => void
  onExitGuessMode: () => void
  onConfirmGuess: () => void
  embedded?: boolean
}

function GameplayControls({
  canAsk,
  canAnswer,
  canGuess,
  gameplayMode,
  pendingQuestionText,
  selectedGuessId,
  onSubmitQuestion,
  onSubmitAnswer,
  onEnterGuessMode,
  onExitGuessMode,
  onConfirmGuess,
  embedded = false,
}: GameplayControlsProps) {
  const [questionText, setQuestionText] = useState('')
  const sectionClass = embedded ? styles.controlsEmbedded : styles.controls

  function handleAskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = questionText.trim()
    if (trimmed.length === 0) {
      return
    }

    onSubmitQuestion(trimmed)
    setQuestionText('')
  }

  if (canAnswer && pendingQuestionText !== null) {
    return (
      <section className={sectionClass} aria-label="Answer question">
        <p className={styles.pendingQuestion}>{pendingQuestionText}</p>
        <div className={styles.answerButtons}>
          <Button
            variant="primary"
            className={styles.answerYes}
            onClick={() => onSubmitAnswer('yes')}
          >
            Yes
          </Button>
          <Button
            variant="secondary"
            className={styles.answerNo}
            onClick={() => onSubmitAnswer('no')}
          >
            No
          </Button>
        </div>
      </section>
    )
  }

  if (gameplayMode === 'guess') {
    return (
      <section className={sectionClass} aria-label="Guess character">
        <p className={styles.guessHint}>
          {selectedGuessId
            ? 'Confirm your guess on the board'
            : 'Tap a character on your board to guess'}
        </p>
        <div className={styles.guessActions}>
          <Button variant="secondary" onClick={onExitGuessMode}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={selectedGuessId === null}
            onClick={onConfirmGuess}
          >
            Confirm Guess
          </Button>
        </div>
      </section>
    )
  }

  if (!canAsk && !canGuess) {
    return null
  }

  return (
    <section className={sectionClass} aria-label="Ask or guess">
      <form className={styles.askForm} onSubmit={handleAskSubmit}>
        <label className={styles.askLabel} htmlFor="game-question">
          Your yes/no question
        </label>
        <input
          id="game-question"
          className={styles.askInput}
          type="text"
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="Does your person wear glasses?"
          disabled={!canAsk}
        />
        <div className={styles.askActions}>
          <Button type="submit" variant="primary" disabled={!canAsk}>
            Ask
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!canGuess}
            onClick={onEnterGuessMode}
          >
            Guess
          </Button>
        </div>
      </form>
    </section>
  )
}

export default GameplayControls
