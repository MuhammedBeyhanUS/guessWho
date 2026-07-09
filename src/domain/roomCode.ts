export const ROOM_CODE_LENGTH = 6

/** A–Z and 2–9 only; excludes 0/O/1/I for readability. */
export const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const ROOM_CODE_PATTERN = new RegExp(
  `^[${ROOM_CODE_CHARSET}]{${ROOM_CODE_LENGTH}}$`,
)

export function generateRoomCode(): string {
  const values = new Uint8Array(ROOM_CODE_LENGTH)
  crypto.getRandomValues(values)

  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARSET[values[i]! % ROOM_CODE_CHARSET.length]
  }
  return code
}

export function getShareableUrl(roomCode: string): string {
  return `${window.location.origin}/play/${roomCode}`
}
