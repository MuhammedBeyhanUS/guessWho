import { afterEach, describe, expect, it, vi } from 'vitest'
import { PeerJsP2PConnection } from './peerJsConnection'
import type { ConnectionState } from './types'

type DataHandler = (data: unknown) => void

class MockDataConnection {
  open = false
  private readonly handlers = new Map<
    string,
    Set<(...args: unknown[]) => void>
  >()

  on(event: string, handler: (...args: unknown[]) => void): void {
    const existing = this.handlers.get(event) ?? new Set()
    existing.add(handler)
    this.handlers.set(event, existing)
  }

  emit(event: string, ...args: unknown[]): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(...args)
    }
  }

  send(data: string): void {
    const handlers = this.handlers.get('data') as Set<DataHandler> | undefined
    for (const handler of handlers ?? []) {
      handler(data)
    }
  }

  openConnection(): void {
    this.open = true
    this.emit('open')
  }

  close(): void {
    this.open = false
    this.emit('close')
  }
}

class MockPeer {
  static hostInstances: MockPeer[] = []
  static guestInstances: MockPeer[] = []

  readonly id: string | undefined
  private readonly handlers = new Map<
    string,
    Set<(...args: unknown[]) => void>
  >()
  private readonly outgoing = new MockDataConnection()

  constructor(id?: string, _options?: unknown) {
    this.id = id
    if (id) {
      MockPeer.hostInstances.push(this)
    } else {
      MockPeer.guestInstances.push(this)
    }

    queueMicrotask(() => {
      this.emit('open')
    })
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    const existing = this.handlers.get(event) ?? new Set()
    existing.add(handler)
    this.handlers.set(event, existing)
  }

  emit(event: string, ...args: unknown[]): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(...args)
    }
  }

  connect(peerId: string, _options?: unknown): MockDataConnection {
    const host = MockPeer.hostInstances.find(
      (instance) => instance.id === peerId,
    )
    host?.emit('connection', this.outgoing)
    queueMicrotask(() => {
      this.outgoing.openConnection()
    })
    return this.outgoing
  }

  call(_peerId: string, _stream: MediaStream): { on: MockPeer['on'] } {
    return {
      on: (event, handler) => {
        if (event === 'stream') {
          handler({} as MediaStream)
        }
      },
    }
  }

  destroy(): void {
    // no-op for tests
  }

  static reset(): void {
    MockPeer.hostInstances = []
    MockPeer.guestInstances = []
  }
}

function createTestConnection() {
  const connection = new PeerJsP2PConnection({
    Peer: MockPeer as unknown as typeof import('peerjs').default,
    getUserMedia: async () =>
      ({
        getAudioTracks: () => [{ enabled: true, stop: vi.fn() }],
        getTracks: () => [{ enabled: true, stop: vi.fn() }],
      }) as unknown as MediaStream,
  })

  return connection
}

function collectStates(connection: PeerJsP2PConnection): ConnectionState[] {
  const states: ConnectionState[] = []
  connection.onConnectionStateChange((state) => {
    states.push(state)
  })
  return states
}

describe('PeerJsP2PConnection', () => {
  afterEach(() => {
    MockPeer.reset()
    vi.restoreAllMocks()
  })

  it('connects host and guest over a data channel', async () => {
    const host = createTestConnection()
    const guest = createTestConnection()
    const hostStates = collectStates(host)
    const guestStates = collectStates(guest)
    const hostMessages: unknown[] = []

    host.onMessage((message) => {
      hostMessages.push(message)
    })

    const hostReady = host.connectAsHost('ABC234')
    const guestReady = guest.connectAsGuest('ABC234')

    await hostReady
    await guestReady

    expect(hostStates).toContain('connected')
    expect(guestStates).toContain('connected')

    guest.send({ type: 'chat', id: 'chat-1', text: 'Hello', sentAt: 1 })

    expect(hostMessages).toEqual([
      { type: 'chat', id: 'chat-1', text: 'Hello', sentAt: 1 },
    ])
  })

  it('fails when the room peer id is already taken', async () => {
    const host = createTestConnection()

    const hostReady = host.connectAsHost('ABC234')
    await Promise.resolve()

    const hostPeer = MockPeer.hostInstances[0]
    hostPeer?.emit('error', new Error('ID "guesswho-ABC234" is taken'))

    await expect(hostReady).rejects.toThrow(/already in use/i)
  })

  it('requests microphone permission on connect', async () => {
    const getUserMedia = vi.fn(
      async () =>
        ({
          getAudioTracks: () => [{ enabled: true, stop: vi.fn() }],
          getTracks: () => [{ enabled: true, stop: vi.fn() }],
        }) as unknown as MediaStream,
    )

    const host = new PeerJsP2PConnection({
      Peer: MockPeer as unknown as typeof import('peerjs').default,
      getUserMedia,
    })

    void host.connectAsHost('ABC234')
    await Promise.resolve()
    await Promise.resolve()

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(host.getVoicePermission()).toBe('granted')

    host.close()
  })
})
