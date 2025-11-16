import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  content: string;
  conversationId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export class ApiClient {
  // Send a message
  static async sendMessage(messages: Message[]): Promise<ChatResponse> {
    const res = await axiosInstance.post('/chat', { messages });
    return res.data as ChatResponse;
  }

  // Optional: fetch conversation history
  static async getHistory(conversationId: string) {
    const res = await axiosInstance.get(`/history?conversation_id=${conversationId}`);
    return res.data;
  }

  // SSE streaming (if implemented on backend)
  static streamMessage(
    messages: Message[],
    conversationId?: string,
    callbacks?: {
      onChunk?: (chunk: { content: string; done?: boolean; conversationId?: string }) => void;
      onComplete?: (conversationId?: string) => void;
      onError?: (err: any) => void;
    }
  ): EventSource {
    const { onChunk, onComplete, onError } = callbacks || {};
    const query = conversationId ? `?conversation_id=${conversationId}` : '';
    const url = `${API_URL}/chat/stream${query}`;

    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const chunk = JSON.parse(event.data);
        onChunk?.(chunk);
        if (chunk.done) onComplete?.(chunk.conversationId);
      } catch (err) {
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
