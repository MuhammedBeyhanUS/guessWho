import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import JoinPage from './JoinPage'
import PlayPage from './PlayPage'

vi.mock('../transport/useP2PConnection', () => ({
  useP2PConnection: () => ({
    connectionState: 'connecting',
    errorMessage: null,
    retry: vi.fn(),
    send: vi.fn(),
    onMessage: vi.fn(() => () => {}),
  }),
  getConnectionStatusLabel: (state: string) => {
    switch (state) {
      case 'connecting':
        return 'Connecting to opponent…'
      case 'connected':
        return 'Connected'
      case 'failed':
        return 'Connection failed'
      case 'disconnected':
        return 'Disconnected'
      default:
        return state
    }
  },
}))

function renderJoinPage(initialEntry = '/join') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/join" element={<JoinPage />} />
        <Route path="/play/:roomCode" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('JoinPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders room code input and Join button', () => {
    renderJoinPage()

    expect(screen.getByLabelText(/room code/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument()
  })

  it('submits a valid code and navigates to the play route as guest', () => {
    renderJoinPage()

    fireEvent.change(screen.getByLabelText(/room code/i), {
      target: { value: 'abc234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /join/i }))

    expect(screen.getAllByText(/connecting/i).length).toBeGreaterThan(0)
    expect(screen.getByText('ABC234')).toBeInTheDocument()
    expect(
      screen.queryByText(/preview the character board/i),
    ).not.toBeInTheDocument()
  })

  it('shows an inline validation error for an invalid code', () => {
    renderJoinPage()

    fireEvent.change(screen.getByLabelText(/room code/i), {
      target: { value: 'BAD' },
    })
    fireEvent.click(screen.getByRole('button', { name: /join/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/6 characters/i)
    expect(screen.getByText(/enter a room code/i)).toBeInTheDocument()
  })
})
