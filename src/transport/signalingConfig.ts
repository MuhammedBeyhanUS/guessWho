export type SignalingConfig = {
  wsBaseUrl: string
  httpBaseUrl: string
  key: string
  path: string
}

const DEFAULT_SIGNALING_URL = 'localhost:9000'
const DEFAULT_KEY = 'peerjs'
const DEFAULT_PATH = '/'

export function getSignalingConfig(
  rawUrl = import.meta.env.VITE_SIGNALING_URL ?? DEFAULT_SIGNALING_URL,
): SignalingConfig {
  const normalized = rawUrl.trim()

  if (normalized.startsWith('ws://') || normalized.startsWith('wss://')) {
    const url = new URL(normalized)
    const secure = url.protocol === 'wss:'
    const httpProtocol = secure ? 'https:' : 'http:'
    const path = url.pathname === '/' ? DEFAULT_PATH : url.pathname

    return {
      wsBaseUrl: `${url.protocol}//${url.host}${path}`.replace(/\/$/, ''),
      httpBaseUrl: `${httpProtocol}//${url.host}${path}`.replace(/\/$/, ''),
      key: DEFAULT_KEY,
      path,
    }
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    const url = new URL(normalized)
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    const path = url.pathname === '/' ? DEFAULT_PATH : url.pathname

    return {
      wsBaseUrl: `${wsProtocol}//${url.host}${path}`.replace(/\/$/, ''),
      httpBaseUrl: `${url.protocol}//${url.host}${path}`.replace(/\/$/, ''),
      key: DEFAULT_KEY,
      path,
    }
  }

  return {
    wsBaseUrl: `ws://${normalized}${DEFAULT_PATH}`.replace(/\/$/, ''),
    httpBaseUrl: `http://${normalized}${DEFAULT_PATH}`.replace(/\/$/, ''),
    key: DEFAULT_KEY,
    path: DEFAULT_PATH,
  }
}

export function buildSignalingWebSocketUrl(
  config: SignalingConfig,
  peerId: string,
  token: string,
): string {
  const wsPath = `${config.path}/peerjs`.replace(/\/{2,}/g, '/')
  const params = new URLSearchParams({
    key: config.key,
    id: peerId,
    token,
  })

  return `${config.wsBaseUrl}${wsPath}?${params.toString()}`
}

export function buildSignalingHttpUrl(
  config: SignalingConfig,
  resourcePath: string,
): string {
  const normalizedResource = resourcePath.startsWith('/')
    ? resourcePath
    : `/${resourcePath}`

  return `${config.httpBaseUrl}/${config.key}${normalizedResource}`
}
