import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ROOM_CODE_CHARSET,
  ROOM_CODE_LENGTH,
  ROOM_CODE_PATTERN,
  generateRoomCode,
  validateRoomCode,
} from './roomCode'

describe('validateRoomCode', () => {
  it('accepts a valid 6-character code', () => {
    expect(validateRoomCode('ABC234')).toEqual({ ok: true, code: 'ABC234' })
  })

  it('normalizes lowercase input to uppercase', () => {
    expect(validateRoomCode('abc234')).toEqual({ ok: true, code: 'ABC234' })
  })

  it('trims surrounding whitespace before validating', () => {
    expect(validateRoomCode('  ABC234  ')).toEqual({
      ok: true,
      code: 'ABC234',
    })
  })

  it('rejects codes shorter than 6 characters', () => {
    const result = validateRoomCode('ABC23')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/6 characters/i)
    }
  })

  it('rejects codes longer than 6 characters', () => {
    const result = validateRoomCode('ABC2345')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/6 characters/i)
    }
  })

  it('rejects codes with excluded characters such as 0, O, 1, and I', () => {
    for (const invalidCode of ['ABC23O', 'ABC230', 'ABC23I', 'ABC231']) {
      const result = validateRoomCode(invalidCode)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message).toMatch(/may only use letters/i)
      }
    }
  })

  it('rejects empty input', () => {
    const result = validateRoomCode('')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/6 characters/i)
    }
  })
})

describe('generateRoomCode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('produces a 6-character code matching the allowed charset', () => {
    const code = generateRoomCode()

    expect(code).toHaveLength(ROOM_CODE_LENGTH)
    expect(code).toMatch(ROOM_CODE_PATTERN)
    for (const char of code) {
      expect(ROOM_CODE_CHARSET).toContain(char)
    }
  })

  it('uses crypto.getRandomValues for randomness', () => {
    const getRandomValues = vi.spyOn(crypto, 'getRandomValues')

    generateRoomCode()

    expect(getRandomValues).toHaveBeenCalledOnce()
    expect(getRandomValues.mock.calls[0]?.[0]).toBeInstanceOf(Uint8Array)
    expect(getRandomValues.mock.calls[0]?.[0]).toHaveLength(ROOM_CODE_LENGTH)
  })
})
