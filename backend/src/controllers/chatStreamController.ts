import { FastifyReply, FastifyRequest } from 'fastify';
import { StreamChunk, Message } from '../types';
import { chatService } from '../services/chatService';

export const chatStreamController = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { messages } = request.body as { messages: Message[] };
    if (!messages || !Array.isArray(messages)) {
      const errChunk: StreamChunk = { error: 'Invalid messages payload', done: true };
      reply.send(errChunk);
      return;
    }

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Stream tokens
    for await (const chunk of chatService.streamResponse(messages)) {
      const payload: StreamChunk = { content: chunk, done: false };
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    }

    // Final done chunk
    const finalChunk: StreamChunk = { done: true };
    reply.raw.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
    reply.raw.end();
  } catch (err: any) {
    const errorChunk: StreamChunk = { error: err.message || 'Internal Server Error', done: true };
    reply.raw.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
    reply.raw.end();
  }
};
