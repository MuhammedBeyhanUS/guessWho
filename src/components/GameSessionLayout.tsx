import CharacterBoard from './CharacterBoard'
import Button from './Button'
import ChatPanel from './ChatPanel'
import type { ChatDisplayMessage } from '../domain/chat/types'
import type { ConnectionState } from '../transport/types'
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
}: GameSessionLayoutProps) {
  const isConnected = connectionState === 'connected'
  const roleLabel = isHost ? 'Host' : 'Guest'
  const opponentRoleLabel = isHost ? 'Guest' : 'Host'

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
          <CharacterBoard />
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

          <section className={styles.voiceBar} aria-label="Voice controls">
            <h2 className={styles.panelTitle}>Voice</h2>
            <div className={styles.voiceControls}>
              <button
                type="button"
                className={styles.voiceButton}
                disabled
                aria-label="Mute microphone"
              >
                Mute
              </button>
              <span className={styles.micStatus} role="status">
                Mic off
              </span>
            </div>
          </section>
        </aside>
      </div>

      <section className={styles.statusBar} aria-label="Game status">
        <p className={styles.statusText}>Waiting for game setup…</p>
      </section>

      {!isConnected ? (
        <ConnectionOverlay
          isHost={isHost}
          connectionState={connectionState}
          connectionLabel={connectionLabel}
          errorMessage={errorMessage}
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
