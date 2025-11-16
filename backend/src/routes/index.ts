import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chatController, chatStreamController } from '../controllers/chatController';
import { ttsController } from '../controllers/ttsController';
import { historyController } from '../controllers/historyController';

export default async function routes(fastify: FastifyInstance) {
  // Chat - POST (final response)
  fastify.post('/chat', chatController);

  // Chat Streaming - GET (SSE stream)
  fastify.get('/chat/stream', chatStreamController);

  // TTS endpoint - POST only  
  fastify.post('/tts', ttsController);

  // History endpoint - GET only
  fastify.get('/history', historyController);

  // CORS preflight OPTIONS
  fastify.options('/chat', async (_, reply) => reply.send());
  fastify.options('/tts', async (_, reply) => reply.send());
  fastify.options('/history', async (_, reply) => reply.send());
  fastify.options('/chat/stream', async (_, reply) => reply.send());
}
