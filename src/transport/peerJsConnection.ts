import Peer, { type DataConnection, type MediaConnection } from 'peerjs'
import { toPeerId } from '../domain/roomCode'
import { deserializeP2PMessage, serializeP2PMessage } from './protocol'
import { getPeerJsBrokerConfig } from './peerJsConfig'
import type {
  ConnectionState,
  ConnectionStateHandler,
  MessageHandler,
  P2PConnection,
  RemoteStreamHandler,
  VoicePermissionHandler,
  VoicePermissionState,
} from './types'
import { setTrackMuted } from './voice'

const DATA_CHANNEL_LABEL = 'game'

type PeerJsGlobals = {
  Peer: typeof Peer
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>
}

function getPeerJsGlobals(): PeerJsGlobals {
  return {
    Peer,
    getUserMedia: (constraints) =>
      navigator.mediaDevices.getUserMedia(constraints),
  }
}

export class PeerJsP2PConnection implements P2PConnection {
  private state: ConnectionState = 'disconnected'
  private peer: Peer | null = null
  private dataConnection: DataConnection | null = null
  private mediaCall: MediaConnection | null = null
  private localStream: MediaStream | null = null
  private localAudioTrack: MediaStreamTrack | null = null
  private voicePermission: VoicePermissionState = 'pending'
  private muted = false
  private hostPeerId = ''
  private readonly messageHandlers = new Set<MessageHandler>()
  private readonly stateHandlers = new Set<ConnectionStateHandler>()
  private readonly remoteStreamHandlers = new Set<RemoteStreamHandler>()
  private readonly voicePermissionHandlers = new Set<VoicePermissionHandler>()
  private readonly globals: PeerJsGlobals

  constructor(globals: PeerJsGlobals = getPeerJsGlobals()) {
    this.globals = globals
  }

  getConnectionState(): ConnectionState {
    return this.state
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.stateHandlers.add(handler)
    return () => {
      this.stateHandlers.delete(handler)
    }
  }

  getVoicePermission(): VoicePermissionState {
    return this.voicePermission
  }

  isMuted(): boolean {
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.localAudioTrack) {
      setTrackMuted(this.localAudioTrack, muted)
    }
  }

  onRemoteStream(handler: RemoteStreamHandler): () => void {
    this.remoteStreamHandlers.add(handler)
    return () => {
      this.remoteStreamHandlers.delete(handler)
    }
  }

  onVoicePermissionChange(handler: VoicePermissionHandler): () => void {
    this.voicePermissionHandlers.add(handler)
    return () => {
      this.voicePermissionHandlers.delete(handler)
    }
  }

  connectAsHost(roomCode: string): Promise<void> {
    this.close()
    this.setState('connecting')
    this.hostPeerId = toPeerId(roomCode)

    return new Promise((resolve, reject) => {
      const peer = new this.globals.Peer(
        this.hostPeerId,
        getPeerJsBrokerConfig().options,
      )
      this.peer = peer

      peer.on('open', () => {
        void this.setupLocalAudio().then(() => {
          this.listenForVoiceCalls(peer)
        })
      })

      peer.on('connection', (connection) => {
        this.attachDataConnection(connection, resolve)
      })

      peer.on('error', (error) => {
        this.setState('failed')
        reject(normalizePeerError(error))
      })
    })
  }

  connectAsGuest(roomCode: string): Promise<void> {
    this.close()
    this.setState('connecting')
    this.hostPeerId = toPeerId(roomCode)

    return new Promise((resolve, reject) => {
      const peer = new this.globals.Peer(getPeerJsBrokerConfig().options)
      this.peer = peer

      peer.on('open', () => {
        void (async () => {
          await this.setupLocalAudio()
          const connection = peer.connect(this.hostPeerId, {
            reliable: true,
            label: DATA_CHANNEL_LABEL,
          })
          this.attachDataConnection(connection, resolve)
          this.callHost(peer)
        })().catch((error: unknown) => {
          this.setState('failed')
          reject(error instanceof Error ? error : new Error(String(error)))
        })
      })

      peer.on('error', (error) => {
        this.setState('failed')
        reject(normalizePeerError(error))
      })
    })
  }

  send(message: Parameters<P2PConnection['send']>[0]): void {
    const connection = this.dataConnection
    if (!connection?.open) {
      throw new Error('Data channel is not open')
    }

    connection.send(serializeP2PMessage(message))
  }

  close(): void {
    this.dataConnection?.close()
    this.mediaCall?.close()
    this.peer?.destroy()
    this.stopLocalStream()
    this.dataConnection = null
    this.mediaCall = null
    this.peer = null
    this.hostPeerId = ''
    this.setState('disconnected')
  }

  private attachDataConnection(
    connection: DataConnection,
    onOpen?: () => void,
  ): void {
    this.dataConnection = connection

    connection.on('open', () => {
      this.setState('connected')
      onOpen?.()
    })

    connection.on('close', () => {
      this.setState('disconnected')
    })

    connection.on('error', () => {
      this.setState('failed')
    })

    connection.on('data', (raw) => {
      const message = deserializeP2PMessage(String(raw))
      if (!message) {
        return
      }

      for (const handler of this.messageHandlers) {
        handler(message)
      }
    })
  }

  private listenForVoiceCalls(peer: Peer): void {
    peer.on('call', (call) => {
      this.mediaCall = call
      const stream = this.localStream
      if (stream) {
        call.answer(stream)
      } else {
        void this.setupLocalAudio().then((answeredStream) => {
          if (answeredStream) {
            call.answer(answeredStream)
          }
        })
      }

      call.on('stream', (remoteStream) => {
        this.notifyRemoteStream(remoteStream)
      })
    })
  }

  private callHost(peer: Peer): void {
    const stream = this.localStream
    if (!stream || !this.hostPeerId) {
      return
    }

    const call = peer.call(this.hostPeerId, stream)
    if (!call) {
      return
    }

    this.mediaCall = call
    call.on('stream', (remoteStream) => {
      this.notifyRemoteStream(remoteStream)
    })
  }

  private async setupLocalAudio(): Promise<MediaStream | null> {
    const getUserMedia = this.globals.getUserMedia
    if (!getUserMedia) {
      this.setVoicePermission('denied')
      return null
    }

    if (this.localStream) {
      return this.localStream
    }

    try {
      const stream = await getUserMedia({ audio: true })
      const track = stream.getAudioTracks()[0] ?? null
      this.localStream = stream
      this.localAudioTrack = track

      if (track) {
        setTrackMuted(track, this.muted)
      }

      this.setVoicePermission('granted')
      return stream
    } catch {
      this.setVoicePermission('denied')
      return null
    }
  }

  private stopLocalStream(): void {
    for (const track of this.localStream?.getTracks() ?? []) {
      track.stop()
    }

    this.localStream = null
    this.localAudioTrack = null
    this.setVoicePermission('pending')
  }

  private setVoicePermission(nextState: VoicePermissionState): void {
    if (this.voicePermission === nextState) {
      return
    }

    this.voicePermission = nextState

    for (const handler of this.voicePermissionHandlers) {
      handler(nextState)
    }
  }

  private notifyRemoteStream(stream: MediaStream): void {
    for (const handler of this.remoteStreamHandlers) {
      handler(stream)
    }
  }

  private setState(nextState: ConnectionState): void {
    if (this.state === nextState) {
      return
    }

    this.state = nextState

    for (const handler of this.stateHandlers) {
      handler(nextState)
    }
  }
}

function normalizePeerError(error: unknown): Error {
  if (error instanceof Error) {
    if (
      error.message.includes('taken') ||
      error.message.includes('unavailable')
    ) {
      return new Error('Room code is already in use')
    }

    if (error.message.includes('Could not connect')) {
      return new Error('Could not connect to your opponent. Please try again.')
    }

    return error
  }

  return new Error('Could not connect to your opponent. Please try again.')
}

export function createP2PConnection(): P2PConnection {
  return new PeerJsP2PConnection()
}
