import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LandingPage from './LandingPage'

describe('LandingPage', () => {
  it('renders Create Game and Join Game buttons', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: /create game/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /join game/i }),
    ).toBeInTheDocument()
  })
})
