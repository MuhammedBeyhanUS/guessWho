import { describe, expect, it } from 'vitest'
import {
  CHARACTERS,
  getCharacterById,
  getCharacterTrait,
  hasTrait,
} from './characters'

describe('characters roster', () => {
  it('has 24 characters with unique ids', () => {
    expect(CHARACTERS).toHaveLength(24)
    const ids = CHARACTERS.map((character) => character.id)
    expect(new Set(ids).size).toBe(24)
  })

  it('returns expected traits for sample characters', () => {
    expect(getCharacterTrait('marco', 'glasses')).toBe(true)
    expect(getCharacterTrait('marco', 'hairColor')).toBe('black')
    expect(getCharacterTrait('theo', 'hat')).toBe(true)
    expect(getCharacterTrait('owen', 'facialHair')).toBe(true)
    expect(getCharacterTrait('sam', 'hairColor')).toBe('bald')
  })

  it('looks up characters by id', () => {
    expect(getCharacterById('eleni')?.name).toBe('Eleni')
    expect(getCharacterById('missing')).toBeUndefined()
  })

  it('reports boolean traits via hasTrait', () => {
    expect(hasTrait('fatima', 'glasses')).toBe(true)
    expect(hasTrait('priya', 'glasses')).toBe(false)
  })

  it('uses original names not Hasbro roster names', () => {
    const names = CHARACTERS.map((character) => character.name.toLowerCase())
    const hasbroNames = ['alex', 'bernard', 'claire', 'eric', 'frans']
    for (const hasbroName of hasbroNames) {
      expect(names).not.toContain(hasbroName)
    }
  })
})
