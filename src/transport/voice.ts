export function setTrackMuted(track: MediaStreamTrack, muted: boolean): void {
  track.enabled = !muted
}

export function isTrackMuted(track: MediaStreamTrack): boolean {
  return !track.enabled
}
