import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { logger } from './utils/logger';
import { llmService } from './services/llmService';
import { storageService } from './services/storageService';

const fastify = Fastify({
  logger: false,
});

// Register CORS - allow everything for now
fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    apiKeyConfigured: !!config.anthropicApiKey
  };
});

fastify.get('/', async () => {
  return { 
    message: 'AI Chat Backend',
    version: '1.0.0'
  };
});

fastify.post('/api/chat', async (request, reply) => {
  try {
    const body = request.body as any;
    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages)) {
      return reply.status(400).send({ error: 'Messages required' });
    }

    logger.info(`Chat request with ${messages.length} messages`);
    
    const content = await llmService.generateResponse(messages);
    
    return reply.send({
      content,
      conversationId: conversationId || 'new',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Chat error:', error);
    return reply.status(500).send({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  } catch (err) {
    logger.error('Server failed:', err);
    process.exit(1);
  }
};

start();