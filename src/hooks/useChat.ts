import { useCallback, useEffect, useRef, useState } from 'react'
import {
  appendChatMessage,
  canSendChatText,
  createChatP2PMessage,
  p2pChatToDisplayMessage,
} from '../domain/chat/chatHistory'
import {
  createGameLogMessage,
  formatOpponentAnswered,
  formatOpponentAsked,
} from '../domain/chat/gameEvents'
import type { ChatDisplayMessage } from '../domain/chat/types'
import type { P2PMessage } from '../transport/protocol'
import type { ConnectionState } from '../transport/types'

type UseChatOptions = {
  send: (message: P2PMessage) => void
  onMessage: (handler: (message: P2PMessage) => void) => () => void
  connectionState: ConnectionState
}

export function useChat({ send, onMessage, connectionState }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([])
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (connectionState !== 'connected') {
      setMessages([])
      return
    }

    const unsubscribe = onMessageRef.current((message) => {
      if (message.type === 'chat') {
        setMessages((current) =>
          appendChatMessage(
            current,
            p2pChatToDisplayMessage(message, 'opponent'),
          ),
        )
        return
      }

      if (message.type === 'question') {
        setMessages((current) =>
          appendChatMessage(
            current,
            createGameLogMessage(
              formatOpponentAsked(message.text),
              `game-question-${message.id}`,
            ),
          ),
        )
        return
      }

      if (message.type === 'answer') {
        setMessages((current) =>
          appendChatMessage(
            current,
            createGameLogMessage(
              formatOpponentAnswered(message.value),
              `game-answer-${message.questionId}`,
            ),
          ),
        )
      }
    })

    return unsubscribe
  }, [connectionState])

  const sendMessage = useCallback(
    (text: string) => {
      if (!canSendChatText(text)) {
        return
      }

      const chatMessage = createChatP2PMessage(text)
      send(chatMessage)
      setMessages((current) =>
        appendChatMessage(
          current,
          p2pChatToDisplayMessage(chatMessage, 'self'),
        ),
      )
    },
    [send],
  )

  const appendGameLog = useCallback((text: string, id?: string) => {
    setMessages((current) =>
      appendChatMessage(current, createGameLogMessage(text, id)),
    )
  }, [])

  return { messages, sendMessage, appendGameLog }
}
