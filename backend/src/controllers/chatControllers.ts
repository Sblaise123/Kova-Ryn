import { FastifyRequest, FastifyReply } from 'fastify';
import { llmService } from '../services/llmService';
import { storageService } from '../services/storageService';
import { ChatRequest, Message } from '../types';
import { logger } from '../utils/logger';

export const chatController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { messages, stream, conversationId } = request.body;

  try {
    // Save user message
    const userMessage = messages[messages.length - 1];
    const convId = storageService.saveMessage(
      conversationId || '',
      userMessage
    );

    if (stream) {
      // Server-Sent Events streaming
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      try {
        for await (const chunk of llmService.streamResponse(messages)) {
          fullResponse += chunk;
          reply.raw.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }

        // Save assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };
        storageService.saveMessage(convId, assistantMessage);

        reply.raw.write(
          `data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`
        );
        reply.raw.end();
      } catch (error) {
        logger.error('Streaming error:', error);
        reply.raw.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
        reply.raw.end();
      }
    } else {
      // Non-streaming response
      const content = await llmService.generateResponse(messages);

      // Save assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content,
        timestamp: Date.now(),
      };
      storageService.saveMessage(convId, assistantMessage);

      reply.send({
        content,
        conversationId: convId,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    logger.error('Chat error:', error);
    reply.status(500).send({ error: 'Failed to process chat request' });
  }
};