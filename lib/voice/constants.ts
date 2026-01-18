// Voice IDs
export const CHEONGGIUN_VOICE_ID = process.env.CHEONGGIUN_VOICE_ID || "de3dcaaa-317e-47e4-9302-777a1a6946f4";

// Model Configuration
export const TTS_MODEL = "sonic-3"; // Cartesia TTS
export const STT_MODEL = "whisper-large-v3-turbo"; // Groq STT

// Audio Configuration
export const AUDIO_CONFIG = {
  // STT (Speech-to-Text) - Input from microphone
  stt: {
    sampleRate: 16000,
    encoding: "pcm_s16le" as const,
    channels: 1,
    chunkSize: 3200, // ~200ms at 16kHz
  },
  // TTS (Text-to-Speech) - Output to speakers
  tts: {
    sampleRate: 44100, // CD quality for better audio
    encoding: "pcm_s16le" as const, // Int16 format
    container: "raw" as const,
  },
} as const;

// Voice Activity Detection
export const VAD_CONFIG = {
  minVolume: 0.1,
  silenceThresholdMs: 1200, // Wait 1.2s after user stops speaking
  maxSilenceDurationSecs: 2.0,
} as const;

// TTS Generation Config
export const TTS_GENERATION_CONFIG = {
  speed: 0.95, // Slightly slower for clarity
  volume: 1.0,
  emotion: "neutral" as const,
} as const;

// Supported Languages
export const VOICE_LANGUAGES = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh",
} as const;

// Voice Sidecar URLs
export const VOICE_SIDECAR_WS_URL = process.env.NEXT_PUBLIC_VOICE_SIDECAR_URL || "wss://cheonggiun-voice.fly.dev";
export const VOICE_SIDECAR_API_URL = process.env.VOICE_SIDECAR_API_URL || "https://cheonggiun-voice.fly.dev";
