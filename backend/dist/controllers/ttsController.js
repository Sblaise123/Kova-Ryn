"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttsController = void 0;
const ttsService_1 = require("../services/ttsService");
const logger_1 = require("../utils/logger");
const ttsController = async (request, reply) => {
    const { text, voiceId } = request.body;
    try {
        const audioBuffer = await ttsService_1.ttsService.textToSpeech(text, voiceId);
        reply
            .header('Content-Type', 'audio/mpeg')
            .header('Content-Length', audioBuffer.length)
            .send(audioBuffer);
    }
    catch (error) {
        logger_1.logger.error('TTS error:', error);
        reply.status(500).send({ error: 'Failed to generate speech' });
    }
};
exports.ttsController = ttsController;
