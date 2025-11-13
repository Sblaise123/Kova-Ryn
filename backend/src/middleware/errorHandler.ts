import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  logger.error('Error handling request:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  });

  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
};