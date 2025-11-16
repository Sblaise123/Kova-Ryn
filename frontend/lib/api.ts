import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  content?: string;
  done?: boolean;
  conversationId?: string;
}

export class ApiClient {
  // Standard chat
  static async sendMessage(messages: Message[], conversationId?: string) {
    const res = await axiosInstance.post('/api/chat', { messages, conversationId });
    return res.data;
  }

  // Stream chat with SSE
  static streamMessage(
    messages: Message[],
    conversationId?: string,
    callbacks?: {
      onChunk?: (chunk: StreamChunk) => void;
      onComplete?: (conversationId?: string) => void;
      onError?: (err: any) => void;
    }
  ) {
    const { onChunk, onComplete, onError } = callbacks || {};

    const url = `${API_URL}/api/chat/stream`;

    // SSE connection
    const source = new EventSource(url, { withCredentials: true });

    // Initial POST to start streaming
    axiosInstance
      .post('/api/chat/stream', { messages, conversationId })
      .catch((err) => {
        onError?.(err);
        source.close();
      });

    source.onmessage = (event) => {
      try {
        const chunk: StreamChunk = JSON.parse(event.data);
        onChunk?.(chunk);
        if (chunk.done) {
          onComplete?.(chunk.conversationId);
          source.close();
        }
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
