// frontend/lib/api.ts
import axios from 'axios';
import { Message, ChatResponse, StreamChunk, ConversationHistory } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  async sendMessage(messages: Message[], conversationId?: string): Promise<ChatResponse> {
    const res = await this.axiosInstance.post<ChatResponse>('/api/chat', {
      messages,
      conversationId,
      stream: false,
    });
    return res.data;
  }

  async *streamMessage(messages: Message[], conversationId?: string): AsyncGenerator<StreamChunk> {
    const res = await this.axiosInstance.post(`/api/chat`, {
      messages,
      conversationId,
      stream: true,
    }, {
      responseType: 'stream', // Node.js streaming, Axios in browser may need SSE or fetch
    });

    const reader = res.data.getReader?.(); // for Fetch API / ReadableStream
    if (!reader) {
      yield { error: 'Streaming not supported' };
      return;
    }

    let decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readDone } = await reader.read();
      done = readDone;
      if (value) {
        const text = decoder.decode(value);
        yield { content: text };
      }
    }
  }

  async getHistory(conversationId: string): Promise<ConversationHistory> {
    const res = await this.axiosInstance.get(`/api/history?conversation_id=${conversationId}`);
    return res.data;
  }
}

// ✅ Export it properly
export default new ApiClient();
