// lib/api.ts
import axios from 'axios';
import {
  Message,
  ChatResponse,
  StreamChunk,
  ConversationHistory,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface StreamMessageOptions {
  onChunk: (chunk: StreamChunk) => void;
  onComplete?: (conversationId?: string) => void;
  onError?: (err: any) => void;
}

export const ApiClient = {
  login: (data: { username: string; password: string }) =>
    axiosInstance.post('/auth/login', data),

  getMe: () => axiosInstance.get('/auth/me'),

  getHistory: async (conversationId: string): Promise<ConversationHistory> => {
    const res = await axiosInstance.get(`/history?conversation_id=${conversationId}`);
    return res.data as ConversationHistory;
  },

  sendMessage: async (
    messages: Message[],
    conversationId?: string
  ): Promise<ChatResponse> => {
    const res = await axiosInstance.post('/chat', { messages, conversationId });
    return res.data as ChatResponse;
  },

  // Streaming using callback pattern
  streamMessage: (
    messages: Message[],
    conversationId?: string,
    options?: StreamMessageOptions
  ) => {
    const { onChunk, onComplete, onError } = options || {};

    const source = new EventSource(
      `${API_URL}/chat/stream?conversationId=${conversationId ?? ''}`,
      { withCredentials: true } // if needed for cookies/auth
    );

    source.onmessage = (event) => {
      try {
        const chunk: StreamChunk = JSON.parse(event.data);
        onChunk?.(chunk);

        if (chunk.done && onComplete) {
          onComplete(chunk.conversationId);
          source.close();
        }
      } catch (err) {
        console.error('Error parsing SSE chunk:', err);
        onError?.(err);
        source.close();
      }
    };

    source.onerror = (err) => {
      console.error('SSE error:', err);
      onError?.(err);
      source.close();
    };
  },
};
