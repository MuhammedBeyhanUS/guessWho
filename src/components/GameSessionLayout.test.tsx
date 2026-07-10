import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('disables Ready button until mystery is selected', () => {
    render(
      <GameSessionLayout
        {...defaultProps}
        statusText="Choose your mystery person"
        selectionMode
        canSendReady={false}
        onSendReady={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /ready/i }),
    ).not.toBeInTheDocument()
  })

  it('enables Ready button after selection', () => {
    const onSendReady = vi.fn()
    render(
      <GameSessionLayout
        {...defaultProps}
        statusText="Tap Ready when you have chosen"
        selectionMode
        canSendReady
        onSendReady={onSendReady}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /ready/i }))
    expect(onSendReady).toHaveBeenCalled()
  })

  it('shows coin flip overlay when visible', () => {
    render(
      <GameSessionLayout
        {...defaultProps}
        statusText="Flipping coin…"
        coinFlipVisible
        coinFlipResult="host"
      />,
    )

    expect(screen.getByLabelText('Coin flip')).toBeInTheDocument()
    expect(screen.getByText(/host goes first/i)).toBeInTheDocument()
  })

  it('shows turn status during playing phase', () => {
    render(
      <GameSessionLayout
        {...defaultProps}
        statusText="Your turn"
        selectionMode={false}
      />,
    )

    expect(screen.getByLabelText('Game status')).toHaveTextContent('Your turn')
  })

  it('shows setup disconnect error overlay', () => {
    render(
      <GameSessionLayout
        {...defaultProps}
        connectionState="disconnected"
        connectionLabel="Disconnected"
        sessionError="Opponent disconnected during game setup."
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Opponent disconnected during game setup.',
    )
  })

  it('enables Yes/No buttons only for answerer during pending question', () => {
    const onSubmitAnswer = vi.fn()
    const { rerender } = render(
      <GameSessionLayout
        {...defaultProps}
        playingPhase
        statusText="Answer the question"
        canAnswer
        pendingQuestionText="Does your person wear glasses?"
        onSubmitAnswer={onSubmitAnswer}
      />,
    )

    const answerSection = screen.getByLabelText('Answer question')
    const yesButton = within(answerSection).getByRole('button', {
      name: /^yes$/i,
    })
    fireEvent.click(yesButton)
    expect(onSubmitAnswer).toHaveBeenCalledWith('yes')

    rerender(
      <GameSessionLayout
        {...defaultProps}
        playingPhase
        statusText="Your turn"
        canAnswer={false}
        canAsk
        pendingQuestionText={null}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /^yes$/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^no$/i }),
    ).not.toBeInTheDocument()
  })

  it('shows game over screen with winner text', () => {
    const onPlayAgain = vi.fn()
    render(
      <GameSessionLayout
        {...defaultProps}
        playingPhase
        statusText="Game over"
        gameOverVisible
        winnerLabel="You win!"
        onPlayAgain={onPlayAgain}
      />,
    )

    expect(screen.getByLabelText('Game over')).toBeInTheDocument()
    expect(screen.getByText('You win!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    expect(onPlayAgain).toHaveBeenCalled()
  })
})
