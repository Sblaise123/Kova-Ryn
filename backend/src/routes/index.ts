import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chatController } from '../controllers/chatController';
import { historyController } from '../controllers/historyController';

// SSE streaming controller
export async function chatStreamController(req: FastifyRequest, reply: FastifyReply) {
  reply.header('Content-Type', 'text/event-stream');
  reply.header('Cache-Control', 'no-cache');
  reply.header('Connection', 'keep-alive');
  reply.raw.flushHeaders?.();

  try {
    // Parse messages from request body or query
    const messages = (req.body as any)?.messages || [];
    
    // Example: You would integrate your LLM here
    // For demonstration, we send tokens with a delay
    const responseText = 'Hello! I am Kova. Ask me anything so I can help you.';
    const tokens = responseText.split(' ');

    for (const token of tokens) {
      const chunk = { content: token + ' ', done: false };
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 100)); // simulate streaming delay
    }

    // Send final chunk with done=true
    reply.raw.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    reply.raw.end();
  } catch (err) {
    console.error('SSE error:', err);
    reply.raw.write(`data: ${JSON.stringify({ error: 'Streaming failed', done: true })}\n\n`);
    reply.raw.end();
  }
}

export default async function routes(fastify: FastifyInstance) {
  // POST chat endpoint
  fastify.post('/chat', chatController);

  // SSE streaming endpoint
  fastify.post('/chat/stream', chatStreamController);

  // History endpoint
  fastify.get('/history', historyController);

  // OPTIONS for CORS preflight
  fastify.options('/chat', async (req, reply) => reply.send());
  fastify.options('/chat/stream', async (req, reply) => reply.send());
  fastify.options('/history', async (req, reply) => reply.send());
}

