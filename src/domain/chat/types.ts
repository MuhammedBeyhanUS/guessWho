export type ChatSender = 'self' | 'opponent'

export type ChatDisplayMessage = {
  id: string
  text: string
  sentAt: number
  sender: ChatSender
}
