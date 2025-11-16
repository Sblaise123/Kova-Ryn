import { FastifyInstance } from 'fastify';
import { chatController } from '../controllers/chatController';
import { ttsController } from '../controllers/ttsController';
import { historyController } from '../controllers/historyController';

export default async function routes(fastify: FastifyInstance) {
  // Chat endpoint - POST only
  fastify.post('/chat', async (request, reply) => {
    return chatController(request, reply);
  });

  // TTS endpoint - POST only
  fastify.post('/tts', async (request, reply) => {
    return ttsController(request, reply);
  });

  // History endpoint - GET only
  fastify.get('/history', async (request, reply) => {
    return historyController(request, reply);
  });

  // Add OPTIONS support for CORS preflight
  fastify.options('/chat', async (request, reply) => {
    reply.send();
  });

  fastify.options('/tts', async (request, reply) => {
    reply.send();
  });

  fastify.options('/history', async (request, reply) => {
    reply.send();
  });
}