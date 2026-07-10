import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createP2PConnection } from './webrtcConnection'
import type {
  ConnectionState,
  MessageHandler,
  P2PConnection,
  VoicePermissionState,
} from './types'
import type { P2PMessage } from './protocol'

type UseP2PConnectionOptions = {
  roomCode: string | undefined
  isHost: boolean
  connectionFactory?: () => P2PConnection
}

type UseP2PConnectionResult = {
  connectionState: ConnectionState
  errorMessage: string | null
  retry: () => void
  send: (message: P2PMessage) => void
  onMessage: (handler: (message: P2PMessage) => void) => () => void
  isMuted: boolean
  toggleMute: () => void
  voicePermission: VoicePermissionState
  remoteAudioRef: RefObject<HTMLAudioElement | null>
  remoteStream: MediaStream | null
}

function attachMessageBridge(
  connection: P2PConnection,
  handlers: Set<MessageHandler>,
): () => void {
  return connection.onMessage((message) => {
    for (const handler of handlers) {
      handler(message)
    }
  })
}

export function useP2PConnection({
  roomCode,
  isHost,
  connectionFactory = createP2PConnection,
}: UseP2PConnectionOptions): UseP2PConnectionResult {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [voicePermission, setVoicePermission] =
    useState<VoicePermissionState>('pending')
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const connectionRef = useRef<P2PConnection | null>(null)
  const messageHandlersRef = useRef(new Set<MessageHandler>())
  const bridgeUnsubscribeRef = useRef<(() => void) | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!roomCode) {
      return
    }

    const connection = connectionFactory()
    connectionRef.current = connection
    bridgeUnsubscribeRef.current = attachMessageBridge(
      connection,
      messageHandlersRef.current,
    )
    setIsMuted(connection.isMuted())
    setVoicePermission(connection.getVoicePermission())
    setRemoteStream(null)

    const removeStateListener = connection.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'connected') {
        setErrorMessage(null)
      }
    })

    const removeVoicePermissionListener = connection.onVoicePermissionChange(
      (state) => {
        setVoicePermission(state)
      },
    )

    const removeRemoteStreamListener = connection.onRemoteStream((stream) => {
      setRemoteStream(stream)
    })

    void (async () => {
      try {
        setConnectionState('connecting')
        setErrorMessage(null)

        if (isHost) {
          await connection.connectAsHost(roomCode)
        } else {
          await connection.connectAsGuest(roomCode)
        }

        setIsMuted(connection.isMuted())
        setVoicePermission(connection.getVoicePermission())
      } catch (error) {
        setConnectionState('failed')
        setErrorMessage(getConnectionErrorMessage(error))
      }
    })()

    return () => {
      removeStateListener()
      removeVoicePermissionListener()
      removeRemoteStreamListener()
      bridgeUnsubscribeRef.current?.()
      bridgeUnsubscribeRef.current = null
      connection.close()
      connectionRef.current = null
      setRemoteStream(null)
    }
  }, [roomCode, isHost, attempt, connectionFactory])

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  const send = useCallback((message: P2PMessage) => {
    const connection = connectionRef.current
    if (!connection) {
      return
    }

    try {
      connection.send(message)
    } catch (error) {
      console.error('Failed to send P2P message', error)
    }
  }, [])

  const onMessage = useCallback((handler: MessageHandler) => {
    messageHandlersRef.current.add(handler)
    return () => {
      messageHandlersRef.current.delete(handler)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const connection = connectionRef.current
    if (!connection) {
      return
    }

    const nextMuted = !connection.isMuted()
    connection.setMuted(nextMuted)
    setIsMuted(nextMuted)
  }, [])

  return {
    connectionState,
    errorMessage,
    retry,
    send,
    onMessage,
    isMuted,
    toggleMute,
    voicePermission,
    remoteAudioRef,
    remoteStream,
  }
}

function getConnectionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Could not connect to your opponent. Please try again.'
}

export function getConnectionStatusLabel(state: ConnectionState): string {
  switch (state) {
    case 'connecting':
      return 'Connecting to opponent…'
    case 'connected':
      return 'Connected'
    case 'failed':
      return 'Connection failed'
    case 'disconnected':
      return 'Disconnected'
  }
}
