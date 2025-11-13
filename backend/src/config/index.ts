import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  
  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  
  // LLM Config
  llmModel: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
  llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),
  
  // TTS Config
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
  
  // Feature Flags
  enableMocking: process.env.ENABLE_MOCKING === 'true',
};