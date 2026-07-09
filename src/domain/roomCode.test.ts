import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ROOM_CODE_CHARSET,
  ROOM_CODE_LENGTH,
  ROOM_CODE_PATTERN,
  generateRoomCode,
} from './roomCode'

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
