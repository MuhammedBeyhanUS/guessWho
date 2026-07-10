export const ROOM_CODE_LENGTH = 6

/** A–Z and 2–9 only; excludes 0/O/1/I for readability. */
export const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const ROOM_CODE_PATTERN = new RegExp(
  `^[${ROOM_CODE_CHARSET}]{${ROOM_CODE_LENGTH}}$`,
)

export type RoomCodeValidationResult =
  { ok: true; code: string } | { ok: false; message: string }

export function validateRoomCode(code: string): RoomCodeValidationResult {
  const normalized = code.trim().toUpperCase()

  if (normalized.length !== ROOM_CODE_LENGTH) {
    return {
      ok: false,
      message: `Room code must be exactly ${ROOM_CODE_LENGTH} characters.`,
    }
  }

  if (!ROOM_CODE_PATTERN.test(normalized)) {
    return {
      ok: false,
      message:
        'Room code may only use letters A–Z and digits 2–9 (no 0, O, 1, or I).',
    }
  }

  return { ok: true, code: normalized }
}

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

/** Maps a room code to the PeerJS peer id used on the signaling broker. */
export function toPeerId(roomCode: string): string {
  const result = validateRoomCode(roomCode)
  if (!result.ok) {
    throw new Error(result.message)
  }

  return `guesswho-${result.code}`
}
