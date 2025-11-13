import { FastifyInstance } from 'fastify';
import { chatController } from '../controllers/chatController';
import { ttsController } from '../controllers/ttsController';
import { historyController } from '../controllers/historyController';
import { validateChatRequest, validateTTSRequest } from '../middleware/validation';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/chat', { preHandler: validateChatRequest }, chatController);
  fastify.post('/tts', { preHandler: validateTTSRequest }, ttsController);
  fastify.get('/history', historyController);
}