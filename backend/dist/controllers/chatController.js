"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const llmService_1 = require("../services/llmService");
const storageService_1 = require("../services/storageService");
const logger_1 = require("../utils/logger");
const chatController = async (request, reply) => {
    try {
        const { messages, stream, conversationId } = request.body;
        // Validate request
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return reply.status(400).send({
                error: 'Invalid request: messages array is required'
            });
        }
        logger_1.logger.info(`Received chat request with ${messages.length} messages`);
        // Save user message
        const userMessage = messages[messages.length - 1];
        const convId = storageService_1.storageService.saveMessage(conversationId || '', userMessage);
        if (stream) {
            // Streaming response
            reply.raw.setHeader('Content-Type', 'text/event-stream');
            reply.raw.setHeader('Cache-Control', 'no-cache');
            reply.raw.setHeader('Connection', 'keep-alive');
            reply.raw.setHeader('Access-Control-Allow-Origin', '*');
            let fullResponse = '';
            try {
                for await (const chunk of llmService_1.llmService.streamResponse(messages)) {
                    fullResponse += chunk;
                    reply.raw.write(`data: ${JSON.stringify({ chunk })}\n\n`);
                }
                // Save assistant message
                storageService_1.storageService.saveMessage(convId, {
                    role: 'assistant',
                    content: fullResponse,
                    timestamp: Date.now(),
                });
                reply.raw.write(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`);
                reply.raw.end();
            }
            catch (error) {
                logger_1.logger.error('Streaming error:', error);
                reply.raw.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
                reply.raw.end();
            }
        }
        else {
            // Non-streaming response
            logger_1.logger.info('Generating response...');
            const content = await llmService_1.llmService.generateResponse(messages);
            logger_1.logger.info('Response generated successfully');
            // Save assistant message
            storageService_1.storageService.saveMessage(convId, {
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
    }
    catch (error) {
        logger_1.logger.error('Chat controller error:', error);
        // Return proper error response
        return reply.status(500).send({
            error: 'Failed to process chat request',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.chatController = chatController;
