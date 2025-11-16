import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const fastify = Fastify({
  logger: false,
});

// CORS MUST be registered BEFORE routes
fastify.register(cors, {
  origin: true, // Allow all origins for now (debug)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});

// Register routes with /api prefix
fastify.register(routes, { prefix: '/api' });

// Error handler
fastify.setErrorHandler(errorHandler);

// Health check (no /api prefix)
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv 
  };
});

// Root endpoint
fastify.get('/', async () => {
  return { 
    message: 'AI Chat Backend',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      tts: '/api/tts',
      history: '/api/history'
    }
  };
});

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`CORS enabled for: ${config.corsOrigins.join(', ')}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();