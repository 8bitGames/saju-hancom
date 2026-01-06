// Voice IDs
export const HANSA_VOICE_ID = process.env.HANSA_VOICE_ID || "b137312f-75f7-4241-b703-e5f39b3c7c40";

// Model Configuration
export const TTS_MODEL = "sonic-3"; // Cartesia TTS - lowest latency model
export const STT_MODEL = "whisper-large-v3-turbo"; // Groq STT
export const GEMINI_MODEL = "gemini-flash-latest";

// Audio Configuration - Optimized for low latency + high quality
export const AUDIO_CONFIG = {
  stt: {
    sampleRate: 16000,
    encoding: "pcm_s16le" as const,
    channels: 1,
  },
  tts: {
    // 44100Hz for highest quality, pcm_s16le for efficient streaming
    sampleRate: 44100,
    encoding: "pcm_s16le" as const,
    container: "raw" as const,
  },
} as const;

// Cartesia WebSocket Configuration - Optimized for real-time voice chat
export const CARTESIA_WS_CONFIG = {
  // Maximum time to buffer before starting generation (lower = faster first byte)
  // Default is 3000ms, we use 50ms for real-time voice chat
  maxBufferDelayMs: 50,
  // API version - use latest for best performance
  apiVersion: "2025-04-16" as const,
  // WebSocket URL
  wsUrl: "wss://api.cartesia.ai/tts/websocket",
} as const;

// Voice Activity Detection
export const VAD_CONFIG = {
  minVolume: 0.1,
  silenceThresholdMs: 500, // Wait 500ms after user stops speaking (fast response)
  maxSilenceDurationSecs: 3.0,
  minAudioDurationMs: 300, // Minimum audio to process (avoid short noise triggers)
} as const;
