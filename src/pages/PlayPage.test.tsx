import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PlayPage from './PlayPage'

const useP2PConnectionMock = vi.fn()

vi.mock('../transport/useP2PConnection', () => ({
  useP2PConnection: (...args: unknown[]) => useP2PConnectionMock(...args),
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

function renderHostPlayPage(roomCode = 'ABC234') {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: `/play/${roomCode}`, state: { isHost: true } },
      ]}
    >
      <Routes>
        <Route path="/play/:roomCode" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderGuestPlayPage(roomCode = 'ABC234') {
  return render(
    <MemoryRouter initialEntries={[`/play/${roomCode}`]}>
      <Routes>
        <Route path="/play/:roomCode" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PlayPage host create view', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    useP2PConnectionMock.mockReset()
  })

  it('renders room code, shareable URL, Copy Link, and Share buttons', () => {
    useP2PConnectionMock.mockReturnValue({
      connectionState: 'connecting',
      errorMessage: null,
      retry: vi.fn(),
      send: vi.fn(),
      onMessage: vi.fn(() => () => {}),
    })

    renderHostPlayPage('XYZ789')

    expect(screen.getByText('XYZ789')).toBeInTheDocument()
    expect(
      screen.getByText('http://localhost:3000/play/XYZ789'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /copy link/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    expect(screen.getByText(/waiting for opponent/i)).toBeInTheDocument()
  })

  it('copies the shareable URL when Copy Link is clicked', async () => {
    useP2PConnectionMock.mockReturnValue({
      connectionState: 'connecting',
      errorMessage: null,
      retry: vi.fn(),
      send: vi.fn(),
      onMessage: vi.fn(() => () => {}),
    })

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    renderHostPlayPage('ABC234')

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'http://localhost:3000/play/ABC234',
      )
    })
    expect(screen.getByText('Link copied!')).toBeInTheDocument()
  })

  it('shows connected status when peer joins', () => {
    useP2PConnectionMock.mockReturnValue({
      connectionState: 'connected',
      errorMessage: null,
      retry: vi.fn(),
      send: vi.fn(),
      onMessage: vi.fn(() => () => {}),
    })

    renderHostPlayPage()

    expect(screen.getByText(/opponent connected/i)).toBeInTheDocument()
    expect(
      screen.getByText(/connection status: connected/i),
    ).toBeInTheDocument()
  })

  it('shows retry when connection fails', () => {
    const retry = vi.fn()
    useP2PConnectionMock.mockReturnValue({
      connectionState: 'failed',
      errorMessage: 'Could not reach the signaling server',
      retry,
      send: vi.fn(),
      onMessage: vi.fn(() => () => {}),
    })

    renderHostPlayPage()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not reach the signaling server',
    )
    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))
    expect(retry).toHaveBeenCalled()
  })
})

describe('PlayPage guest join view', () => {
  afterEach(() => {
    useP2PConnectionMock.mockReset()
  })

  it('shows Connecting state when opened directly without isHost', () => {
    useP2PConnectionMock.mockReturnValue({
      connectionState: 'connecting',
      errorMessage: null,
      retry: vi.fn(),
      send: vi.fn(),
      onMessage: vi.fn(() => () => {}),
    })

    renderGuestPlayPage('XYZ789')

    expect(screen.getByText('XYZ789')).toBeInTheDocument()
    expect(
      screen.getAllByText(/connecting to opponent/i).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText(/preview the character board/i),
    ).not.toBeInTheDocument()
  })
})
