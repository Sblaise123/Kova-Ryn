import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chatController } from '../controllers/chatController';
import { ttsController } from '../controllers/ttsController';
import { historyController } from '../controllers/historyController';

export default async function routes(fastify: FastifyInstance) {
  // Chat endpoint - POST only
  fastify.post('/chat', chatController);

  // TTS endpoint - POST only  
  fastify.post('/tts', ttsController);

  // History endpoint - GET only
  fastify.get('/history', historyController);

  // Add OPTIONS support for CORS preflight
  fastify.options('/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send();
  });

  fastify.options('/tts', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send();
  });

  fastify.options('/history', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send();
  });
}