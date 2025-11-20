import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { logger } from './utils/logger';
import { llmService } from './services/llmService';
import { storageService } from './services/storageService';

const start = async () => {
  const fastify = Fastify({
    logger: false,
  });

  // More explicit CORS configuration
  await fastify.register(cors, {
    origin: '*',  // Allow all origins explicitly
    credentials: false,  // Must be false when origin is *
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type'],
    preflightContinue: false
  });

  logger.info('CORS registered with origin: *');

  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      apiKeyConfigured: !!config.anthropicApiKey,
      cors: 'enabled with *'
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

      logger.info(`Chat request with ${messages.length} messages`);  // ✅ Fixed
      
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

  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    logger.info(`Server running on port ${config.port}`);   // ✅ Fixed
    logger.info(`Environment: ${config.nodeEnv}`);          // ✅ Fixed
  } catch (err) {
    logger.error('Server failed:', err);
    process.exit(1);
  }
};

start();