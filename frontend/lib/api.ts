import axios from 'axios';
import { Message, ChatResponse, StreamChunk, ConversationHistory, TTSRequest } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Standard API client
export class ApiClient {
  // Get conversation history
  static async getHistory(conversationId: string): Promise<ConversationHistory> {
    const res = await axiosInstance.get(`/api/history?conversation_id=${conversationId}`);
    return res.data as ConversationHistory;
  }

  // Send a normal chat request (non-streaming)
  static async sendMessage(messages: Message[], conversationId?: string): Promise<ChatResponse> {
    const res = await axiosInstance.post('/api/chat', { messages, conversationId });
    return res.data as ChatResponse;
  }

  // Send text to TTS
  static async textToSpeech(data: TTSRequest) {
    const res = await axiosInstance.post('/api/tts', data, { responseType: 'arraybuffer' });
    return res.data;
  }

  // Stream chat response using SSE
  static streamMessage(
    messages: Message[],
    conversationId?: string,
    callbacks?: {
      onChunk?: (chunk: StreamChunk) => void;
      onComplete?: (conversationId?: string) => void;
      onError?: (err: any) => void;
    }
  ): EventSource {
    const { onChunk, onComplete, onError } = callbacks || {};

    const query = conversationId ? `?conversation_id=${conversationId}` : '';
    const url = `${API_URL}/api/chat/stream${query}`;

    // Create EventSource connection
    const source = new EventSource(url);

    // Send initial payload via POST to /api/chat (NOT to the SSE URL)
    axiosInstance.post('/api/chat', { messages, conversationId }).catch((err) => {
      onError?.(err);
      source.close();
    });

    // Receive streamed tokens
    source.onmessage = (event) => {
      try {
        const chunk: StreamChunk = JSON.parse(event.data);
        onChunk?.(chunk);

        if (chunk.done === true) {
          onComplete?.(chunk.conversationId);
          source.close();
        }
      } catch (err) {
        console.error('Error parsing SSE chunk:', err);
        onError?.(err);
        source.close();
      }
    };

    source.onerror = (err) => {
      onError?.(err);
      source.close();
    };

    return source;
  }
}