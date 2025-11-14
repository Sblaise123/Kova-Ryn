import axios from 'axios';
import {
  Message,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ConversationHistory,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export class ApiClient {
  // Fetch conversation history
  static async getHistory(conversationId: string): Promise<ConversationHistory> {
    const res = await axiosInstance.get(`/history?conversation_id=${conversationId}`);
    return res.data;
  }

  // Send a normal chat request (non-streaming)
  static async sendMessage(messages: Message[], conversationId?: string): Promise<ChatResponse> {
    const payload: ChatRequest = { messages, stream: false, conversationId };
    const res = await axiosInstance.post('/chat', payload);
    return res.data;
  }

  // Streamed messages using Server-Sent Events
  static async *streamMessage(messages: Message[], conversationId?: string): AsyncGenerator<StreamChunk> {
    const payload: ChatRequest = { messages, stream: true, conversationId };
    const eventSource = new EventSource(`${API_URL}/chat/stream?conversationId=${conversationId}`, {
      withCredentials: true,
    });

    // Note: This is a simplified example using fetch streaming for Vercel compatibility
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      try {
        const chunk: StreamChunk = JSON.parse(chunkStr);
        yield chunk;
      } catch {
        // partial JSON might arrive; ignore
      }
    }
  }
}
