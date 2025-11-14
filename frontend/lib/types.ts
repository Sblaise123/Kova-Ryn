export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  stream?: boolean;
  conversationId?: string;
}

export interface ChatResponse {
  content: string;
  conversationId: string;
  timestamp: number;
}

export interface StreamChunk {
  content?: string;  // partial content from streaming API
  error?: string;
}

export interface ConversationHistory {
  conversationId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
