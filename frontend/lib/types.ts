export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  content: string;
  conversationId: string;
  timestamp: number;
}

export interface StreamChunk {
  content?: string;
  conversationId?: string;
  done?: boolean;
  error?: string;
}

export interface ConversationHistory {
  conversationId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// Add this TTSRequest type for type safety
export interface TTSRequest {
  text: string;
  voiceId?: string;
}
