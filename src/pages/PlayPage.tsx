import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import GameSessionLayout from '../components/GameSessionLayout'
import { getShareableUrl } from '../domain/roomCode'
import { useChat } from '../hooks/useChat'
import {
  getConnectionStatusLabel,
  useP2PConnection,
} from '../transport/useP2PConnection'

type PlayLocationState = {
  isHost?: boolean
}

function PlayPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const location = useLocation()
  const locationState = location.state as PlayLocationState | null
  const isHost = locationState?.isHost === true
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const { connectionState, errorMessage, retry, send, onMessage } =
    useP2PConnection({
      roomCode,
      isHost,
    })
  const { messages: chatMessages, sendMessage } = useChat({
    send,
    onMessage,
    connectionState,
  })

  const shareUrl = roomCode ? getShareableUrl(roomCode) : ''
  const connectionLabel = getConnectionStatusLabel(connectionState)

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
    <GameSessionLayout
      isHost={isHost}
      connectionState={connectionState}
      connectionLabel={connectionLabel}
      errorMessage={errorMessage}
      onRetry={retry}
      roomCode={roomCode}
      shareUrl={shareUrl}
      onCopyShareLink={() => void copyShareLink()}
      onShareLink={() => void shareLink()}
      copyFeedback={copyFeedback}
      chatMessages={chatMessages}
      onSendChatMessage={sendMessage}
    />
  )
}

export default PlayPage
