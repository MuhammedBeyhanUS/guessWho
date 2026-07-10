import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebRtcP2PConnection } from './webrtcConnection'
import type { ConnectionState } from './types'

class MockWebSocket {
  static instances: MockWebSocket[] = []
  static nextConnectError: Error | null = null
  static nextServerMessages: Array<Record<string, unknown>> = []

  readonly sent: string[] = []
  readyState = 0
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null

  constructor(_url: string) {
    MockWebSocket.instances.push(this)

    if (MockWebSocket.nextConnectError) {
      queueMicrotask(() => {
        this.onerror?.()
        this.onclose?.()
      })
      return
    }

    queueMicrotask(() => {
      this.readyState = 1
      this.onmessage?.({ data: JSON.stringify({ type: 'OPEN' }) })

      for (const message of MockWebSocket.nextServerMessages) {
        this.onmessage?.({ data: JSON.stringify(message) })
      }
    })
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3
    this.onclose?.()
  }

  static reset(): void {
    MockWebSocket.instances = []
    MockWebSocket.nextConnectError = null
    MockWebSocket.nextServerMessages = []
  }
}

class MockDataChannel {
  readyState: RTCDataChannelState = 'connecting'
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null

  open(): void {
    this.readyState = 'open'
    this.onopen?.()
  }

  close(): void {
    this.readyState = 'closed'
    this.onclose?.()
  }

  send(): void {}
}

class MockMediaStreamTrack {
  enabled = true
  stop = vi.fn()
}

class MockMediaStream {
  private readonly tracks: MockMediaStreamTrack[]

  constructor(tracks: MockMediaStreamTrack[] = [new MockMediaStreamTrack()]) {
    this.tracks = tracks
  }

  getAudioTracks(): MockMediaStreamTrack[] {
    return this.tracks
  }

  getTracks(): MockMediaStreamTrack[] {
    return this.tracks
  }
}

class MockPeerConnection {
  static instances: MockPeerConnection[] = []

  connectionState: RTCPeerConnectionState = 'new'
  onconnectionstatechange: (() => void) | null = null
  onicecandidate:
    ((event: { candidate: RTCIceCandidate | null }) => void) | null = null
  ondatachannel: ((event: { channel: MockDataChannel }) => void) | null = null
  ontrack:
    | ((event: {
        streams: MockMediaStream[]
        track: MockMediaStreamTrack
      }) => void)
    | null = null

  localDescription: RTCSessionDescriptionInit | null = null
  remoteDescription: RTCSessionDescriptionInit | null = null
  readonly dataChannels: MockDataChannel[] = []
  readonly addedTracks: Array<{
    track: MockMediaStreamTrack
    stream: MockMediaStream
  }> = []

  constructor(_config?: RTCConfiguration) {
    MockPeerConnection.instances.push(this)
  }

  createDataChannel(
    _label: string,
    _options?: RTCDataChannelInit,
  ): MockDataChannel {
    const channel = new MockDataChannel()
    this.dataChannels.push(channel)
    return channel
  }

  addTrack(track: MockMediaStreamTrack, stream: MockMediaStream): void {
    this.addedTracks.push({ track, stream })
  }

  emitRemoteTrack(stream: MockMediaStream): void {
    const track = stream.getAudioTracks()[0]
    this.ontrack?.({ streams: [stream], track })
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'offer', sdp: 'mock-offer' }
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'answer', sdp: 'mock-answer' }
  }

  async setLocalDescription(
    description: RTCSessionDescriptionInit,
  ): Promise<void> {
    this.localDescription = description
  }

  async setRemoteDescription(
    description: RTCSessionDescriptionInit,
  ): Promise<void> {
    this.remoteDescription = description
  }

  async addIceCandidate(_candidate: RTCIceCandidateInit): Promise<void> {}

  close(): void {
    this.connectionState = 'closed'
    this.onconnectionstatechange?.()
  }

  setConnectionState(state: RTCPeerConnectionState): void {
    this.connectionState = state
    this.onconnectionstatechange?.()
  }

  static reset(): void {
    MockPeerConnection.instances = []
  }
}

function createConnection(options?: {
  getUserMediaError?: Error
  getUserMediaStream?: MockMediaStream
}) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: async () => 'guest-peer-id',
  }) as typeof fetch

  const stream = options?.getUserMediaStream ?? new MockMediaStream()
  const getUserMedia = options?.getUserMediaError
    ? vi.fn().mockRejectedValue(options.getUserMediaError)
    : vi.fn().mockResolvedValue(stream)

  return {
    connection: new WebRtcP2PConnection({
      RTCPeerConnection:
        MockPeerConnection as unknown as typeof RTCPeerConnection,
      WebSocket: MockWebSocket as unknown as typeof WebSocket,
      getUserMedia,
    }),
    getUserMedia,
    stream,
  }
}

function collectStates(connection: WebRtcP2PConnection): ConnectionState[] {
  const states: ConnectionState[] = []
  connection.onConnectionStateChange((state) => {
    states.push(state)
  })
  return states
}

describe('WebRtcP2PConnection state machine', () => {
  afterEach(() => {
    MockWebSocket.reset()
    MockPeerConnection.reset()
    vi.restoreAllMocks()
  })

  it('transitions connecting -> connected for guest when data channel opens', async () => {
    const { connection } = createConnection()
    const states = collectStates(connection)

    await connection.connectAsGuest('ABC234')

    const pc = MockPeerConnection.instances[0]
    const channel = pc.dataChannels[0]
    channel.open()

    expect(states).toContain('connecting')
    expect(states).toContain('connected')
    expect(connection.getConnectionState()).toBe('connected')
  })

  it('transitions connecting -> connected for host after offer/answer exchange', async () => {
    const { connection } = createConnection()
    const states = collectStates(connection)

    await connection.connectAsHost('ABC234')

    const hostPc = MockPeerConnection.instances[0]
    const channel = new MockDataChannel()
    hostPc.ondatachannel?.({ channel })

    MockWebSocket.instances[0].onmessage?.({
      data: JSON.stringify({
        type: 'OFFER',
        src: 'guest-peer-id',
        payload: JSON.stringify({ type: 'offer', sdp: 'guest-offer' }),
      }),
    })

    await vi.waitFor(() => {
      expect(hostPc.remoteDescription?.sdp).toBe('guest-offer')
    })

    channel.open()

    expect(states).toContain('connecting')
    expect(states).toContain('connected')
  })

  it('transitions to failed when signaling connection fails', async () => {
    MockWebSocket.nextConnectError = new Error('offline')
    const { connection } = createConnection()
    const states = collectStates(connection)

    await expect(connection.connectAsHost('ABC234')).rejects.toThrow()
    expect(states).toContain('connecting')
    expect(states).toContain('failed')
  })

  it('transitions to disconnected when peer leaves', async () => {
    const { connection } = createConnection()
    const states = collectStates(connection)

    await connection.connectAsGuest('ABC234')
    MockPeerConnection.instances[0].dataChannels[0].open()

    MockWebSocket.instances[0].onmessage?.({
      data: JSON.stringify({
        type: 'LEAVE',
        src: 'ABC234',
      }),
    })

    expect(states).toContain('disconnected')
  })

  it('transitions to failed when peer connection fails', async () => {
    const { connection } = createConnection()
    const states = collectStates(connection)

    await connection.connectAsGuest('ABC234')
    const pc = MockPeerConnection.instances[0]
    pc.dataChannels[0].open()
    pc.setConnectionState('failed')

    expect(states).toContain('failed')
  })
})

describe('WebRtcP2PConnection voice', () => {
  afterEach(() => {
    MockWebSocket.reset()
    MockPeerConnection.reset()
    vi.restoreAllMocks()
  })

  it('requests microphone and adds audio track before guest offer', async () => {
    const track = new MockMediaStreamTrack()
    const stream = new MockMediaStream([track])
    const { connection, getUserMedia } = createConnection({
      getUserMediaStream: stream,
    })

    await connection.connectAsGuest('ABC234')

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(MockPeerConnection.instances[0].addedTracks).toEqual([
      { track, stream },
    ])
    expect(connection.getVoicePermission()).toBe('granted')
  })

  it('continues connection when microphone permission is denied', async () => {
    const { connection } = createConnection({
      getUserMediaError: new DOMException('denied', 'NotAllowedError'),
    })

    await connection.connectAsGuest('ABC234')
    MockPeerConnection.instances[0].dataChannels[0].open()

    expect(connection.getVoicePermission()).toBe('denied')
    expect(connection.getConnectionState()).toBe('connected')
  })

  it('setMuted toggles local track enabled without closing connection', async () => {
    const track = new MockMediaStreamTrack()
    const { connection } = createConnection({
      getUserMediaStream: new MockMediaStream([track]),
    })

    await connection.connectAsGuest('ABC234')

    connection.setMuted(true)
    expect(track.enabled).toBe(false)
    expect(connection.isMuted()).toBe(true)

    connection.setMuted(false)
    expect(track.enabled).toBe(true)
    expect(connection.isMuted()).toBe(false)
    expect(connection.getConnectionState()).toBe('connecting')
  })

  it('notifies remote stream listeners from ontrack', async () => {
    const { connection } = createConnection()
    const remoteStream = new MockMediaStream()
    const received: MockMediaStream[] = []

    connection.onRemoteStream((stream) => {
      received.push(stream as unknown as MockMediaStream)
    })

    await connection.connectAsGuest('ABC234')
    MockPeerConnection.instances[0].emitRemoteTrack(remoteStream)

    expect(received).toEqual([remoteStream])
  })
})
