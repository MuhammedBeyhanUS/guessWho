import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import GameOverOverlay from './GameOverOverlay'

describe('GameOverOverlay', () => {
  it('shows congratulations and the guessed character on a correct guess', () => {
    const onPlayAgain = vi.fn()

    render(
      <GameOverOverlay
        visible
        presentation={{
          title: 'Correct guess!',
          message: 'Congratulations — you win!',
          revealedCharacterId: 'marco',
          isLocalWinner: true,
        }}
        onPlayAgain={onPlayAgain}
      />,
    )

    expect(screen.getByLabelText('Game over')).toBeInTheDocument()
    expect(screen.getByText('Correct guess!')).toBeInTheDocument()
    expect(screen.getByText('Congratulations — you win!')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Marco' })).toBeInTheDocument()
    expect(screen.getByText('Marco')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    expect(onPlayAgain).toHaveBeenCalled()
  })

  it('reveals the mystery character after a wrong guess', () => {
    render(
      <GameOverOverlay
        visible
        presentation={{
          title: 'Wrong guess',
          message: 'The mystery person was actually:',
          revealedCharacterId: 'marco',
          isLocalWinner: false,
        }}
        onPlayAgain={vi.fn()}
      />,
    )

    expect(screen.getByText('Wrong guess')).toBeInTheDocument()
    expect(
      screen.getByText('The mystery person was actually:'),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Marco' })).toBeInTheDocument()
  })

  it('renders nothing when hidden', () => {
    const { container } = render(
      <GameOverOverlay
        visible={false}
        presentation={null}
        onPlayAgain={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
