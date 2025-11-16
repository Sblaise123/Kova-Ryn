import { FastifyReply, FastifyRequest } from 'fastify';
import { getChatResponse } from '../services/chatService';

export const chatController = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { messages, conversationId } = req.body as {
      messages: { role: string; content: string }[];
      conversationId?: string;
    };

    const response = await getChatResponse(messages, conversationId);

    reply.send({
      content: response,
      conversationId,
    });
  } catch (err) {
    console.error('ChatController error:', err);
    reply.status(500).send({ error: 'Internal server error' });
  }
};
