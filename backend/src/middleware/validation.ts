import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
  stream: z.boolean().optional(),
  conversationId: z.string().optional(),
});

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional(),
});

export const validateChatRequest = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    ChatRequestSchema.parse(request.body);
  } catch (error) {
    reply.status(400).send({
      error: {
        message: 'Invalid request body',
        details: error,
      },
    });
  }
};

export const validateTTSRequest = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    TTSRequestSchema.parse(request.body);
  } catch (error) {
    reply.status(400).send({
      error: {
        message: 'Invalid request body',
        details: error,
      },
    });
  }
};