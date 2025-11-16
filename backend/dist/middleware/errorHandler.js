"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, request, reply) => {
    logger_1.logger.error('Error handling request:', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
    });
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    reply.status(statusCode).send({
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString(),
        },
    });
};
exports.errorHandler = errorHandler;
