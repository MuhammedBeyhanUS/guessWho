import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import GameSessionLayout from './GameSessionLayout'

const defaultProps = {
  isHost: true,
  connectionState: 'connected' as const,
  connectionLabel: 'Connected',
  errorMessage: null,
  onRetry: vi.fn(),
  roomCode: 'ABC234',
}

describe('GameSessionLayout', () => {
  it('renders board, chat region, and voice bar when connected', () => {
    render(<GameSessionLayout {...defaultProps} />)

    expect(screen.getByLabelText('Character board')).toBeInTheDocument()
    expect(screen.getByLabelText('Text chat')).toBeInTheDocument()
    expect(screen.getByLabelText('Voice controls')).toBeInTheDocument()
    expect(screen.getByLabelText('Game status')).toBeInTheDocument()
    expect(screen.getByLabelText('Opponent')).toBeInTheDocument()
    expect(screen.getByText(/you are the host/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Connection status')).not.toBeInTheDocument()
  })

  it('shows guest role label for guest player', () => {
    render(<GameSessionLayout {...defaultProps} isHost={false} />)

    expect(screen.getByText(/you are the guest/i)).toBeInTheDocument()
    expect(screen.getByText('Host')).toBeInTheDocument()
  })

  it('shows waiting overlay when connection state is connecting', () => {
    render(
      <GameSessionLayout
        {...defaultProps}
        connectionState="connecting"
        connectionLabel="Connecting to opponent…"
      />,
    )

    expect(screen.getByLabelText('Connection status')).toBeInTheDocument()
    expect(screen.getByText(/waiting for opponent/i)).toBeInTheDocument()
    expect(
      screen.getAllByText(/connecting to opponent/i).length,
    ).toBeGreaterThan(0)
  })

  it('shows error overlay with retry when connection failed', () => {
    const onRetry = vi.fn()
    render(
      <GameSessionLayout
        {...defaultProps}
        connectionState="failed"
        connectionLabel="Connection failed"
        errorMessage="Could not reach the signaling server"
        onRetry={onRetry}
      />,
    )

    expect(screen.getByLabelText('Connection status')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not reach the signaling server',
    )
    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
