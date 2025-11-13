import { FastifyRequest, FastifyReply } from 'fastify';
import { ttsService } from '../services/ttsService';
import { TTSRequest } from '../types';
import { logger } from '../utils/logger';

export const ttsController = async (
  request: FastifyRequest<{ Body: TTSRequest }>,
  reply: FastifyReply
) => {
  const { text, voiceId } = request.body;

  try {
    const audioBuffer = await ttsService.textToSpeech(text, voiceId);

    reply
      .header('Content-Type', 'audio/mpeg')
      .header('Content-Length', audioBuffer.length)
      .send(audioBuffer);
  } catch (error) {
    logger.error('TTS error:', error);
    reply.status(500).send({ error: 'Failed to generate speech' });
  }
};