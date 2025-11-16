"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTTSRequest = exports.validateChatRequest = void 0;
const zod_1 = require("zod");
const MessageSchema = zod_1.z.object({
    role: zod_1.z.enum(['user', 'assistant', 'system']),
    content: zod_1.z.string().min(1).max(10000),
});
const ChatRequestSchema = zod_1.z.object({
    messages: zod_1.z.array(MessageSchema).min(1),
    stream: zod_1.z.boolean().optional(),
    conversationId: zod_1.z.string().optional(),
});
const TTSRequestSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(5000),
    voiceId: zod_1.z.string().optional(),
});
const validateChatRequest = async (request, reply) => {
    try {
        ChatRequestSchema.parse(request.body);
    }
    catch (error) {
        reply.status(400).send({
            error: {
                message: 'Invalid request body',
                details: error,
            },
        });
    }
};
exports.validateChatRequest = validateChatRequest;
const validateTTSRequest = async (request, reply) => {
    try {
        TTSRequestSchema.parse(request.body);
    }
    catch (error) {
        reply.status(400).send({
            error: {
                message: 'Invalid request body',
                details: error,
            },
        });
    }
};
exports.validateTTSRequest = validateTTSRequest;
