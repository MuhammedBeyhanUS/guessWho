import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PlayPage from './PlayPage'

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

describe('PlayPage host create view', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders room code, shareable URL, Copy Link, and Share buttons', () => {
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
    expect(screen.getByRole('status')).toHaveTextContent('Link copied!')
  })
})
