import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ChatPanel from './ChatPanel'
import type { ChatDisplayMessage } from '../domain/chat/types'

const opponentMessage: ChatDisplayMessage = {
  id: 'msg-opponent',
  text: 'Good luck!',
  sentAt: 1,
  sender: 'opponent',
}

describe('ChatPanel', () => {
  it('typing and submitting adds message via onSend', () => {
    const onSend = vi.fn()

    render(<ChatPanel messages={[]} onSend={onSend} />)

    const input = screen.getByLabelText('Chat message')
    fireEvent.change(input, { target: { value: 'Hello opponent' } })
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(onSend).toHaveBeenCalledWith('Hello opponent')
  })

  it('sends on Enter key press', () => {
    const onSend = vi.fn()

    render(<ChatPanel messages={[]} onSend={onSend} />)

    const input = screen.getByLabelText('Chat message')
    fireEvent.change(input, { target: { value: 'Ready?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSend).toHaveBeenCalledWith('Ready?')
  })

  it('does not send empty or whitespace-only messages', () => {
    const onSend = vi.fn()

    render(<ChatPanel messages={[]} onSend={onSend} />)

    const input = screen.getByLabelText('Chat message')
    fireEvent.change(input, { target: { value: '   ' } })

    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()

    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(onSend).not.toHaveBeenCalled()
  })

  it('renders incoming opponent messages on the opponent side', () => {
    render(<ChatPanel messages={[opponentMessage]} onSend={vi.fn()} />)

    const message = screen.getByText('Good luck!')
    expect(message).toHaveAttribute('data-sender', 'opponent')
    expect(message.className).toContain('messageOpponent')
  })

  it('renders self messages with self styling', () => {
    const selfMessage: ChatDisplayMessage = {
      id: 'msg-self',
      text: 'Let us play',
      sentAt: 2,
      sender: 'self',
    }

    render(<ChatPanel messages={[selfMessage]} onSend={vi.fn()} />)

    const message = screen.getByText('Let us play')
    expect(message).toHaveAttribute('data-sender', 'self')
    expect(message.className).toContain('messageSelf')
  })

  it('renders system game log messages with centered styling', () => {
    const gameMessage: ChatDisplayMessage = {
      id: 'msg-game',
      text: 'Opponent answered: Yes',
      sentAt: 3,
      sender: 'system',
      kind: 'game',
    }

    render(<ChatPanel messages={[gameMessage]} onSend={vi.fn()} />)

    const message = screen.getByText('Opponent answered: Yes')
    expect(message).toHaveAttribute('data-sender', 'system')
    expect(message).toHaveAttribute('data-kind', 'game')
    expect(message.className).toContain('messageSystem')
  })
})
