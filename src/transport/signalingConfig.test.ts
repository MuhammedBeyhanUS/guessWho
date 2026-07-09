import { describe, expect, it } from 'vitest'
import { getSignalingConfig } from './signalingConfig'

describe('getSignalingConfig', () => {
  it('parses host:port shorthand for local dev', () => {
    const config = getSignalingConfig('localhost:9000')

    expect(config.wsBaseUrl).toBe('ws://localhost:9000')
    expect(config.httpBaseUrl).toBe('http://localhost:9000')
    expect(config.key).toBe('peerjs')
  })

  it('parses secure websocket URLs', () => {
    const config = getSignalingConfig('wss://signaling.example.com')

    expect(config.wsBaseUrl).toBe('wss://signaling.example.com')
    expect(config.httpBaseUrl).toBe('https://signaling.example.com')
  })
})
