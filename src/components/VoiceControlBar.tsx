import { useEffect, type RefObject } from 'react'
import type { ConnectionState } from '../transport/types'
import styles from './VoiceControlBar.module.css'

export type VoiceControlBarProps = {
  connectionState: ConnectionState
  isMuted: boolean
  permissionDenied: boolean
  micAvailable: boolean
  onToggleMute: () => void
  remoteAudioRef: RefObject<HTMLAudioElement | null>
  remoteStream: MediaStream | null
}

function VoiceControlBar({
  connectionState,
  isMuted,
  permissionDenied,
  micAvailable,
  onToggleMute,
  remoteAudioRef,
  remoteStream,
}: VoiceControlBarProps) {
  const isConnected = connectionState === 'connected'
  const muteLabel = isMuted ? 'Unmute microphone' : 'Mute microphone'
  const muteButtonText = isMuted ? 'Unmute' : 'Mute'

  const micStatus = permissionDenied
    ? 'Mic unavailable'
    : isMuted
      ? 'Mic off'
      : 'Mic on'

  useEffect(() => {
    const audio = remoteAudioRef.current
    if (!audio || !remoteStream) {
      return
    }

    audio.srcObject = remoteStream
    void audio.play().catch(() => {
      // Browser autoplay policies may block until user interaction.
    })
  }, [remoteAudioRef, remoteStream])

  return (
    <section className={styles.voiceBar} aria-label="Voice controls">
      <h2 className={styles.panelTitle}>Voice</h2>

      {permissionDenied ? (
        <p className={styles.permissionBanner} role="status">
          Microphone access was denied. Voice chat is unavailable, but you can
          still play and use text chat.
        </p>
      ) : null}

      <div className={styles.voiceControls}>
        <button
          type="button"
          className={styles.voiceButton}
          onClick={onToggleMute}
          disabled={!isConnected || !micAvailable}
          aria-label={muteLabel}
          aria-pressed={isMuted}
        >
          {muteButtonText}
        </button>
        <span
          className={styles.micStatus}
          data-state={permissionDenied ? 'unavailable' : isMuted ? 'off' : 'on'}
          role="status"
        >
          {micStatus}
        </span>
        <span
          className={styles.voiceConnection}
          data-state={connectionState}
          role="status"
        >
          {isConnected ? 'Voice linked' : 'Voice waiting'}
        </span>
      </div>

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className={styles.remoteAudio}
      />
    </section>
  )
}

export default VoiceControlBar
