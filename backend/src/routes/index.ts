import { FastifyInstance } from 'fastify';

// Fallback chatController if the external module is not present.
// Replace this with: import { chatController } from '../controllers/chatController';
const chatController = async (request: any, reply: any) => {
  reply.code(501).send({ error: 'chatController not implemented (missing ../controllers/chatController)' });
};

import { ttsController } from '../controllers/ttsController';
import { historyController } from '../controllers/historyController';
import { validateChatRequest, validateTTSRequest } from '../middleware/validation';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/chat', { preHandler: validateChatRequest }, chatController);
  fastify.post('/tts', { preHandler: validateTTSRequest }, ttsController);
  fastify.get('/history', historyController);
}