import { useCallback, useEffect, useState } from 'react'
import {
  appendChatMessage,
  canSendChatText,
  createChatP2PMessage,
  p2pChatToDisplayMessage,
} from '../domain/chat/chatHistory'
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

  useEffect(() => {
    if (connectionState !== 'connected') {
      setMessages([])
      return
    }

    const unsubscribe = onMessage((message) => {
      if (message.type !== 'chat') {
        return
      }

      setMessages((current) =>
        appendChatMessage(
          current,
          p2pChatToDisplayMessage(message, 'opponent'),
        ),
      )
    })

    return unsubscribe
  }, [onMessage, connectionState])

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

  return { messages, sendMessage }
}
