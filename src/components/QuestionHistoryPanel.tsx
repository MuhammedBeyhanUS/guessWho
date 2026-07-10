import { useEffect, useRef } from 'react'
import { actorLabel } from '../domain/game/history'
import type { GameHistoryEntry } from '../domain/game/history'
import styles from './QuestionHistoryPanel.module.css'

export type QuestionHistoryPanelProps = {
  entries: GameHistoryEntry[]
}

function QuestionHistoryPanel({ entries }: QuestionHistoryPanelProps) {
  const entryListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = entryListRef.current
    if (!list) {
      return
    }

    list.scrollTop = list.scrollHeight
  }, [entries])

  return (
    <div className={styles.historyPanel}>
      <div
        ref={entryListRef}
        className={styles.entryList}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.length === 0 ? (
          <p className={styles.emptyState}>
            Questions and answers will appear here.
          </p>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className={[
                styles.entry,
                entry.actor === 'self'
                  ? styles.entrySelf
                  : styles.entryOpponent,
              ].join(' ')}
              data-type={entry.type}
              data-actor={entry.actor}
            >
              {entry.type === 'question' ? (
                <>
                  <p className={styles.entryHeader}>
                    {actorLabel(entry.actor)} asked
                  </p>
                  <p className={styles.questionText}>
                    &ldquo;{entry.text}&rdquo;
                  </p>
                </>
              ) : (
                <div className={styles.answerRow}>
                  <p className={styles.entryHeader}>
                    {actorLabel(entry.actor)} answered
                  </p>
                  <span
                    className={[
                      styles.answerBadge,
                      entry.value === 'yes'
                        ? styles.answerYes
                        : styles.answerNo,
                    ].join(' ')}
                  >
                    {entry.value === 'yes' ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default QuestionHistoryPanel
