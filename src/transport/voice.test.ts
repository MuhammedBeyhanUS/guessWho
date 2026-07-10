import { describe, expect, it } from 'vitest'
import { isTrackMuted, setTrackMuted } from './voice'

function createMockTrack(enabled = true): MediaStreamTrack {
  return { enabled } as MediaStreamTrack
}

describe('voice track mute', () => {
  it('setTrackMuted(true) disables the track', () => {
    const track = createMockTrack(true)

    setTrackMuted(track, true)

    expect(track.enabled).toBe(false)
    expect(isTrackMuted(track)).toBe(true)
  })

  it('setTrackMuted(false) enables the track', () => {
    const track = createMockTrack(false)

    setTrackMuted(track, false)

    expect(track.enabled).toBe(true)
    expect(isTrackMuted(track)).toBe(false)
  })

  it('toggle mute preserves connection by only changing enabled', () => {
    const track = createMockTrack(true)

    setTrackMuted(track, true)
    expect(track.enabled).toBe(false)

    setTrackMuted(track, false)
    expect(track.enabled).toBe(true)
  })
})
