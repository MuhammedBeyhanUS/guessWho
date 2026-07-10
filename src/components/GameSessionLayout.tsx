import CharacterBoard from './CharacterBoard'
import Button from './Button'
import ChatPanel from './ChatPanel'
import CoinFlipOverlay from './CoinFlipOverlay'
import VoiceControlBar from './VoiceControlBar'
import type { ChatDisplayMessage } from '../domain/chat/types'
import type { PlayerRole } from '../domain/game/types'
import type { ConnectionState, VoicePermissionState } from '../transport/types'
import type { RefObject } from 'react'
import styles from './GameSessionLayout.module.css'

export type GameSessionLayoutProps = {
  isHost: boolean
  connectionState: ConnectionState
  connectionLabel: string
  errorMessage: string | null
  onRetry: () => void
  roomCode?: string
  shareUrl?: string
  onCopyShareLink?: () => void
  onShareLink?: () => void
  copyFeedback?: string | null
  chatMessages?: ChatDisplayMessage[]
  onSendChatMessage?: (text: string) => void
  isMuted?: boolean
  onToggleMute?: () => void
  voicePermission?: VoicePermissionState
  remoteAudioRef?: RefObject<HTMLAudioElement | null>
  remoteStream?: MediaStream | null
  statusText?: string
  selectionMode?: boolean
  boardKey?: string
  onSelectMystery?: (characterId: string) => void
  canSendReady?: boolean
  onSendReady?: () => void
  coinFlipVisible?: boolean
  coinFlipResult?: PlayerRole | null
  sessionError?: string | null
}

function GameSessionLayout({
  isHost,
  connectionState,
  connectionLabel,
  errorMessage,
  onRetry,
  roomCode,
  shareUrl,
  onCopyShareLink,
  onShareLink,
  copyFeedback,
  chatMessages = [],
  onSendChatMessage,
  isMuted = false,
  onToggleMute,
  voicePermission = 'pending',
  remoteAudioRef,
  remoteStream = null,
  statusText = 'Waiting for game setup…',
  selectionMode = false,
  boardKey = 'board',
  onSelectMystery,
  canSendReady = false,
  onSendReady,
  coinFlipVisible = false,
  coinFlipResult = null,
  sessionError = null,
}: GameSessionLayoutProps) {
  const isConnected = connectionState === 'connected'
  const roleLabel = isHost ? 'Host' : 'Guest'
  const opponentRoleLabel = isHost ? 'Guest' : 'Host'
  const overlayError = sessionError ?? errorMessage
  const showConnectionOverlay = !isConnected || sessionError !== null

  return (
    <main className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Guess Who</h1>
        <p className={styles.roleBadge} data-role={isHost ? 'host' : 'guest'}>
          You are the {roleLabel}
        </p>
        {roomCode ? (
          <p className={styles.roomCode} aria-label={`Room code ${roomCode}`}>
            Room: {roomCode}
          </p>
        ) : null}
      </header>

      <div className={styles.sessionBody}>
        <section
          className={styles.boardPanel}
          aria-label="Your character board"
        >
          <CharacterBoard
            key={boardKey}
            selectionMode={selectionMode}
            onSelectionChange={(characterId) => {
              if (characterId !== null) {
                onSelectMystery?.(characterId)
              }
            }}
          />
        </section>

        <aside className={styles.sidePanel}>
          <section className={styles.opponentPanel} aria-label="Opponent">
            <h2 className={styles.panelTitle}>Opponent</h2>
            <p className={styles.opponentRole}>{opponentRoleLabel}</p>
            <p
              className={styles.connectionIndicator}
              data-state={connectionState}
              role="status"
            >
              {connectionLabel}
            </p>
          </section>

          <section className={styles.chatPanel} aria-label="Text chat">
            <h2 className={styles.panelTitle}>Chat</h2>
            <ChatPanel
              messages={chatMessages}
              onSend={onSendChatMessage ?? (() => {})}
              disabled={!isConnected || !onSendChatMessage}
            />
          </section>

          <VoiceControlBar
            connectionState={connectionState}
            isMuted={isMuted}
            permissionDenied={voicePermission === 'denied'}
            micAvailable={voicePermission === 'granted'}
            onToggleMute={onToggleMute ?? (() => {})}
            remoteAudioRef={remoteAudioRef ?? { current: null }}
            remoteStream={remoteStream}
          />
        </aside>
      </div>

      <section className={styles.statusBar} aria-label="Game status">
        <p className={styles.statusText} role="status">
          {statusText}
        </p>
        {isConnected && canSendReady && onSendReady ? (
          <Button
            variant="primary"
            className={styles.readyButton}
            onClick={onSendReady}
          >
            Ready
          </Button>
        ) : null}
      </section>

      <CoinFlipOverlay visible={coinFlipVisible} result={coinFlipResult} />

      {showConnectionOverlay ? (
        <ConnectionOverlay
          isHost={isHost}
          connectionState={connectionState}
          connectionLabel={connectionLabel}
          errorMessage={overlayError}
          onRetry={onRetry}
          shareUrl={shareUrl}
          onCopyShareLink={onCopyShareLink}
          onShareLink={onShareLink}
          copyFeedback={copyFeedback}
        />
      ) : null}
    </main>
  )
}

type ConnectionOverlayProps = {
  isHost: boolean
  connectionState: ConnectionState
  connectionLabel: string
  errorMessage: string | null
  onRetry: () => void
  shareUrl?: string
  onCopyShareLink?: () => void
  onShareLink?: () => void
  copyFeedback?: string | null
}

function ConnectionOverlay({
  isHost,
  connectionState,
  connectionLabel,
  errorMessage,
  onRetry,
  shareUrl,
  onCopyShareLink,
  onShareLink,
  copyFeedback,
}: ConnectionOverlayProps) {
  const showRetry = connectionState === 'failed'
  const waitingMessage =
    connectionState === 'failed'
      ? 'Connection failed'
      : isHost
        ? 'Waiting for opponent…'
        : connectionLabel

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Connection status"
    >
      <div className={styles.overlayCard}>
        <h2 className={styles.overlayTitle}>{waitingMessage}</h2>
        <p
          className={styles.overlayStatus}
          data-state={connectionState}
          role="status"
        >
          {connectionLabel}
        </p>

        {isHost && shareUrl ? (
          <HostShareSection
            shareUrl={shareUrl}
            onCopyShareLink={onCopyShareLink}
            onShareLink={onShareLink}
            copyFeedback={copyFeedback}
          />
        ) : null}

        {errorMessage ? (
          <p className={styles.overlayError} role="alert">
            {errorMessage}
          </p>
        ) : null}

        {showRetry ? (
          <Button variant="primary" onClick={onRetry}>
            Retry connection
          </Button>
        ) : null}
      </div>
    </div>
  )
}

type HostShareSectionProps = {
  shareUrl: string
  onCopyShareLink?: () => void
  onShareLink?: () => void
  copyFeedback?: string | null
}

function HostShareSection({
  shareUrl,
  onCopyShareLink,
  onShareLink,
  copyFeedback,
}: HostShareSectionProps) {
  return (
    <div className={styles.hostShare}>
      <p className={styles.shareUrl}>{shareUrl}</p>
      <div className={styles.shareActions}>
        {onCopyShareLink ? (
          <Button variant="primary" onClick={onCopyShareLink}>
            Copy Link
          </Button>
        ) : null}
        {onShareLink ? (
          <Button variant="secondary" onClick={onShareLink}>
            Share
          </Button>
        ) : null}
      </div>
      {copyFeedback ? (
        <p className={styles.copyFeedback} role="status">
          {copyFeedback}
        </p>
      ) : null}
    </div>
  )
}

export default GameSessionLayout
