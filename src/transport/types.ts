import type { P2PMessage } from './protocol'

export type ConnectionState =
  'connecting' | 'connected' | 'failed' | 'disconnected'

export type ConnectionStateHandler = (state: ConnectionState) => void
export type MessageHandler = (message: P2PMessage) => void

export interface P2PConnection {
  connectAsHost(roomCode: string): Promise<void>
  connectAsGuest(roomCode: string): Promise<void>
  send(message: P2PMessage): void
  onMessage(handler: MessageHandler): () => void
  onConnectionStateChange(handler: ConnectionStateHandler): () => void
  getConnectionState(): ConnectionState
  close(): void
}
