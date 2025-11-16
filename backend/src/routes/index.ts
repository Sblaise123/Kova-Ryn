import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chatStreamController } from '../controllers/chatStreamController';
import { ttsController } from '../controllers/ttsController';
import { historyController } from '../controllers/historyController';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/chat', chatStreamController); // POST chat
  fastify.post('/tts', ttsController);
  fastify.get('/history', historyController);

  // OPTIONS for CORS preflight
  fastify.options('/chat', async (req, reply) => reply.send());
  fastify.options('/tts', async (req, reply) => reply.send());
  fastify.options('/history', async (req, reply) => reply.send());
}
