import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { logger } from './utils/logger';
import { llmService } from './services/llmService';
import { storageService } from './services/storageService';

const fastify = Fastify({
  logger: false,
});

// ✅ UPDATED CORS CONFIGURATION
fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      cb(null, true);
      return;
    }

    // Allow localhost and all vercel.app domains
    if (origin.includes('localhost') || origin.includes('vercel.app')) {
      cb(null, true);
      return;
    }

    // Check against configured origins
    if (config.corsOrigins.includes(origin)) {
      cb(null, true);
      return;
    }

    // Reject all others
    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
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
    version: '1.0.0',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      history: '/api/history'
    }
  };
});

fastify.post('/api/chat', async (request, reply) => {
  try {
    const body = request.body as any;
    const { messages, stream, conversationId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logger.error('Invalid request: missing messages');
      return reply.status(400).send({ 
        error: 'Invalid request: messages array is required' 
      });
    }

    logger.info(`Received chat request with ${messages.length} messages`);

    const userMessage = messages[messages.length - 1];
    const convId = storageService.saveMessage(conversationId || '', userMessage);

    if (stream) {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');

      let fullResponse = '';

      try {
        for await (const chunk of llmService.streamResponse(messages)) {
          fullResponse += chunk;
          reply.raw.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }

        storageService.saveMessage(convId, {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        });

        reply.raw.write(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`);
        reply.raw.end();
        logger.info('Streaming response completed');
      } catch (error) {
        logger.error('Streaming error:', error);
        reply.raw.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
        reply.raw.end();
      }
    } else {
      logger.info('Generating response...');
      const content = await llmService.generateResponse(messages);
      
      logger.info('Response generated successfully');

      storageService.saveMessage(convId, {
        role: 'assistant',
        content,
        timestamp: Date.now(),
      });

      return reply.send({
        content,
        conversationId: convId,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    return reply.status(500).send({ 
      error: 'Failed to process chat request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

fastify.get('/api/history', async (request, reply) => {
  try {
    const query = request.query as any;
    const conversationId = query.conversation_id;

    if (conversationId) {
      const history = storageService.getHistory(conversationId);
      if (!history) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }
      return reply.send(history);
    } else {
      const all = storageService.getAllConversations();
      return reply.send({ conversations: all });
    }
  } catch (error) {
    logger.error('History error:', error);
    return reply.status(500).send({ error: 'Failed to fetch history' });
  }
});

fastify.options('/api/chat', async (request, reply) => {
  reply.send();
});

fastify.options('/api/history', async (request, reply) => {
  reply.send();
});

fastify.setErrorHandler((error, request, reply) => {
  logger.error('Unhandled error:', error);
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500
  });
});

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API Key configured: ${config.anthropicApiKey ? 'Yes' : 'No'}`);
    logger.info(`CORS origins: ${config.corsOrigins.join(', ')}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();