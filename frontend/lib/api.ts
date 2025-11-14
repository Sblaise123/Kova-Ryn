import axios, { AxiosInstance } from 'axios';
import { Message, ChatResponse, StreamChunk, ConversationHistory } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async sendMessage(
    messages: Message[],
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/chat', {
      messages,
      stream: false,
      conversationId,
    });
    return response.data;
  }

  async *streamMessage(
    messages: Message[],
    conversationId?: string
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        stream: true,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed: StreamChunk = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async textToSpeech(text: string, voiceId?: string): Promise<Blob> {
    const response = await this.client.post(
      '/tts',
      { text, voiceId },
      { responseType: 'blob' }
    );
    return response.data;
  }

  async getHistory(conversationId?: string): Promise<ConversationHistory | ConversationHistory[]> {
    const params = conversationId ? { conversation_id: conversationId } : {};
    const response = await this.client.get('/history', { params });
    return response.data;
  }
}

export const api = new ApiClient();