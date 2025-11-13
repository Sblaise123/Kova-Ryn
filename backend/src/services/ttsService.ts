import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

class TTSService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = config.elevenLabsApiKey;
  }

  async textToSpeech(text: string, voiceId?: string): Promise {
    if (!this.apiKey || config.enableMocking) {
      return this.mockTTS(text);
    }

    const voice = voiceId || config.elevenLabsVoiceId;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voice}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Error generating TTS:', error);
      throw new Error('Failed to generate speech');
    }
  }

  private mockTTS(text: string): Buffer {
    logger.info(`Mock TTS for text: ${text.substring(0, 50)}...`);
    // Return empty audio buffer for mock
    return Buffer.from([]);
  }
}

export const ttsService = new TTSService();