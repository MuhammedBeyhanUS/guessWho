import type { P2PMessage } from '../../transport/protocol'
import type { ChatDisplayMessage, ChatSender } from './types'

export function appendChatMessage(
  messages: ChatDisplayMessage[],
  incoming: ChatDisplayMessage,
): ChatDisplayMessage[] {
  if (messages.some((message) => message.id === incoming.id)) {
    return messages
  }

  return [...messages, incoming]
}

export function canSendChatText(text: string): boolean {
  return text.trim().length > 0
}

export function createChatP2PMessage(
  text: string,
  id: string = crypto.randomUUID(),
  sentAt = Date.now(),
): Extract<P2PMessage, { type: 'chat' }> {
  return {
    type: 'chat',
    id,
    text: text.trim(),
    sentAt,
  }
}

export function p2pChatToDisplayMessage(
  message: Extract<P2PMessage, { type: 'chat' }>,
  sender: ChatSender,
): ChatDisplayMessage {
  return {
    id: message.id,
    text: message.text,
    sentAt: message.sentAt,
    sender,
  }
}
