import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const fastify = Fastify({
  logger: false,
});

// Register plugins
astify.register(cors, {
  origin: (origin, cb) => {
    const allowed = [
      "https://kova-ryn-suie.vercel.app/",
      "http://localhost:3000"
    ];

    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
});

// Register routes
fastify.register(routes, { prefix: '/api' });

// Error handler
fastify.setErrorHandler(errorHandler);

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    logger.info(`Server running on port ${config.port}`);
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