"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const sanitize_1 = require("../utils/sanitize");
class LLMService {
    constructor() {
        this.client = null;
        if (config_1.config.anthropicApiKey && !config_1.config.enableMocking) {
            this.client = new sdk_1.default({
                apiKey: config_1.config.anthropicApiKey,
            });
        }
        else {
            logger_1.logger.warn('Claude API key not provided, using mock responses');
        }
    }
    async generateResponse(messages) {
        const sanitized = (0, sanitize_1.sanitizeMessages)(messages);
        if (!this.client || config_1.config.enableMocking) {
            return this.mockResponse(sanitized);
        }
        try {
            const response = await this.client.messages.create({
                model: config_1.config.llmModel,
                max_tokens: config_1.config.llmMaxTokens,
                messages: sanitized.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                })),
            });
            const content = response.content[0];
            return content.type === 'text' ? content.text : '';
        }
        catch (error) {
            logger_1.logger.error('Error generating LLM response:', error);
            throw new Error('Failed to generate response');
        }
    }
    async *streamResponse(messages) {
        const sanitized = (0, sanitize_1.sanitizeMessages)(messages);
        if (!this.client || config_1.config.enableMocking) {
            yield* this.mockStreamResponse(sanitized);
            return;
        }
        try {
            const stream = await this.client.messages.create({
                model: config_1.config.llmModel,
                max_tokens: config_1.config.llmMaxTokens,
                messages: sanitized.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                })),
                stream: true,
            });
            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    yield event.delta.text;
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error streaming LLM response:', error);
            throw new Error('Failed to stream response');
        }
    }
    mockResponse(messages) {
        const lastMessage = messages[messages.length - 1];
        return `Mock response to: "${lastMessage.content.substring(0, 50)}..."`;
    }
    async *mockStreamResponse(messages) {
        const response = this.mockResponse(messages);
        const words = response.split(' ');
        for (const word of words) {
            yield word + ' ';
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
}
exports.llmService = new LLMService();
