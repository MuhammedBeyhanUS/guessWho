import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import GameSessionLayout from '../components/GameSessionLayout'
import { getShareableUrl } from '../domain/roomCode'
import { useChat } from '../hooks/useChat'
import { useGameSession } from '../hooks/useGameSession'
import { useQuestionHistory } from '../hooks/useQuestionHistory'
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
  const {
    connectionState,
    errorMessage,
    retry,
    send,
    onMessage,
    isMuted,
    toggleMute,
    voicePermission,
    remoteAudioRef,
    remoteStream,
  } = useP2PConnection({
    roomCode,
    isHost,
  })
  const { messages: chatMessages, sendMessage } = useChat({
    send,
    onMessage,
    connectionState,
  })
  const {
    entries: questionHistory,
    recordQuestion,
    recordAnswer,
    clearHistory,
  } = useQuestionHistory({
    onMessage,
    connectionState,
  })
  const {
    gameState,
    phase,
    statusText,
    selectionMode,
    boardKey,
    selectMysteryCharacter,
    canSendReady,
    sendReady,
    coinFlipVisible,
    coinFlipResult,
    sessionError,
    gameplayMode,
    canAsk,
    canAnswer,
    canGuess,
    pendingQuestionText,
    selectedGuessId,
    gameOverVisible,
    gameOverPresentation,
    submitQuestion,
    submitAnswer,
    submitGuess,
    flipTile,
    enterGuessMode,
    exitGuessMode,
    selectGuessCharacter,
    playAgain,
  } = useGameSession({
    isHost,
    connectionState,
    send,
    onMessage,
    recordQuestion,
    recordAnswer,
    onRematch: clearHistory,
  })

  const shareUrl = roomCode ? getShareableUrl(roomCode) : ''
  const connectionLabel = getConnectionStatusLabel(connectionState)
  const displayError = sessionError ?? errorMessage
  const localRole = isHost ? 'host' : 'guest'
  const playingPhase = phase === 'playing'

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
      errorMessage={displayError}
      onRetry={retry}
      roomCode={roomCode}
      shareUrl={shareUrl}
      onCopyShareLink={() => void copyShareLink()}
      onShareLink={() => void shareLink()}
      copyFeedback={copyFeedback}
      chatMessages={chatMessages}
      onSendChatMessage={sendMessage}
      questionHistory={questionHistory}
      isMuted={isMuted}
      onToggleMute={toggleMute}
      voicePermission={voicePermission}
      remoteAudioRef={remoteAudioRef}
      remoteStream={remoteStream}
      statusText={statusText}
      selectionMode={selectionMode}
      boardKey={boardKey}
      onSelectMystery={selectMysteryCharacter}
      canSendReady={canSendReady}
      onSendReady={sendReady}
      coinFlipVisible={coinFlipVisible}
      coinFlipResult={coinFlipResult}
      sessionError={sessionError}
      playingPhase={playingPhase}
      boardTiles={gameState.players[localRole].boardFlips}
      guessMode={gameplayMode === 'guess'}
      selectedGuessId={selectedGuessId}
      onTileFlip={flipTile}
      onGuessSelect={selectGuessCharacter}
      canAsk={canAsk}
      canAnswer={canAnswer}
      canGuess={canGuess}
      gameplayMode={gameplayMode}
      pendingQuestionText={pendingQuestionText}
      onSubmitQuestion={submitQuestion}
      onSubmitAnswer={submitAnswer}
      onEnterGuessMode={enterGuessMode}
      onExitGuessMode={exitGuessMode}
      onConfirmGuess={() => {
        if (selectedGuessId !== null) {
          submitGuess(selectedGuessId)
        }
      }}
      gameOverVisible={gameOverVisible}
      gameOverPresentation={gameOverPresentation}
      onPlayAgain={playAgain}
    />
  )
}

export default PlayPage
