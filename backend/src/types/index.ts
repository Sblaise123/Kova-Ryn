export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationHistory {
  conversationId: string;
  messages: Message[];
}

export interface ChatResponse {
  content: string;
  conversationId?: string;
}

export interface StreamChunk {
  content?: string;
  done?: boolean;
  conversationId?: string;
  error?: string; // added optional error
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
}
