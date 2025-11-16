"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttsService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class TTSService {
    constructor() {
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.apiKey = config_1.config.elevenLabsApiKey;
    }
    async textToSpeech(text, voiceId) {
        if (!this.apiKey || config_1.config.enableMocking) {
            return this.mockTTS(text);
        }
        const voice = voiceId || config_1.config.elevenLabsVoiceId;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/text-to-speech/${voice}`, {
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }, {
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            logger_1.logger.error('Error generating TTS:', error);
            throw new Error('Failed to generate speech');
        }
    }
    mockTTS(text) {
        logger_1.logger.info(`Mock TTS for text: ${text.substring(0, 50)}...`);
        // Return empty audio buffer for mock
        return Buffer.from([]);
    }
}
exports.ttsService = new TTSService();
