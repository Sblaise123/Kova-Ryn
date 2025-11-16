"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const fastify = (0, fastify_1.default)({
    logger: false,
});
// CORS MUST be registered BEFORE routes
fastify.register(cors_1.default, {
    origin: true, // Allow all origins for now (debug)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});
// Register routes with /api prefix
fastify.register(routes_1.default, { prefix: '/api' });
// Error handler
fastify.setErrorHandler(errorHandler_1.errorHandler);
// Health check (no /api prefix)
fastify.get('/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.nodeEnv
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
            port: config_1.config.port,
            host: '0.0.0.0',
        });
        logger_1.logger.info(`Server running on port ${config_1.config.port}`);
        logger_1.logger.info(`Environment: ${config_1.config.nodeEnv}`);
        logger_1.logger.info(`CORS enabled for: ${config_1.config.corsOrigins.join(', ')}`);
    }
    catch (err) {
        logger_1.logger.error('Error starting server:', err);
        process.exit(1);
    }
};
// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`${signal} received, closing server gracefully`);
    await fastify.close();
    process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
start();
