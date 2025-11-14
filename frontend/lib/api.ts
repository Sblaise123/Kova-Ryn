import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { Message, ChatResponse, StreamChunk, ConversationHistory } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async register(email: string, password: string) {
    return this.client.post('/auth/register', { email, password });
  }

  async sendMessage(messages: Message[]): Promise<ChatResponse> {
    return this.client.post('/chat', { messages });
  }

  async streamChat(messages: Message[], onChunk: (chunk: StreamChunk) => void) {
    const res = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    let decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          onChunk(json);
        } catch (e) {
          console.error('Chunk parse error:', e);
        }
      }
    }
  }
}

export const api = new ApiClient();
