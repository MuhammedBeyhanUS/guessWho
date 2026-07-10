import { useCallback, useEffect, useRef, useState } from 'react'
import {
  appendHistoryEntry,
  createAnswerEntry,
  createQuestionEntry,
  hasAnswerForQuestion,
  hasQuestionForId,
  type GameHistoryEntry,
} from '../domain/game/history'
import type { YesNo } from '../domain/game/types'
import type { P2PMessage } from '../transport/protocol'
import type { ConnectionState } from '../transport/types'

type UseQuestionHistoryOptions = {
  onMessage: (handler: (message: P2PMessage) => void) => () => void
  connectionState: ConnectionState
}

export function useQuestionHistory({
  onMessage,
  connectionState,
}: UseQuestionHistoryOptions) {
  const [entries, setEntries] = useState<GameHistoryEntry[]>([])
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (connectionState !== 'connected') {
      setEntries([])
      return
    }

    const unsubscribe = onMessageRef.current((message) => {
      if (message.type === 'question') {
        setEntries((current) => {
          if (hasQuestionForId(current, message.id)) {
            return current
          }

          return appendHistoryEntry(
            current,
            createQuestionEntry('opponent', message.text, message.id),
          )
        })
        return
      }

      if (message.type === 'answer') {
        setEntries((current) => {
          if (hasAnswerForQuestion(current, message.questionId)) {
            return current
          }

          return appendHistoryEntry(
            current,
            createAnswerEntry('opponent', message.value, message.questionId),
          )
        })
      }
    })

    return unsubscribe
  }, [connectionState])

  const recordQuestion = useCallback((text: string, questionId: string) => {
    setEntries((current) => {
      if (hasQuestionForId(current, questionId)) {
        return current
      }

      return appendHistoryEntry(
        current,
        createQuestionEntry('self', text, questionId),
      )
    })
  }, [])

  const recordAnswer = useCallback((value: YesNo, questionId: string) => {
    setEntries((current) => {
      if (hasAnswerForQuestion(current, questionId)) {
        return current
      }

      return appendHistoryEntry(
        current,
        createAnswerEntry('self', value, questionId),
      )
    })
  }, [])

  return { entries, recordQuestion, recordAnswer }
}
