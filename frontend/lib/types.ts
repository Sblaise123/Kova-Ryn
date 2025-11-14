export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  isStreaming?: boolean;
}

export interface ChatResponse {
  content: string;
  conversationId: string;
  timestamp: number;
}

export interface StreamChunk {
  chunk?: string;
  done?: boolean;
  conversationId?: string;
  error?: string;
}

export interface ConversationHistory {
  conversationId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}