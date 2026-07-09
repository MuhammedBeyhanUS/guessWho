import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CharacterBoard from './CharacterBoard'
import { CHARACTERS } from '../domain/characters'
import { cardBackUrl, characterPortraitUrls } from '../assets/characters'

describe('CharacterBoard', () => {
  it('renders all 24 tiles with portrait assets', () => {
    render(<CharacterBoard />)

    for (const character of CHARACTERS) {
      const img = screen.getByRole('img', { name: character.name })
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', characterPortraitUrls[character.id])
    }
  })

  it('shows card-back when a tile is clicked in flip mode', () => {
    render(<CharacterBoard />)

    const eleniButton = screen.getByRole('button', { name: /eleni/i })
    fireEvent.click(eleniButton)

    expect(eleniButton.className).toContain('flipped')
    expect(eleniButton).toHaveAttribute('aria-pressed', 'true')
    const cardBackImage = eleniButton.querySelector(`img[src="${cardBackUrl}"]`)
    expect(cardBackImage).toBeTruthy()
  })

  it('selects one character in selection mode', () => {
    render(<CharacterBoard selectionMode />)

    fireEvent.click(screen.getByRole('button', { name: /marco/i }))
    expect(screen.getByRole('button', { name: /marco/i }).className).toContain(
      'tileSelected',
    )

    const theoButton = screen.getByRole('button', { name: /theo/i })
    expect(theoButton).toBeDisabled()
  })
})
