import { useEffect, useRef, useState } from 'react'
import { createP2PConnection } from './webrtcConnection'
import type { ConnectionState, P2PConnection } from './types'
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
  const connectionRef = useRef<P2PConnection | null>(null)

  useEffect(() => {
    if (!roomCode) {
      return
    }

    const connection = connectionFactory()
    connectionRef.current = connection

    const removeStateListener = connection.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'connected') {
        setErrorMessage(null)
      }
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
      } catch (error) {
        setConnectionState('failed')
        setErrorMessage(getConnectionErrorMessage(error))
      }
    })()

    return () => {
      removeStateListener()
      connection.close()
      connectionRef.current = null
    }
  }, [roomCode, isHost, attempt, connectionFactory])

  return {
    connectionState,
    errorMessage,
    retry: () => {
      setAttempt((current) => current + 1)
    },
    send: (message) => {
      connectionRef.current?.send(message)
    },
    onMessage: (handler) => {
      const connection = connectionRef.current
      if (!connection) {
        return () => {}
      }

      return connection.onMessage(handler)
    },
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
