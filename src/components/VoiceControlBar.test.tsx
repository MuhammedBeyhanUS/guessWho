import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createRef } from 'react'
import VoiceControlBar from './VoiceControlBar'

const defaultProps = {
  connectionState: 'connected' as const,
  isMuted: false,
  permissionDenied: false,
  micAvailable: true,
  onToggleMute: vi.fn(),
  remoteAudioRef: createRef<HTMLAudioElement>(),
  remoteStream: null,
}

describe('VoiceControlBar', () => {
  it('renders mute button and mic-on status when connected', () => {
    render(<VoiceControlBar {...defaultProps} />)

    expect(
      screen.getByRole('button', { name: /mute microphone/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Mic on')).toBeInTheDocument()
    expect(screen.getByText('Voice linked')).toBeInTheDocument()
  })

  it('shows mic-off status and unmute label when muted', () => {
    render(<VoiceControlBar {...defaultProps} isMuted />)

    expect(
      screen.getByRole('button', { name: /unmute microphone/i }),
    ).toHaveTextContent('Unmute')
    expect(screen.getByText('Mic off')).toBeInTheDocument()
  })

  it('calls onToggleMute when mute button is clicked', () => {
    const onToggleMute = vi.fn()
    render(<VoiceControlBar {...defaultProps} onToggleMute={onToggleMute} />)

    fireEvent.click(screen.getByRole('button', { name: /mute microphone/i }))
    expect(onToggleMute).toHaveBeenCalledTimes(1)
  })

  it('shows permission denied banner and mic unavailable status', () => {
    render(
      <VoiceControlBar
        {...defaultProps}
        permissionDenied
        micAvailable={false}
      />,
    )

    expect(
      screen.getByText(/microphone access was denied/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Mic unavailable')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /mute microphone/i }),
    ).toBeDisabled()
  })

  it('disables mute button when not connected', () => {
    render(<VoiceControlBar {...defaultProps} connectionState="connecting" />)

    expect(
      screen.getByRole('button', { name: /mute microphone/i }),
    ).toBeDisabled()
    expect(screen.getByText('Voice waiting')).toBeInTheDocument()
  })
})
