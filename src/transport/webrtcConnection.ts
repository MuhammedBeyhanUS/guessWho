import { createRtcConfiguration } from './iceConfig'
import {
  deserializeP2PMessage,
  serializeP2PMessage,
  type P2PMessage,
} from './protocol'
import {
  fetchGuestPeerId,
  SignalingClient,
  type SignalingMessage,
} from './signalingClient'
import { getSignalingConfig } from './signalingConfig'
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

type WebRtcGlobals = {
  RTCPeerConnection: typeof RTCPeerConnection
  WebSocket: typeof WebSocket
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>
}

function getWebRtcGlobals(): WebRtcGlobals {
  return {
    RTCPeerConnection: globalThis.RTCPeerConnection,
    WebSocket: globalThis.WebSocket,
    getUserMedia: (constraints) =>
      navigator.mediaDevices.getUserMedia(constraints),
  }
}

export class WebRtcP2PConnection implements P2PConnection {
  private state: ConnectionState = 'disconnected'
  private pc: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private signaling: SignalingClient | null = null
  private remotePeerId = ''
  private localStream: MediaStream | null = null
  private localAudioTrack: MediaStreamTrack | null = null
  private voicePermission: VoicePermissionState = 'pending'
  private muted = false
  private readonly messageHandlers = new Set<MessageHandler>()
  private readonly stateHandlers = new Set<ConnectionStateHandler>()
  private readonly remoteStreamHandlers = new Set<RemoteStreamHandler>()
  private readonly voicePermissionHandlers = new Set<VoicePermissionHandler>()
  private readonly rtcGlobals: WebRtcGlobals
  private removeSignalingListener: (() => void) | null = null

  constructor(rtcGlobals: WebRtcGlobals = getWebRtcGlobals()) {
    this.rtcGlobals = rtcGlobals
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

  async connectAsHost(roomCode: string): Promise<void> {
    await this.startConnection('host', roomCode, roomCode)
  }

  async connectAsGuest(roomCode: string): Promise<void> {
    const guestId = await fetchGuestPeerId()
    await this.startConnection('guest', guestId, roomCode)

    const pc = this.requirePeerConnection()
    const channel = pc.createDataChannel(DATA_CHANNEL_LABEL, { ordered: true })
    this.attachDataChannel(channel)

    await this.setupLocalAudio(pc)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    this.sendSignaling({
      type: 'OFFER',
      dst: roomCode,
      payload: JSON.stringify(offer),
    })
  }

  send(message: P2PMessage): void {
    const channel = this.dataChannel
    if (!channel || channel.readyState !== 'open') {
      throw new Error('Data channel is not open')
    }

    channel.send(serializeP2PMessage(message))
  }

  close(): void {
    this.removeSignalingListener?.()
    this.removeSignalingListener = null
    this.dataChannel?.close()
    this.pc?.close()
    this.signaling?.close()
    this.stopLocalStream()
    this.dataChannel = null
    this.pc = null
    this.signaling = null
    this.setState('disconnected')
  }

  private async startConnection(
    role: 'host' | 'guest',
    localPeerId: string,
    remotePeerId: string,
  ): Promise<void> {
    this.close()
    this.setState('connecting')
    this.remotePeerId = remotePeerId

    const signaling = new SignalingClient(
      getSignalingConfig(),
      this.rtcGlobals.WebSocket,
    )
    this.signaling = signaling

    try {
      await signaling.connect(localPeerId)
    } catch (error) {
      this.setState('failed')
      throw error
    }

    const pc = new this.rtcGlobals.RTCPeerConnection(createRtcConfiguration())
    this.pc = pc
    this.setupPeerConnectionListeners(pc)

    if (role === 'host') {
      await this.setupLocalAudio(pc)
    }

    this.removeSignalingListener = signaling.onMessage((message) => {
      void this.handleSignalingMessage(message, role)
    })
  }

  private async setupLocalAudio(pc: RTCPeerConnection): Promise<void> {
    const getUserMedia = this.rtcGlobals.getUserMedia
    if (!getUserMedia) {
      this.setVoicePermission('denied')
      return
    }

    try {
      const stream = await getUserMedia({ audio: true })
      const track = stream.getAudioTracks()[0] ?? null
      this.localStream = stream
      this.localAudioTrack = track

      if (track) {
        pc.addTrack(track, stream)
        setTrackMuted(track, this.muted)
      }

      this.setVoicePermission('granted')
    } catch {
      this.setVoicePermission('denied')
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

  private setupPeerConnectionListeners(pc: RTCPeerConnection): void {
    pc.onicecandidate = (event) => {
      if (!event.candidate || !this.remotePeerId) {
        return
      }

      this.sendSignaling({
        type: 'CANDIDATE',
        dst: this.remotePeerId,
        payload: JSON.stringify(event.candidate.toJSON()),
      })
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        if (this.dataChannel?.readyState === 'open') {
          this.setState('connected')
        }
        return
      }

      if (pc.connectionState === 'failed') {
        this.setState('failed')
      }

      if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'closed'
      ) {
        this.setState('disconnected')
      }
    }

    pc.ondatachannel = (event) => {
      this.attachDataChannel(event.channel)
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0]
      if (stream) {
        this.notifyRemoteStream(stream)
      }
    }
  }

  private attachDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel

    channel.onopen = () => {
      this.setState('connected')
    }

    channel.onclose = () => {
      this.setState('disconnected')
    }

    channel.onerror = () => {
      this.setState('failed')
    }

    channel.onmessage = (event) => {
      const message = deserializeP2PMessage(String(event.data))
      if (!message) {
        return
      }

      for (const handler of this.messageHandlers) {
        handler(message)
      }
    }
  }

  private async handleSignalingMessage(
    message: SignalingMessage,
    role: 'host' | 'guest',
  ): Promise<void> {
    if (message.type === 'LEAVE' && message.src === this.remotePeerId) {
      this.setState('disconnected')
      return
    }

    if (typeof message.payload !== 'string') {
      return
    }

    const pc = this.pc
    if (!pc) {
      return
    }

    try {
      if (message.type === 'OFFER' && role === 'host') {
        this.remotePeerId = message.src ?? this.remotePeerId
        const offer = JSON.parse(message.payload) as RTCSessionDescriptionInit
        await pc.setRemoteDescription(offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        this.sendSignaling({
          type: 'ANSWER',
          dst: this.remotePeerId,
          payload: JSON.stringify(answer),
        })
        return
      }

      if (message.type === 'ANSWER' && role === 'guest') {
        const answer = JSON.parse(message.payload) as RTCSessionDescriptionInit
        await pc.setRemoteDescription(answer)
        return
      }

      if (message.type === 'CANDIDATE') {
        const candidate = JSON.parse(message.payload) as RTCIceCandidateInit
        await pc.addIceCandidate(candidate)
      }
    } catch {
      this.setState('failed')
    }
  }

  private sendSignaling(message: Omit<SignalingMessage, 'src'>): void {
    this.signaling?.send(message)
  }

  private requirePeerConnection(): RTCPeerConnection {
    if (!this.pc) {
      throw new Error('Peer connection is not initialized')
    }

    return this.pc
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

export function createP2PConnection(): P2PConnection {
  return new WebRtcP2PConnection()
}
