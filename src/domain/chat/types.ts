export type ChatSender = 'self' | 'opponent' | 'system'

export type ChatDisplayMessage = {
  id: string
  text: string
  sentAt: number
  sender: ChatSender
  kind?: 'chat' | 'game'
}
