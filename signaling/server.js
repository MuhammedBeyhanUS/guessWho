import { PeerServer } from 'peer'

const PORT = Number(process.env.SIGNALING_PORT ?? 9000)

const server = PeerServer({
  port: PORT,
  path: '/',
  key: 'peerjs',
})

server.on('connection', (client) => {
  console.log(`Peer connected: ${client.getId()}`)
})

server.on('disconnect', (client) => {
  console.log(`Peer disconnected: ${client.getId()}`)
})

console.log(`Signaling server listening on port ${PORT}`)
