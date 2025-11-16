import { Message } from '../types';

export const chatService = {
  // Simulate streaming for demonstration
  async *streamResponse(messages: Message[]) {
    const fullResponse = `Echo: ${messages.map(m => m.content).join(' ')}`;
    for (const char of fullResponse) {
      // simulate streaming character by character
      yield char;
      await new Promise(res => setTimeout(res, 10)); // small delay to mimic streaming
    }
  },
};
