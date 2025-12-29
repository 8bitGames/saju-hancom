// Voice IDs
export const HANSA_VOICE_ID = process.env.HANSA_VOICE_ID || "b137312f-75f7-4241-b703-e5f39b3c7c40";

// Model Configuration
export const TTS_MODEL = "sonic-3"; // Cartesia TTS
export const STT_MODEL = "whisper-large-v3-turbo"; // Groq STT
export const GEMINI_MODEL = "gemini-2.0-flash";

// Audio Configuration
export const AUDIO_CONFIG = {
  stt: {
    sampleRate: 16000,
    encoding: "pcm_s16le" as const,
    channels: 1,
  },
  tts: {
    sampleRate: 24000,
    encoding: "pcm_f32le" as const,
    container: "raw" as const,
  },
} as const;

// Voice Activity Detection
export const VAD_CONFIG = {
  minVolume: 0.1,
  silenceThresholdMs: 2000, // Wait 2s after user stops speaking for better quality
  maxSilenceDurationSecs: 3.0,
  minAudioDurationMs: 500, // Minimum audio to process (avoid short noise triggers)
} as const;
