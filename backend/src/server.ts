fastify.setErrorHandler((error, request, reply) => {
  logger.error('💥 Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  });
  
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500
  });
});

// ============================================
// Start server
// ============================================
const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    
    logger.info('='.repeat(50));
    logger.info(`🚀 Server running on port ${config.port}`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);
    logger.info(`🔑 API Key configured: ${config.anthropicApiKey ? 'Yes ✅' : 'No ❌'}`);
    logger.info(`📡 CORS origins: ${config.corsOrigins.join(', ')}`);
    logger.info('='.repeat(50));
  } catch (err) {
    logger.error('❌ Error starting server:', err);
    process.exit(1);
  }
};

// ============================================
// Graceful shutdown
// ============================================
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();