import { FastifyRequest, FastifyReply } from 'fastify';
import { llmService } from '../services/llmService';
import { storageService } from '../services/storageService';
import { logger } from '../utils/logger';

interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
  conversationId?: string;
}

export const chatController = async (
  request: FastifyRequest<{ Body: ChatRequestBody }>,
  reply: FastifyReply
) => {
  try {
    const { messages, stream, conversationId } = request.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return reply.status(400).send({ 
        error: 'Invalid request: messages array is required' 
      });
    }

    logger.info(`Received chat request with ${messages.length} messages`);

    const userMessage = messages[messages.length - 1];
    const convId = storageService.saveMessage(conversationId || '', userMessage);

    if (stream) {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      let fullResponse = '';
      try {
        for await (const chunk of llmService.streamResponse(messages)) {
          fullResponse += chunk;
          reply.raw.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        storageService.saveMessage(convId, {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        });
        reply.raw.write(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`);
        reply.raw.end();
      } catch (error) {
        logger.error('Streaming error:', error);
        reply.raw.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
        reply.raw.end();
      }
    } else {
      logger.info('Generating response...');
      const content = await llmService.generateResponse(messages);
      logger.info('Response generated successfully');

      storageService.saveMessage(convId, {
        role: 'assistant',
        content,
        timestamp: Date.now(),
      });

      return reply.send({
        content,
        conversationId: convId,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    logger.error('Chat controller error:', error);
    return reply.status(500).send({ 
      error: 'Failed to process chat request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};