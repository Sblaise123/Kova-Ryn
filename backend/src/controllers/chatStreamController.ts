import { FastifyReply, FastifyRequest } from 'fastify';
import { streamChatResponse } from '../services/chatService';

export const chatStreamController = async (req: FastifyRequest, reply: FastifyReply) => {
  reply.headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const { messages, conversationId } = req.body as {
    messages: { role: string; content: string }[];
    conversationId?: string;
  };

  const sendChunk = (chunk: { content?: string; done?: boolean }) => {
    reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
  };

  try {
    await streamChatResponse(messages, conversationId, sendChunk);
    sendChunk({ done: true });
    reply.raw.end();
  } catch (err) {
    sendChunk({ error: (err as Error).message, done: true });
    reply.raw.end();
  }
};
