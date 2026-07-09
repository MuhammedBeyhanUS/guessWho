import { describe, expect, it } from 'vitest'
import {
  appendChatMessage,
  canSendChatText,
  createChatP2PMessage,
  p2pChatToDisplayMessage,
} from './chatHistory'
import type { ChatDisplayMessage } from './types'

describe('chatHistory', () => {
  const existing: ChatDisplayMessage[] = [
    {
      id: 'msg-1',
      text: 'Hello',
      sentAt: 1,
      sender: 'self',
    },
  ]

  it('appends a new message to history', () => {
    const incoming: ChatDisplayMessage = {
      id: 'msg-2',
      text: 'Hi there',
      sentAt: 2,
      sender: 'opponent',
    }

    expect(appendChatMessage(existing, incoming)).toEqual([
      ...existing,
      incoming,
    ])
  })

  it('deduplicates messages by id when resent', () => {
    const duplicate: ChatDisplayMessage = {
      id: 'msg-1',
      text: 'Hello again',
      sentAt: 3,
      sender: 'opponent',
    }

    expect(appendChatMessage(existing, duplicate)).toEqual(existing)
  })

  it('creates outgoing chat P2P messages with trimmed text', () => {
    expect(createChatP2PMessage('  Hi!  ', 'chat-1', 42)).toEqual({
      type: 'chat',
      id: 'chat-1',
      text: 'Hi!',
      sentAt: 42,
    })
  })

  it('maps P2P chat messages to display messages', () => {
    expect(
      p2pChatToDisplayMessage(
        { type: 'chat', id: 'chat-1', text: 'Ready?', sentAt: 99 },
        'opponent',
      ),
    ).toEqual({
      id: 'chat-1',
      text: 'Ready?',
      sentAt: 99,
      sender: 'opponent',
    })
  })

  it('blocks empty or whitespace-only chat text', () => {
    expect(canSendChatText('')).toBe(false)
    expect(canSendChatText('   ')).toBe(false)
    expect(canSendChatText('Go!')).toBe(true)
  })
})
