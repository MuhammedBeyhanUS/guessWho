import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import JoinPage from './JoinPage'
import PlayPage from './PlayPage'

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

    expect(screen.getByText(/connecting/i)).toBeInTheDocument()
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
