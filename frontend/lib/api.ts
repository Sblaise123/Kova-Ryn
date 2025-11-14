import axios, { AxiosInstance } from 'axios';
import { Message, ChatResponse, StreamChunk, ConversationHistory } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- API Client ----
export class ApiClient {
  // Fetch conversation history
  static async getHistory(conversationId: string): Promise<ConversationHistory> {
    const res = await axiosInstance.get<ConversationHistory>(
      `/history?conversation_id=${conversationId}`
    );
    return res.data;
  }

  // Send a normal chat request (non-streaming)
  static async sendMessage(messages: Message[], conversationId?: string): Promise<ChatResponse> {
    const payload = { messages, conversationId };
    const res = await axiosInstance.post<ChatResponse>('/chat', payload);
    return res.data;
  }

  // Streaming chat request using Server-Sent Events (SSE)
  static streamMessage(
    messages: Message[],
    conversationId?: string,
    onChunk?: (chunk: StreamChunk) => void,
    onError?: (err: any) => void,
    onComplete?: () => void
  ) {
    const payload = { messages, conversationId, stream: true };
    const url = `${API_URL}/chat/stream`;

    const eventSource = new EventSource(`${url}?conversation_id=${conversationId}`);

    eventSource.onmessage = (event) => {
      try {
        const data: StreamChunk = JSON.parse(event.data);
        if (onChunk) onChunk(data);
      } catch (err) {
        if (onError) onError(err);
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      eventSource.close();
      if (onComplete) onComplete();
    };

    eventSource.onopen = () => {
      // Optional: send initial payload using POST if required by your backend
      axiosInstance.post('/chat/stream', payload).catch((err) => {
        if (onError) onError(err);
        eventSource.close();
        if (onComplete) onComplete();
      });
    };

    return eventSource;
  }
}

export default axiosInstance;
