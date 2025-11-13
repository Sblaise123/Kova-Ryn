import { FastifyRequest, FastifyReply } from 'fastify';
import { storageService } from '../services/storageService';
import { logger } from '../utils/logger';

export const historyController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { conversation_id } = request.query;

  try {
    if (conversation_id) {
      const history = storageService.getHistory(conversation_id);
      if (!history) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }
      reply.send(history);
    } else {
      const all = storageService.getAllConversations();
      reply.send({ conversations: all });
    }
  } catch (error) {
    logger.error('History error:', error);
    reply.status(500).send({ error: 'Failed to fetch history' });
  }
};