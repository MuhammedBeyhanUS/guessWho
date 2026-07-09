import { useEffect, useRef, useState } from 'react'
import type { ChatDisplayMessage } from '../domain/chat/types'
import { canSendChatText } from '../domain/chat/chatHistory'
import Button from './Button'
import styles from './ChatPanel.module.css'

export type ChatPanelProps = {
  messages: ChatDisplayMessage[]
  onSend: (text: string) => void
  disabled?: boolean
}

function ChatPanel({ messages, onSend, disabled = false }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = messageListRef.current
    if (!list) {
      return
    }

    list.scrollTop = list.scrollHeight
  }, [messages])

  function submitMessage() {
    if (disabled || !canSendChatText(draft)) {
      return
    }

    onSend(draft)
    setDraft('')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className={styles.chatPanel}>
      <div
        ref={messageListRef}
        className={styles.messageList}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <p className={styles.emptyState}>No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={[
                styles.message,
                message.sender === 'self'
                  ? styles.messageSelf
                  : styles.messageOpponent,
              ].join(' ')}
              data-sender={message.sender}
            >
              {message.text}
            </div>
          ))
        )}
      </div>

      <div className={styles.composer}>
        <input
          type="text"
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          aria-label="Chat message"
          disabled={disabled}
        />
        <Button
          variant="primary"
          className={styles.sendButton}
          onClick={submitMessage}
          disabled={disabled || !canSendChatText(draft)}
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  )
}

export default ChatPanel
