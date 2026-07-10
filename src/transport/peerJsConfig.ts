/** Prefix keeps room peer IDs unique on the shared PeerJS cloud broker. */
export const PEER_ID_PREFIX = 'guesswho-'

export type PeerJsBrokerMode = 'cloud' | 'self-hosted'

export type PeerJsOptions = {
  debug: number
  host?: string
  port?: number
  path?: string
  secure?: boolean
}

export type PeerJsBrokerConfig = {
  mode: PeerJsBrokerMode
  options: PeerJsOptions
}

const DEFAULT_KEY_PATH = '/peerjs'

/**
 * Resolves PeerJS client options.
 * Default: PeerJS cloud (`0.peerjs.com`) — no local signaling process required.
 * Override with `VITE_SIGNALING_URL` for self-hosted PeerServer (e.g. `localhost:9000`).
 */
export function getPeerJsBrokerConfig(
  rawUrl = import.meta.env.VITE_SIGNALING_URL,
): PeerJsBrokerConfig {
  const normalized = rawUrl?.trim()

  if (!normalized || normalized === 'cloud') {
    return {
      mode: 'cloud',
      options: { debug: 0 },
    }
  }

  if (normalized.startsWith('ws://') || normalized.startsWith('wss://')) {
    const url = new URL(normalized)
    return {
      mode: 'self-hosted',
      options: {
        debug: 0,
        host: url.hostname,
        port: url.port ? Number(url.port) : url.protocol === 'wss:' ? 443 : 80,
        path: url.pathname === '/' ? DEFAULT_KEY_PATH : url.pathname,
        secure: url.protocol === 'wss:',
      },
    }
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    const url = new URL(normalized)
    return {
      mode: 'self-hosted',
      options: {
        debug: 0,
        host: url.hostname,
        port: url.port
          ? Number(url.port)
          : url.protocol === 'https:'
            ? 443
            : 80,
        path: url.pathname === '/' ? DEFAULT_KEY_PATH : url.pathname,
        secure: url.protocol === 'https:',
      },
    }
  }

  const [host, portText] = normalized.split(':')
  const port = portText ? Number(portText) : 9000

  return {
    mode: 'self-hosted',
    options: {
      debug: 0,
      host,
      port,
      path: DEFAULT_KEY_PATH,
      secure: false,
    },
  }
}
