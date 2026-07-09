const DEFAULT_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [...DEFAULT_STUN_SERVERS]

  const turnUrl = import.meta.env.VITE_TURN_URL
  const turnUsername = import.meta.env.VITE_TURN_USERNAME
  const turnPassword = import.meta.env.VITE_TURN_PASSWORD

  if (turnUrl && turnUsername && turnPassword) {
    servers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnPassword,
    })
  }

  return servers
}

export function createRtcConfiguration(): RTCConfiguration {
  return { iceServers: getIceServers() }
}
