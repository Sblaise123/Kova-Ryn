export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  messages: Message[];
  stream?: boolean;
  conversationId?: string;
}

export interface ChatResponse {
  content: string;
  conversationId: string;
  timestamp: number;
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
}

export interface ConversationHistory {
  conversationId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface StreamChunk {
  content?: string;
  error?: string;
  conversationId?: string;
  done?: boolean; 
}
