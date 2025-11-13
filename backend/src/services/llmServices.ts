import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Message } from '../types';
import { sanitizeMessages } from '../utils/sanitize';

class LLMService {
  private client: Anthropic | null = null;

  constructor() {
    if (config.anthropicApiKey && !config.enableMocking) {
      this.client = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    } else {
      logger.warn('Claude API key not provided, using mock responses');
    }
  }

  async generateResponse(messages: Message[]): Promise {
    const sanitized = sanitizeMessages(messages);

    if (!this.client || config.enableMocking) {
      return this.mockResponse(sanitized);
    }

    try {
      const response = await this.client.messages.create({
        model: config.llmModel,
        max_tokens: config.llmMaxTokens,
        messages: sanitized.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      logger.error('Error generating LLM response:', error);
      throw new Error('Failed to generate response');
    }
  }

  async *streamResponse(messages: Message[]): AsyncGenerator {
    const sanitized = sanitizeMessages(messages);

    if (!this.client || config.enableMocking) {
      yield* this.mockStreamResponse(sanitized);
      return;
    }

    try {
      const stream = await this.client.messages.create({
        model: config.llmModel,
        max_tokens: config.llmMaxTokens,
        messages: sanitized.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }
    } catch (error) {
      logger.error('Error streaming LLM response:', error);
      throw new Error('Failed to stream response');
    }
  }

  private mockResponse(messages: Message[]): string {
    const lastMessage = messages[messages.length - 1];
    return `Mock response to: "${lastMessage.content.substring(0, 50)}..."`;
  }

  private async *mockStreamResponse(
    messages: Message[]
  ): AsyncGenerator {
    const response = this.mockResponse(messages);
    const words = response.split(' ');

    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

export const llmService = new LLMService();