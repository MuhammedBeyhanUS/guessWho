import { describe, expect, it } from 'vitest'
import { getPeerJsBrokerConfig } from './peerJsConfig'

describe('getPeerJsBrokerConfig', () => {
  it('defaults to PeerJS cloud when env is unset', () => {
    expect(getPeerJsBrokerConfig(undefined)).toEqual({
      mode: 'cloud',
      options: { debug: 0 },
    })
  })

  it('uses cloud when explicitly set to cloud', () => {
    expect(getPeerJsBrokerConfig('cloud')).toEqual({
      mode: 'cloud',
      options: { debug: 0 },
    })
  })

  it('parses host:port shorthand for self-hosted PeerServer', () => {
    expect(getPeerJsBrokerConfig('localhost:9000')).toEqual({
      mode: 'self-hosted',
      options: {
        debug: 0,
        host: 'localhost',
        port: 9000,
        path: '/peerjs',
        secure: false,
      },
    })
  })

  it('parses secure websocket URLs for self-hosted deploys', () => {
    expect(getPeerJsBrokerConfig('wss://signaling.example.com')).toEqual({
      mode: 'self-hosted',
      options: {
        debug: 0,
        host: 'signaling.example.com',
        port: 443,
        path: '/peerjs',
        secure: true,
      },
    })
  })
})
