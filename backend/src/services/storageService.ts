import { v4 as uuidv4 } from 'uuid';
import { ConversationHistory, Message } from '../types';
import { logger } from '../utils/logger';

class StorageService {
  private conversations: Map<string, ConversationHistory> = new Map();

  saveMessage(conversationId: string, message: Message): string {
    const id = conversationId || uuidv4();
    const existing = this.conversations.get(id);
    const now = Date.now();

    if (existing) {
      existing.messages.push(message);
      existing.updatedAt = now;
    } else {
      this.conversations.set(id, {
        conversationId: id,
        messages: [message],
        createdAt: now,
        updatedAt: now,
      });
    }

    logger.debug(`Saved message to conversation ${id}`);
    return id;
  }

  getHistory(conversationId: string): ConversationHistory | null {
    return this.conversations.get(conversationId) || null;
  }

  getAllConversations(): ConversationHistory[] {
    return Array.from(this.conversations.values());
  }

  clearOldConversations(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    let cleared = 0;

    for (const [id, conv] of this.conversations.entries()) {
      if (now - conv.updatedAt > maxAge) {
        this.conversations.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info(`Cleared ${cleared} old conversations`);
    }
  }
}

export const storageService = new StorageService();

// Clean up old conversations every hour
setInterval(() => {
  storageService.clearOldConversations();
}, 60 * 60 * 1000);