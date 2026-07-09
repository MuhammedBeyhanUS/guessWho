import {
  buildSignalingHttpUrl,
  buildSignalingWebSocketUrl,
  getSignalingConfig,
  type SignalingConfig,
} from './signalingConfig'

export type SignalingMessageType =
  | 'OPEN'
  | 'LEAVE'
  | 'CANDIDATE'
  | 'OFFER'
  | 'ANSWER'
  | 'EXPIRE'
  | 'HEARTBEAT'
  | 'ID-TAKEN'
  | 'ERROR'

export type SignalingMessage = {
  type: SignalingMessageType
  src?: string
  dst?: string
  payload?: string | { msg?: string }
}

export type SignalingMessageHandler = (message: SignalingMessage) => void

function createToken(): string {
  return crypto.randomUUID()
}

export class SignalingClient {
  private ws: WebSocket | null = null
  private readonly config: SignalingConfig
  private readonly handlers = new Set<SignalingMessageHandler>()
  private readonly WebSocketImpl: typeof WebSocket
  private peerId = ''

  constructor(
    config: SignalingConfig = getSignalingConfig(),
    WebSocketImpl: typeof WebSocket = WebSocket,
  ) {
    this.config = config
    this.WebSocketImpl = WebSocketImpl
  }

  getPeerId(): string {
    return this.peerId
  }

  onMessage(handler: SignalingMessageHandler): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  async connect(peerId: string, token = createToken()): Promise<void> {
    this.peerId = peerId

    const wsUrl = buildSignalingWebSocketUrl(this.config, peerId, token)

    await new Promise<void>((resolve, reject) => {
      const ws = new this.WebSocketImpl(wsUrl)
      this.ws = ws

      ws.onmessage = (event) => {
        const message = parseSignalingMessage(String(event.data))
        if (!message) {
          return
        }

        if (message.type === 'OPEN') {
          resolve()
          return
        }

        if (message.type === 'ID-TAKEN') {
          reject(new Error('Room code is already in use'))
          return
        }

        if (message.type === 'ERROR') {
          reject(new Error(getSignalingErrorMessage(message)))
          return
        }

        this.emit(message)
      }

      ws.onerror = () => {
        reject(new Error('Could not reach the signaling server'))
      }

      ws.onclose = () => {
        if (ws.readyState !== WebSocket.OPEN) {
          reject(new Error('Signaling connection closed'))
        }
      }
    })

    if (!this.ws) {
      throw new Error('Signaling connection failed')
    }

    this.ws.onmessage = (event) => {
      const message = parseSignalingMessage(String(event.data))
      if (message) {
        this.emit(message)
      }
    }

    this.ws.onclose = () => {
      this.emit({ type: 'LEAVE', src: this.peerId })
    }
  }

  send(message: Omit<SignalingMessage, 'src'>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Signaling connection is not open')
    }

    this.ws.send(
      JSON.stringify({
        ...message,
        src: this.peerId,
      }),
    )
  }

  close(): void {
    this.ws?.close()
    this.ws = null
  }

  private emit(message: SignalingMessage): void {
    for (const handler of this.handlers) {
      handler(message)
    }
  }
}

export async function fetchGuestPeerId(
  config: SignalingConfig = getSignalingConfig(),
): Promise<string> {
  const response = await fetch(buildSignalingHttpUrl(config, '/id'))

  if (!response.ok) {
    throw new Error('Could not fetch guest peer id')
  }

  return response.text()
}

function parseSignalingMessage(raw: string): SignalingMessage | null {
  try {
    const parsed = JSON.parse(raw) as SignalingMessage
    if (typeof parsed.type !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function getSignalingErrorMessage(message: SignalingMessage): string {
  if (
    typeof message.payload === 'object' &&
    message.payload !== null &&
    typeof message.payload.msg === 'string'
  ) {
    return message.payload.msg
  }

  return 'Signaling error'
}
