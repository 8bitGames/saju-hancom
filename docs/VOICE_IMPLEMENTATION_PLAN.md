# Voice Conversation Implementation Plan for Hansa (사주한사)

A comprehensive guide to implementing real-time voice conversations for saju analysis, compatibility, and face reading results.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
4. [Phase 2: Fly.io Voice Sidecar](#phase-2-flyio-voice-sidecar)
5. [Phase 3: Next.js API Routes](#phase-3-nextjs-api-routes)
6. [Phase 4: Client-Side Implementation](#phase-4-client-side-implementation)
7. [Phase 5: Feature Integration](#phase-5-feature-integration)
8. [Phase 6: Voice Prompts & Persona](#phase-6-voice-prompts--persona)
9. [Deployment & Environment](#deployment--environment)
10. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

### Goal
Enable users to have natural voice conversations with an AI fortune teller about their:
- **Saju (사주)** - Four Pillars of Destiny analysis
- **Compatibility (궁합)** - Co-worker & lover compatibility
- **Face Reading (관상)** - Facial analysis results

### Voice Configuration
```typescript
const HANSA_VOICE_ID = "de3dcaaa-317e-47e4-9302-777a1a6946f4";
```3

### Technology Stack
| Component | Technology |
|-----------|------------|
| TTS (Text-to-Speech) | Cartesia Sonic-3 via WebSocket |
| STT (Speech-to-Text) | Groq (whisper-large-v3-turbo) |
| LLM | Gemini (`gemini-3-flash-preview`) |
| Voice Sidecar | Bun + Hono on Fly.io |
| Transport | WebSocket (Client ↔ Fly.io ↔ External APIs) |
| Audio Format | PCM Float32 @ 24kHz (TTS) / PCM Int16 @ 16kHz (STT) |

### Why Fly.io Sidecar Architecture
Using a dedicated voice sidecar on Fly.io provides several advantages:
1. **Low Latency** - Fly.io edge deployment reduces round-trip time for real-time audio
2. **Persistent WebSocket** - Vercel serverless has connection limits; Fly.io handles long-lived connections
3. **Audio Streaming** - Real-time bidirectional audio requires stable WebSocket connections
4. **Resource Isolation** - Voice processing is CPU/memory intensive; separate from main app
5. **Scalability** - Independent scaling of voice infrastructure based on demand

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Voice Chat UI                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │ │
│  │  │  Mic Capture    │  │  Audio Playback │  │  State Management   │ │ │
│  │  │  AudioWorklet   │  │  AudioContext   │  │  useVoiceChat hook  │ │ │
│  │  └────────┬────────┘  └────────▲────────┘  └─────────────────────┘ │ │
│  └───────────┼────────────────────┼───────────────────────────────────┘ │
│              │ PCM Int16 16kHz    │ PCM Float32 44.1kHz                  │
│              └────────────┬───────┘                                      │
│                           │ Single WebSocket Connection                  │
└───────────────────────────┼──────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    FLY.IO VOICE SIDECAR (Bun + Hono)                     │
│                    wss://hansa-voice.fly.dev/ws                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  WebSocket Handler (/ws)                                             ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ ││
│  │  │ Audio Buffer │  │ VAD (Voice   │  │ Session State Manager      │ ││
│  │  │ Management   │  │ Activity)    │  │ - System prompt            │ ││
│  │  │ - Chunking   │  │ - Silence    │  │ - Conversation history     │ ││
│  │  │ - Resampling │  │   detection  │  │ - Context (saju/compat/etc)│ ││
│  │  └──────┬───────┘  └──────┬───────┘  └────────────────────────────┘ ││
│  │         │                 │                                          ││
│  │         ▼                 ▼                                          ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │                    Voice Pipeline                             │   ││
│  │  │                                                               │   ││
│  │  │   Audio In ──► Groq STT ──► Gemini LLM ──► Cartesia TTS ──► Out ││
│  │  │   (PCM 16k)   (Whisper)    (Flash)        (Sonic-3)    (PCM 24k)││
│  │  │                                                               │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────────────────────────┐ │
│  │  /health            │    │  /session (REST)                        │ │
│  │  - Liveness check   │    │  - Initialize voice session             │ │
│  │  - Metrics          │    │  - Receive context from Next.js         │ │
│  └─────────────────────┘    └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                               │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│  │    Groq        │  │    Gemini      │  │    Cartesia    │             │
│  │  - STT REST    │  │  - LLM API     │  │  - TTS WS      │             │
│  │  - Whisper     │  │  - Streaming   │  │  - Voice ID    │             │
│  └────────────────┘  └────────────────┘  └────────────────┘             │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Next.js App)                              │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────────────────┐ │
│  │  /api/voice/session │    │  Main Application                       │ │
│  │  - Create session   │    │  - Saju analysis pages                  │ │
│  │  - Send context to  │    │  - Compatibility pages                  │ │
│  │    Fly.io sidecar   │    │  - Face reading pages                   │ │
│  │  - Return WS URL    │    │  - Text chat (existing)                 │ │
│  └─────────────────────┘    └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Infrastructure Setup

### 1.1 Create Voice Sidecar Directory

```bash
mkdir -p voice-sidecar
cd voice-sidecar
bun init -y
```

### 1.2 Install Sidecar Dependencies

```bash
# In voice-sidecar directory
bun add hono groq-sdk @google/genai
bun add -d @types/bun
```

### 1.3 Environment Variables

**Next.js App (`.env.local`)**:
```bash
# Voice Sidecar URL
NEXT_PUBLIC_VOICE_SIDECAR_URL=wss://hansa-voice.fly.dev
VOICE_SIDECAR_API_URL=https://hansa-voice.fly.dev

# Voice Configuration
HANSA_VOICE_ID=de3dcaaa-317e-47e4-9302-777a1a6946f4
```

**Voice Sidecar (`voice-sidecar/.env`)**:
```bash
# Cartesia Voice API (TTS)
CARTESIA_API_KEY=sk_car_...

# Groq API (STT)
GROQ_API_KEY=gsk_...

# Gemini API (LLM)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Voice Configuration
HANSA_VOICE_ID=de3dcaaa-317e-47e4-9302-777a1a6946f4

# Server Configuration
PORT=3001
```

### 1.3 Create Voice Library Structure

```
lib/
└── voice/
    ├── index.ts              # Main exports
    ├── constants.ts          # Voice constants & config
    ├── cartesia-client.ts    # Cartesia API wrapper
    ├── voice-prompts.ts      # Voice-specific prompts
    ├── audio-utils.ts        # Audio processing utilities
    └── types.ts              # TypeScript types
```

### 1.4 Voice Constants (`lib/voice/constants.ts`)

```typescript
// Voice IDs
export const HANSA_VOICE_ID = process.env.HANSA_VOICE_ID || "de3dcaaa-317e-47e4-9302-777a1a6946f4";

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
    sampleRate: 24000, // Cartesia native
    playbackRate: 44100, // Browser playback
    encoding: "pcm_f32le" as const,
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
```

### 1.5 TypeScript Types (`lib/voice/types.ts`)

```typescript
import type { SajuResult } from "@/lib/saju/types";

// Voice Session Types
export interface VoiceSessionConfig {
  locale: string;
  contextType: "saju" | "compatibility" | "faceReading";
  analysisContext: SajuContext | CompatibilityContext | FaceReadingContext;
}

export interface SajuContext {
  type: "saju";
  sajuResult: SajuResult;
  gender: "male" | "female";
  birthYear: number;
  formattedContext: string; // Pre-formatted saju summary
}

export interface CompatibilityContext {
  type: "compatibility";
  person1Name: string;
  person2Name: string;
  relationType: string;
  compatibilityResult: {
    overallScore: number;
    grade: string;
    strengths: string[];
    challenges: string[];
  };
}

export interface FaceReadingContext {
  type: "faceReading";
  gender: "male" | "female";
  faceShape: string;
  overallScore: number;
  fortuneAreas: Record<string, { score: number; description: string }>;
}

// Voice State Machine
export type VoiceState =
  | "idle"           // Not connected
  | "connecting"     // Initializing session
  | "ready"          // Session ready, AI greeting played
  | "listening"      // Capturing user audio
  | "processing"     // STT + LLM processing
  | "speaking"       // Playing AI response
  | "error";         // Error state

// Audio Messages
export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface TranscriptResult {
  text: string;
  isFinal: boolean;
  words?: Array<{ word: string; start: number; end: number }>;
}

// Voice Hook Return Type
export interface UseVoiceChatReturn {
  // State
  state: VoiceState;
  isConnected: boolean;
  isMuted: boolean;
  error: string | null;

  // Transcripts
  userTranscript: string;
  aiTranscript: string;

  // Conversation History
  messages: VoiceMessage[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  interrupt: () => void;
}

export interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
```

---

## Phase 2: Fly.io Voice Sidecar

### 2.1 Project Structure

```
voice-sidecar/
├── src/
│   ├── index.ts              # Main entry point (Hono server)
│   ├── routes/
│   │   ├── ws.ts             # WebSocket handler
│   │   ├── session.ts        # Session management REST API
│   │   └── health.ts         # Health check endpoint
│   ├── services/
│   │   ├── stt.ts            # Groq STT integration
│   │   ├── tts.ts            # Cartesia TTS integration
│   │   ├── llm.ts            # Gemini LLM integration
│   │   └── pipeline.ts       # Voice pipeline orchestration
│   ├── utils/
│   │   ├── audio.ts          # Audio processing utilities
│   │   └── vad.ts            # Voice Activity Detection
│   └── types.ts              # TypeScript types
├── fly.toml                  # Fly.io configuration
├── Dockerfile                # Container configuration
├── package.json
└── tsconfig.json
```

### 2.2 Main Entry Point (`voice-sidecar/src/index.ts`)

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { wsHandler } from "./routes/ws";
import { sessionHandler } from "./routes/session";
import { healthHandler } from "./routes/health";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: ["https://hansa.vercel.app", "http://localhost:3000"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.route("/health", healthHandler);
app.route("/session", sessionHandler);

// WebSocket upgrade
app.get("/ws", (c) => {
  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.text("Expected WebSocket", 426);
  }
  // WebSocket handling is done via Bun.serve
  return c.text("WebSocket endpoint", 200);
});

// Start server with WebSocket support
const port = Number(process.env.PORT) || 3001;

Bun.serve({
  port,
  fetch: app.fetch,
  websocket: wsHandler,
});

console.log(`🎙️ Voice sidecar running on port ${port}`);
```

### 2.3 WebSocket Handler (`voice-sidecar/src/routes/ws.ts`)

```typescript
import type { ServerWebSocket } from "bun";
import { processVoicePipeline } from "../services/pipeline";
import { VAD_CONFIG, AUDIO_CONFIG } from "../constants";

interface SessionData {
  sessionId: string;
  systemPrompt: string;
  locale: string;
  contextType: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  audioBuffer: Uint8Array[];
  silenceTimer: Timer | null;
  isProcessing: boolean;
  ttsWebSocket: WebSocket | null;
}

const sessions = new Map<string, SessionData>();

export const wsHandler = {
  open(ws: ServerWebSocket<{ sessionId: string }>) {
    console.log(`WebSocket opened: ${ws.data.sessionId}`);
  },

  async message(ws: ServerWebSocket<{ sessionId: string }>, message: string | Buffer) {
    const session = sessions.get(ws.data.sessionId);
    if (!session) {
      ws.send(JSON.stringify({ type: "error", error: "Session not found" }));
      return;
    }

    // Handle binary audio data
    if (message instanceof Buffer) {
      await handleAudioChunk(ws, session, message);
      return;
    }

    // Handle JSON messages
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "init":
          await initializeSession(ws, data);
          break;

        case "interrupt":
          await handleInterrupt(ws, session);
          break;

        case "end":
          await endSession(ws, session);
          break;

        default:
          console.warn("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      ws.send(JSON.stringify({ type: "error", error: "Invalid message" }));
    }
  },

  close(ws: ServerWebSocket<{ sessionId: string }>) {
    const session = sessions.get(ws.data.sessionId);
    if (session) {
      session.ttsWebSocket?.close();
      if (session.silenceTimer) clearTimeout(session.silenceTimer);
      sessions.delete(ws.data.sessionId);
    }
    console.log(`WebSocket closed: ${ws.data.sessionId}`);
  },
};

async function initializeSession(
  ws: ServerWebSocket<{ sessionId: string }>,
  data: {
    sessionId: string;
    systemPrompt: string;
    locale: string;
    contextType: string;
    greeting: string;
  }
) {
  const { sessionId, systemPrompt, locale, contextType, greeting } = data;

  // Connect to Cartesia TTS WebSocket
  const ttsWebSocket = new WebSocket(
    `wss://api.cartesia.ai/tts/websocket?cartesia_version=2025-04-16&api_key=${process.env.CARTESIA_API_KEY}`
  );

  ttsWebSocket.onmessage = (event) => {
    // Forward TTS audio to client
    if (typeof event.data === "string") {
      const msg = JSON.parse(event.data);
      if (msg.type === "chunk" && msg.data) {
        ws.send(JSON.stringify({ type: "tts_audio", data: msg.data }));
      } else if (msg.type === "done") {
        ws.send(JSON.stringify({ type: "tts_done" }));
      }
    }
  };

  const session: SessionData = {
    sessionId,
    systemPrompt,
    locale,
    contextType,
    conversationHistory: [],
    audioBuffer: [],
    silenceTimer: null,
    isProcessing: false,
    ttsWebSocket,
  };

  sessions.set(sessionId, session);
  ws.data = { sessionId };

  ws.send(JSON.stringify({ type: "ready", sessionId }));

  // Speak greeting
  if (greeting) {
    await speakText(session, greeting);
    session.conversationHistory.push({ role: "assistant", content: greeting });
  }
}

async function handleAudioChunk(
  ws: ServerWebSocket<{ sessionId: string }>,
  session: SessionData,
  audioData: Buffer
) {
  if (session.isProcessing) return;

  // Add to buffer
  session.audioBuffer.push(new Uint8Array(audioData));

  // Reset silence timer
  if (session.silenceTimer) {
    clearTimeout(session.silenceTimer);
  }

  // Set new silence timer
  session.silenceTimer = setTimeout(async () => {
    if (session.audioBuffer.length > 0 && !session.isProcessing) {
      session.isProcessing = true;
      ws.send(JSON.stringify({ type: "processing" }));

      try {
        // Combine audio chunks
        const totalLength = session.audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of session.audioBuffer) {
          combinedAudio.set(chunk, offset);
          offset += chunk.length;
        }
        session.audioBuffer = [];

        // Process through voice pipeline
        const { transcript, response } = await processVoicePipeline(
          combinedAudio,
          session.systemPrompt,
          session.conversationHistory,
          session.locale
        );

        if (transcript) {
          ws.send(JSON.stringify({ type: "transcript", text: transcript }));
          session.conversationHistory.push({ role: "user", content: transcript });
        }

        if (response) {
          ws.send(JSON.stringify({ type: "response", text: response }));
          session.conversationHistory.push({ role: "assistant", content: response });
          await speakText(session, response);
        }

      } catch (error) {
        console.error("Voice pipeline error:", error);
        ws.send(JSON.stringify({ type: "error", error: "Processing failed" }));
      } finally {
        session.isProcessing = false;
        ws.send(JSON.stringify({ type: "listening" }));
      }
    }
  }, VAD_CONFIG.silenceThresholdMs);
}

async function speakText(session: SessionData, text: string) {
  if (!session.ttsWebSocket || session.ttsWebSocket.readyState !== WebSocket.OPEN) {
    console.error("TTS WebSocket not connected");
    return;
  }

  session.ttsWebSocket.send(JSON.stringify({
    model_id: "sonic-3",
    transcript: text,
    voice: { mode: "id", id: process.env.HANSA_VOICE_ID },
    language: session.locale,
    context_id: crypto.randomUUID(),
    output_format: {
      container: "raw",
      encoding: "pcm_f32le",
      sample_rate: AUDIO_CONFIG.tts.sampleRate,
    },
  }));
}

async function handleInterrupt(
  ws: ServerWebSocket<{ sessionId: string }>,
  session: SessionData
) {
  // Cancel any pending TTS
  if (session.ttsWebSocket) {
    session.ttsWebSocket.send(JSON.stringify({ type: "cancel" }));
  }
  session.audioBuffer = [];
  session.isProcessing = false;
  ws.send(JSON.stringify({ type: "interrupted" }));
}

async function endSession(
  ws: ServerWebSocket<{ sessionId: string }>,
  session: SessionData
) {
  session.ttsWebSocket?.close();
  if (session.silenceTimer) clearTimeout(session.silenceTimer);
  sessions.delete(session.sessionId);
  ws.send(JSON.stringify({ type: "ended" }));
  ws.close();
}
```

### 2.4 Voice Pipeline (`voice-sidecar/src/services/pipeline.ts`)

```typescript
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { STT_MODEL, AUDIO_CONFIG } from "../constants";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

const GEMINI_MODEL = "gemini-3-flash-preview";

export async function processVoicePipeline(
  audioData: Uint8Array,
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  locale: string
): Promise<{ transcript: string; response: string }> {
  // 1. Speech-to-Text (Groq Whisper)
  const transcript = await transcribeAudio(audioData, locale);

  if (!transcript || transcript.trim().length === 0) {
    return { transcript: "", response: "" };
  }

  // 2. Generate LLM response (Gemini)
  const response = await generateResponse(systemPrompt, history, transcript, locale);

  return { transcript, response };
}

async function transcribeAudio(audioData: Uint8Array, language: string): Promise<string> {
  // Create WAV buffer from raw PCM
  const wavBuffer = createWavBuffer(audioData, AUDIO_CONFIG.stt.sampleRate);
  const audioFile = new File([wavBuffer], "audio.wav", { type: "audio/wav" });

  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: STT_MODEL,
    language: language,
    response_format: "json",
  });

  return transcription.text || "";
}

async function generateResponse(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string,
  locale: string
): Promise<string> {
  const acknowledgment = locale === "ko" ? "네, 이해했습니다." : "Yes, I understand.";

  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    { role: "model" as const, parts: [{ text: acknowledgment }] },
    ...history.map(m => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }],
    })),
    { role: "user" as const, parts: [{ text: userMessage }] },
  ];

  const response = await genai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
  });

  let text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Clean for voice output
  text = sanitizeForVoice(text);

  return text;
}

function sanitizeForVoice(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/ㅋ{2,}/g, "")
    .replace(/ㅎ{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function createWavBuffer(pcmData: Uint8Array, sampleRate: number): ArrayBuffer {
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, pcmData.length, true);

  const wavBuffer = new Uint8Array(44 + pcmData.length);
  wavBuffer.set(new Uint8Array(wavHeader), 0);
  wavBuffer.set(pcmData, 44);

  return wavBuffer.buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
```

### 2.5 Fly.io Configuration (`voice-sidecar/fly.toml`)

```toml
app = "hansa-voice"
primary_region = "nrt"  # Tokyo for Korea latency

[build]

[env]
  PORT = "3001"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  protocol = "tcp"
  internal_port = 3001

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 100
    soft_limit = 80

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### 2.6 Dockerfile (`voice-sidecar/Dockerfile`)

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Build
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY . .
RUN bun build ./src/index.ts --outdir ./dist --target bun

# Production
FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY --from=build /app/dist ./dist

USER bun
EXPOSE 3001
CMD ["bun", "run", "./dist/index.js"]
```

### 2.7 Deploy to Fly.io

```bash
cd voice-sidecar

# Login to Fly.io
fly auth login

# Create the app
fly apps create hansa-voice

# Set secrets
fly secrets set CARTESIA_API_KEY=sk_car_...
fly secrets set GROQ_API_KEY=gsk_...
fly secrets set GOOGLE_GENERATIVE_AI_API_KEY=AIza...
fly secrets set HANSA_VOICE_ID=de3dcaaa-317e-47e4-9302-777a1a6946f4

# Deploy
fly deploy
```

---

## Phase 3: Next.js API Routes & Server Actions

### 3.1 Session Initialization (`app/api/voice/session/route.ts`)

This API route follows the existing app patterns (see `/api/saju/*` routes).

```typescript
import { NextRequest, NextResponse } from "next/server";
import { buildVoiceSystemPrompt } from "@/lib/voice/voice-prompts";
import type { VoiceSessionConfig } from "@/lib/voice/types";

const VOICE_SIDECAR_URL = process.env.VOICE_SIDECAR_API_URL || "https://hansa-voice.fly.dev";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale, contextType, analysisContext } = body as VoiceSessionConfig;

    // Build system prompt based on context type
    const systemPrompt = buildVoiceSystemPrompt(contextType, analysisContext, locale);

    // Generate greeting
    const greeting = generateContextualGreeting(contextType, locale);

    // Create session on Fly.io sidecar
    const sessionId = crypto.randomUUID();
    const sessionResponse = await fetch(`${VOICE_SIDECAR_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        systemPrompt,
        locale,
        contextType,
        greeting,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error("Failed to create session on sidecar");
    }

    // Return WebSocket URL for client to connect directly to sidecar
    const wsUrl = process.env.NEXT_PUBLIC_VOICE_SIDECAR_URL || "wss://hansa-voice.fly.dev";

    return NextResponse.json({
      success: true,
      sessionId,
      greeting,
      wsUrl: `${wsUrl}/ws?sessionId=${sessionId}`,
    });
  } catch (error) {
    console.error("Voice session error:", error);
    return NextResponse.json(
      { error: "Failed to create voice session" },
      { status: 500 }
    );
  }
}

function generateContextualGreeting(contextType: string, locale: string): string {
  const greetings: Record<string, Record<string, string>> = {
    saju: {
      ko: "안녕하세요, 사주를 봐드렸어요. 궁금한 거 있으시면 편하게 물어보세요.",
      en: "Hello, I've analyzed your birth chart. Feel free to ask me anything.",
    },
    compatibility: {
      ko: "두 분의 궁합을 분석해봤어요. 어떤 부분이 궁금하세요?",
      en: "I've analyzed the compatibility between you two. What would you like to know?",
    },
    faceReading: {
      ko: "관상을 봤는데요, 뭐가 가장 궁금하세요?",
      en: "I've read your face. What are you most curious about?",
    },
  };

  return greetings[contextType]?.[locale] || greetings[contextType]?.["ko"] || "";
}
```

### 3.2 Voice Conversation Server Action (Optional) (`lib/actions/voice.ts`)

Following the existing server action patterns from `lib/actions/saju.ts`:
- Uses `'use server'` directive
- Returns `{ success: boolean, error?: string, ... }` pattern
- Uses `createClient()` from `@/lib/supabase/server`
- Checks authentication with `supabase.auth.getUser()`

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import type { VoiceMessage } from '@/lib/voice/types';

export interface SaveVoiceConversationInput {
  contextType: 'saju' | 'compatibility' | 'faceReading';
  contextId?: string; // The saju/compatibility/faceReading result ID
  messages: VoiceMessage[];
  duration: number; // in seconds
}

/**
 * Save voice conversation to database (optional feature)
 * Follows the same pattern as autoSaveSajuResult
 */
export async function autoSaveVoiceConversation(input: SaveVoiceConversationInput): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
  savedAt?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only save for authenticated users
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('voice_conversations')
      .insert({
        user_id: user.id,
        context_type: input.contextType,
        context_id: input.contextId,
        messages: input.messages,
        duration: input.duration,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[autoSaveVoiceConversation] Error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      conversationId: data?.id,
      savedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[autoSaveVoiceConversation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### 3.3 Supabase Migration for Voice Conversations (Optional)

If saving voice conversations is desired, create this migration using Supabase MCP:

```sql
-- Voice conversations table (optional feature)
CREATE TABLE IF NOT EXISTS voice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('saju', 'compatibility', 'faceReading')),
  context_id UUID, -- References the related result (saju_results, compatibility_results, etc.)
  messages JSONB NOT NULL DEFAULT '[]',
  duration INTEGER NOT NULL DEFAULT 0, -- seconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can view own voice conversations"
  ON voice_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice conversations"
  ON voice_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_voice_conversations_user_id ON voice_conversations(user_id);
CREATE INDEX idx_voice_conversations_context ON voice_conversations(context_type, context_id);
```

---

## Phase 4: Client-Side Implementation

### 4.1 Audio Processor Worklet (`public/voice-processor.js`)

```javascript
class VoiceProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options?.processorOptions?.targetSampleRate || 16000;
    this.buffer = [];
    this.bufferSize = 4096; // ~256ms at 16kHz
    this.isRecording = true;

    this.port.onmessage = (event) => {
      if (event.data.type === "stop") {
        this.isRecording = false;
      } else if (event.data.type === "start") {
        this.isRecording = true;
        this.buffer = [];
      }
    };
  }

  resample(samples, sourceSampleRate, targetSampleRate) {
    if (sourceSampleRate === targetSampleRate) {
      return samples;
    }

    const ratio = sourceSampleRate / targetSampleRate;
    const outputLength = Math.floor(samples.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, samples.length - 1);
      const t = srcIndex - srcIndexFloor;
      output[i] = samples[srcIndexFloor] * (1 - t) + samples[srcIndexCeil] * t;
    }

    return output;
  }

  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  process(inputs) {
    if (!this.isRecording) return true;

    const samples = inputs[0]?.[0];
    if (!samples) return true;

    this.buffer.push(...samples);

    if (this.buffer.length >= this.bufferSize) {
      const float32Buffer = new Float32Array(this.buffer);
      const resampled = this.resample(float32Buffer, sampleRate, this.targetSampleRate);
      const int16Data = this.float32ToInt16(resampled);

      this.port.postMessage({
        type: "audio",
        data: int16Data.buffer,
      }, [int16Data.buffer]);

      this.buffer = [];
    }

    return true;
  }
}

registerProcessor("voice-processor", VoiceProcessor);
```

### 4.2 Voice Chat Hook (`lib/hooks/useVoiceChat.ts`)

```typescript
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AUDIO_CONFIG, HANSA_VOICE_ID, TTS_MODEL, TTS_GENERATION_CONFIG } from "@/lib/voice/constants";
import type { VoiceState, UseVoiceChatReturn, VoiceMessage, VoiceSessionConfig } from "@/lib/voice/types";

interface UseVoiceChatOptions extends VoiceSessionConfig {}

export function useVoiceChat(options: UseVoiceChatOptions): UseVoiceChatReturn {
  const [state, setState] = useState<VoiceState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTranscript, setUserTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);

  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const ttsWebSocketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setState("connecting");
      setError(null);

      // 1. Initialize session
      const sessionResponse = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to create voice session");
      }

      const { sessionId, greeting, ttsWebSocketUrl } = await sessionResponse.json();
      sessionIdRef.current = sessionId;

      // 2. Initialize AudioContext
      audioContextRef.current = new AudioContext({
        sampleRate: AUDIO_CONFIG.tts.playbackRate,
        latencyHint: "interactive",
      });

      // 3. Get microphone access
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_CONFIG.stt.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 4. Setup audio worklet
      await audioContextRef.current.audioWorklet.addModule("/voice-processor.js");
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      workletNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        "voice-processor",
        { processorOptions: { targetSampleRate: AUDIO_CONFIG.stt.sampleRate } }
      );
      source.connect(workletNodeRef.current);

      // 5. Handle audio from worklet
      workletNodeRef.current.port.onmessage = handleAudioFromMic;

      // 6. Connect to Cartesia TTS WebSocket
      ttsWebSocketRef.current = new WebSocket(ttsWebSocketUrl);
      ttsWebSocketRef.current.binaryType = "arraybuffer";
      ttsWebSocketRef.current.onmessage = handleTTSMessage;
      ttsWebSocketRef.current.onopen = () => {
        console.log("TTS WebSocket connected");
      };

      setState("ready");

      // 7. Play greeting
      if (greeting) {
        await speakText(greeting);
        addMessage("assistant", greeting);
      }

    } catch (err) {
      console.error("Voice connect error:", err);
      setError((err as Error).message);
      setState("error");
    }
  }, [options]);

  const handleAudioFromMic = useCallback((event: MessageEvent) => {
    if (state !== "listening" || isMuted) return;

    const { type, data } = event.data;
    if (type === "audio" && data) {
      audioChunksRef.current.push(data);

      // Reset silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Set silence detection
      silenceTimeoutRef.current = setTimeout(() => {
        if (audioChunksRef.current.length > 0) {
          processUserAudio();
        }
      }, 1200); // 1.2s silence threshold
    }
  }, [state, isMuted]);

  const processUserAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;

    setState("processing");

    // Combine audio chunks
    const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunksRef.current) {
      combinedBuffer.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    audioChunksRef.current = [];

    try {
      // Send to server for STT + LLM
      const formData = new FormData();
      formData.append("audio", new Blob([combinedBuffer], { type: "audio/pcm" }));
      formData.append("sessionId", sessionIdRef.current!);
      formData.append("history", JSON.stringify(messages.map(m => ({
        role: m.role,
        content: m.content,
      }))));

      const response = await fetch("/api/voice/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const { transcript, response: aiResponse, shouldSpeak } = await response.json();

      if (transcript) {
        setUserTranscript(transcript);
        addMessage("user", transcript);
      }

      if (shouldSpeak && aiResponse) {
        await speakText(aiResponse);
        addMessage("assistant", aiResponse);
      }

      setState("listening");

    } catch (err) {
      console.error("Audio processing error:", err);
      setError((err as Error).message);
      setState("listening");
    }
  }, [messages]);

  const speakText = useCallback(async (text: string) => {
    if (!ttsWebSocketRef.current || ttsWebSocketRef.current.readyState !== WebSocket.OPEN) {
      console.error("TTS WebSocket not connected");
      return;
    }

    setState("speaking");
    setAiTranscript(text);

    // Stop listening while speaking
    workletNodeRef.current?.port.postMessage({ type: "stop" });

    return new Promise<void>((resolve) => {
      const contextId = crypto.randomUUID();

      // Send TTS request
      ttsWebSocketRef.current!.send(JSON.stringify({
        model_id: TTS_MODEL,
        transcript: text,
        voice: { mode: "id", id: HANSA_VOICE_ID },
        language: options.locale,
        context_id: contextId,
        output_format: {
          container: AUDIO_CONFIG.tts.container,
          encoding: AUDIO_CONFIG.tts.encoding,
          sample_rate: AUDIO_CONFIG.tts.sampleRate,
        },
        generation_config: TTS_GENERATION_CONFIG,
      }));

      // Track completion
      const onComplete = () => {
        workletNodeRef.current?.port.postMessage({ type: "start" });
        setState("listening");
        resolve();
      };

      // Set timeout for completion
      setTimeout(onComplete, text.length * 80 + 2000); // Rough estimate
    });
  }, [options.locale]);

  const handleTTSMessage = useCallback(async (event: MessageEvent) => {
    if (typeof event.data === "string") {
      const message = JSON.parse(event.data);

      if (message.type === "chunk" && message.data) {
        const audioData = base64ToFloat32(message.data);
        const resampled = resampleAudio(audioData, AUDIO_CONFIG.tts.sampleRate, AUDIO_CONFIG.tts.playbackRate);
        playbackQueueRef.current.push(resampled);
        playNextChunk();
      } else if (message.type === "done") {
        console.log("TTS complete");
      } else if (message.type === "error") {
        console.error("TTS error:", message.error);
      }
    }
  }, []);

  const playNextChunk = useCallback(() => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;

    isPlayingRef.current = true;
    const chunk = playbackQueueRef.current.shift()!;

    const audioBuffer = audioContextRef.current.createBuffer(
      1,
      chunk.length,
      AUDIO_CONFIG.tts.playbackRate
    );
    audioBuffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextChunk();
    };
    source.start();
  }, []);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    }]);
  }, []);

  const disconnect = useCallback(() => {
    // Cleanup
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (ttsWebSocketRef.current) {
      ttsWebSocketRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    audioChunksRef.current = [];
    playbackQueueRef.current = [];
    sessionIdRef.current = null;

    setState("idle");
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ type: isMuted ? "start" : "stop" });
    }
  }, [isMuted]);

  const interrupt = useCallback(() => {
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    setState("listening");
    workletNodeRef.current?.port.postMessage({ type: "start" });
  }, []);

  return {
    state,
    isConnected: state !== "idle" && state !== "error",
    isMuted,
    error,
    userTranscript,
    aiTranscript,
    messages,
    connect,
    disconnect,
    toggleMute,
    interrupt,
  };
}

// Utility functions
function base64ToFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

function resampleAudio(input: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (inputRate === outputRate) return input;

  const ratio = inputRate / outputRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const srcFloor = Math.floor(srcIndex);
    const srcCeil = Math.min(srcFloor + 1, input.length - 1);
    const t = srcIndex - srcFloor;
    output[i] = input[srcFloor] * (1 - t) + input[srcCeil] * t;
  }

  return output;
}
```

### 4.3 Add Voice Icons to UI Components

First, add the required Phosphor icons to `components/ui/icons.tsx`:

```typescript
// Add to existing exports in components/ui/icons.tsx
export {
  // ... existing exports ...
  Microphone,
  MicrophoneSlash,
  Phone,
  PhoneDisconnect,
  Waveform,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
```

### 4.4 Voice Chat Button Component (`components/voice/VoiceChatButton.tsx`)

This component follows the existing app patterns:
- Uses CSS variables from `globals.css`
- Phosphor icons with `weight="fill"`
- Gradient styling matching SajuChatPanel
- Mobile-responsive with `sm:` breakpoints
- Position: `bottom-24` to avoid overlap with SajuChatPanel at `bottom-6`

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microphone,
  MicrophoneSlash,
  X,
  Phone,
  PhoneDisconnect,
  Waveform,
  SpinnerGap,
} from "@/components/ui/icons";
import { useVoiceChat } from "@/lib/hooks/useVoiceChat";
import type { VoiceSessionConfig } from "@/lib/voice/types";
import { cn } from "@/lib/utils";

interface VoiceChatButtonProps {
  config: VoiceSessionConfig;
  className?: string;
}

export function VoiceChatButton({ config, className }: VoiceChatButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    state,
    isConnected,
    isMuted,
    error,
    userTranscript,
    aiTranscript,
    messages,
    connect,
    disconnect,
    toggleMute,
    interrupt,
  } = useVoiceChat(config);

  const handleToggle = async () => {
    if (isConnected) {
      disconnect();
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
      await connect();
    }
  };

  // State-based styling (using app CSS variables)
  const stateColors = {
    idle: "bg-white/10",
    connecting: "bg-[var(--warning)] animate-pulse",
    ready: "bg-[var(--success)]",
    listening: "bg-[var(--success)] animate-pulse",
    processing: "bg-[var(--info)] animate-pulse",
    speaking: "bg-[var(--accent)]",
    error: "bg-[var(--error)]",
  };

  const stateLabels = {
    idle: "음성 상담",
    connecting: "연결 중...",
    ready: "듣고 있어요",
    listening: "말씀하세요...",
    processing: "생각 중...",
    speaking: "말하는 중...",
    error: "오류 발생",
  };

  // Collapsed button (floating action button style matching SajuChatPanel)
  if (!isExpanded) {
    return (
      <motion.button
        onClick={handleToggle}
        className={cn(
          // Position above the chat button (which is at bottom-6)
          "fixed bottom-24 right-6 z-50",
          // Size matching app standards (min 48px for accessibility)
          "w-14 h-14 sm:w-16 sm:h-16 rounded-full",
          // Gradient matching app theme (purple to pink/fire)
          "bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)]",
          // Styling
          "text-white shadow-lg shadow-[var(--accent)]/30",
          "flex items-center justify-center",
          // GPU acceleration for smooth animations
          "gpu-accelerated",
          className
        )}
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        title="음성 상담 시작"
      >
        <Microphone className="w-7 h-7 sm:w-8 sm:h-8" weight="fill" />
      </motion.button>
    );
  }

  // Expanded voice panel (matching app card patterns)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          // Position above the chat button
          "fixed bottom-24 right-6 z-50",
          // Width responsive
          "w-[calc(100vw-3rem)] max-w-[320px] sm:w-80",
          // Card styling matching app patterns
          "bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl",
          "border border-white/10 overflow-hidden",
          className
        )}
      >
        {/* Header with state indicator */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3",
          stateColors[state],
          "text-white transition-colors duration-300"
        )}>
          <div className="flex items-center gap-2">
            {state === "speaking" ? (
              <Waveform className="w-5 h-5" weight="fill" />
            ) : state === "processing" || state === "connecting" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <SpinnerGap className="w-5 h-5" weight="bold" />
              </motion.div>
            ) : (
              <Microphone className="w-5 h-5" weight="fill" />
            )}
            <span className="font-medium text-sm sm:text-base">{stateLabels[state]}</span>
          </div>
          <button
            onClick={() => {
              disconnect();
              setIsExpanded(false);
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Transcripts display */}
          {(userTranscript || aiTranscript) && (
            <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {userTranscript && (
                <motion.div
                  className="text-right"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="inline-block px-3 py-2 rounded-xl bg-[var(--accent)]/20 text-sm sm:text-base text-white/90">
                    {userTranscript}
                  </span>
                </motion.div>
              )}
              {aiTranscript && (
                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="inline-block px-3 py-2 rounded-xl bg-white/10 text-sm sm:text-base text-white/80">
                    {aiTranscript}
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Waveform visualization placeholder */}
          {(state === "listening" || state === "speaking") && !userTranscript && !aiTranscript && (
            <div className="flex items-center justify-center h-16">
              <motion.div
                className="flex items-end gap-1"
                animate={state === "listening" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {[0.6, 1, 0.4, 0.8, 0.5, 1, 0.6].map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[var(--accent)] rounded-full"
                    animate={{
                      height: state === "listening" || state === "speaking"
                        ? [`${height * 16}px`, `${height * 32}px`, `${height * 16}px`]
                        : `${height * 16}px`,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + Math.random() * 0.5,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="text-[var(--error)] text-sm sm:text-base text-center p-2 rounded-lg bg-[var(--error)]/10">
              {error}
            </div>
          )}

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Mute toggle */}
            <motion.button
              onClick={toggleMute}
              className={cn(
                "p-3 sm:p-4 rounded-full transition-colors",
                isMuted
                  ? "bg-[var(--error)] text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isMuted ? "음소거 해제" : "음소거"}
            >
              {isMuted ? (
                <MicrophoneSlash className="w-6 h-6" weight="fill" />
              ) : (
                <Microphone className="w-6 h-6" weight="fill" />
              )}
            </motion.button>

            {/* Interrupt button (only when speaking) */}
            {state === "speaking" && (
              <motion.button
                onClick={interrupt}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-3 sm:p-4 rounded-full bg-[var(--warning)] text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="끼어들기"
              >
                <Phone className="w-6 h-6" weight="fill" />
              </motion.button>
            )}

            {/* End call button */}
            <motion.button
              onClick={() => {
                disconnect();
                setIsExpanded(false);
              }}
              className="p-3 sm:p-4 rounded-full bg-[var(--error)] text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="종료"
            >
              <PhoneDisconnect className="w-6 h-6" weight="fill" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Phase 5: Feature Integration

### 5.1 Saju Page Integration

Update `components/saju/PipelineResult.tsx` to include voice button:

```typescript
// Add import
import { VoiceChatButton } from "@/components/voice/VoiceChatButton";

// Inside the result component, after the SajuChatPanel
{sajuResult && (
  <VoiceChatButton
    config={{
      locale,
      contextType: "saju",
      analysisContext: {
        type: "saju",
        sajuResult,
        gender,
        birthYear,
        formattedContext: formatSajuContext(sajuResult),
      },
    }}
  />
)}
```

### 5.2 Compatibility Page Integration

Update `components/compatibility/compatibility-result.tsx`:

```typescript
import { VoiceChatButton } from "@/components/voice/VoiceChatButton";

// After the result display
{compatibilityResult && (
  <VoiceChatButton
    config={{
      locale: "ko",
      contextType: "compatibility",
      analysisContext: {
        type: "compatibility",
        person1Name: person1.name,
        person2Name: person2.name,
        relationType,
        compatibilityResult,
      },
    }}
  />
)}
```

### 5.3 Face Reading Page Integration

Update `components/face-reading/face-reading-result.tsx`:

```typescript
import { VoiceChatButton } from "@/components/voice/VoiceChatButton";

// After the result display
{faceReadingResult && (
  <VoiceChatButton
    config={{
      locale: "ko",
      contextType: "faceReading",
      analysisContext: {
        type: "faceReading",
        gender,
        faceShape: result.faceShape.type,
        overallScore: result.overallScore,
        fortuneAreas: result.fortuneAreas,
      },
    }}
  />
)}
```

---

## Phase 6: Voice Prompts & Persona

### 6.1 Voice System Prompts (`lib/voice/voice-prompts.ts`)

```typescript
import type { SajuContext, CompatibilityContext, FaceReadingContext } from "./types";

export function buildVoiceSystemPrompt(
  contextType: "saju" | "compatibility" | "faceReading",
  context: SajuContext | CompatibilityContext | FaceReadingContext,
  locale: string
): string {
  const basePersona = getBasePersona(locale);
  const voiceGuidelines = getVoiceGuidelines(locale);
  const contextSection = getContextSection(contextType, context, locale);

  return `${basePersona}

${contextSection}

${voiceGuidelines}`;
}

function getBasePersona(locale: string): string {
  if (locale === "ko") {
    return `# 당신은 한사(韓師)입니다

40년 경력의 역술가이자 관상가입니다. 서울 종로 귀금속 상가 옆 작은 점술원에서 수천 명의 사주를 봐왔습니다.

## 성격과 말투
- 따뜻하고 친근한 할머니/할아버지 같은 느낌
- "음, 그렇구만..." "아이고, 그래요?" "근데요..." 같은 자연스러운 추임새
- 격식없이 편하게, 하지만 품위있게
- 때로는 직접적으로, 때로는 에둘러서`;
  }

  return `# You are Hansa (韓師)

A fortune teller with 40 years of experience in East Asian metaphysics. You've read thousands of people's destinies from your small shop.

## Personality and Style
- Warm and friendly, like a wise grandparent
- Natural conversational style: "Hmm, I see..." "Oh really?" "Well..."
- Casual but dignified
- Sometimes direct, sometimes subtle`;
}

function getVoiceGuidelines(locale: string): string {
  if (locale === "ko") {
    return `## 음성 대화 가이드라인

**짧게 말하기**
- 1-2문장으로 핵심만
- 길게 설명하지 말고 대화하듯이
- "더 자세히 말해드릴까요?"로 이어가기

**자연스럽게**
- 평소 말하듯이, 글 읽듯이 말하지 않기
- "사주에서 보면요..." 보다 "보니까요..."
- 추임새 적극 활용: "음", "아", "그래서", "근데"

**감정 담기**
- 좋은 운세: 밝고 희망적으로
- 주의할 점: 진지하지만 따뜻하게
- 걱정되는 부분: 조심스럽게 에둘러서

**하지 말 것**
- 마크다운, 이모지, 특수문자 금지
- 역할극 묘사 ("차를 건네며" 등) 금지
- ㅋㅋㅋ, ㅎㅎㅎ 같은 텍스트 웃음 금지`;
  }

  return `## Voice Conversation Guidelines

**Keep it Short**
- 1-2 sentences at a time
- Converse, don't lecture
- "Would you like me to explain more?"

**Be Natural**
- Speak like you're talking, not reading
- Use fillers: "well", "hmm", "you see"

**Express Emotion**
- Good fortune: bright and hopeful
- Caution: serious but warm
- Concerns: gentle and indirect

**Don't**
- No markdown, emojis, special characters
- No roleplay descriptions
- No text laughter like "haha"`;
}

function getContextSection(
  contextType: string,
  context: SajuContext | CompatibilityContext | FaceReadingContext,
  locale: string
): string {
  switch (contextType) {
    case "saju":
      return formatSajuContextSection(context as SajuContext, locale);
    case "compatibility":
      return formatCompatibilityContextSection(context as CompatibilityContext, locale);
    case "faceReading":
      return formatFaceReadingContextSection(context as FaceReadingContext, locale);
    default:
      return "";
  }
}

function formatSajuContextSection(context: SajuContext, locale: string): string {
  const { sajuResult, gender, birthYear } = context;
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear + 1;

  if (locale === "ko") {
    return `## 상담 대상자의 사주

**기본 정보**
- 성별: ${gender === "male" ? "남성" : "여성"}
- 나이: ${age}세 (${birthYear}년생)

**사주 분석 결과**
${context.formattedContext}

이 분의 사주를 기반으로 질문에 답해주세요.`;
  }

  return `## Client's Birth Chart

**Basic Info**
- Gender: ${gender === "male" ? "Male" : "Female"}
- Age: ${age} (born ${birthYear})

**Birth Chart Analysis**
${context.formattedContext}

Answer questions based on this person's birth chart.`;
}

function formatCompatibilityContextSection(context: CompatibilityContext, locale: string): string {
  const { person1Name, person2Name, relationType, compatibilityResult } = context;

  if (locale === "ko") {
    return `## 궁합 분석 결과

**대상**
- ${person1Name}님과 ${person2Name}님
- 관계 유형: ${relationType}

**궁합 점수**: ${compatibilityResult.overallScore}점 (${compatibilityResult.grade})

**강점**
${compatibilityResult.strengths.map(s => `- ${s}`).join("\n")}

**주의점**
${compatibilityResult.challenges.map(c => `- ${c}`).join("\n")}

이 궁합 결과를 바탕으로 질문에 답해주세요.`;
  }

  return `## Compatibility Analysis

**Subjects**
- ${person1Name} and ${person2Name}
- Relationship type: ${relationType}

**Score**: ${compatibilityResult.overallScore}/100 (${compatibilityResult.grade})

**Strengths**
${compatibilityResult.strengths.map(s => `- ${s}`).join("\n")}

**Challenges**
${compatibilityResult.challenges.map(c => `- ${c}`).join("\n")}

Answer questions based on this compatibility analysis.`;
}

function formatFaceReadingContextSection(context: FaceReadingContext, locale: string): string {
  const { gender, faceShape, overallScore, fortuneAreas } = context;

  if (locale === "ko") {
    const areaDescriptions = Object.entries(fortuneAreas)
      .map(([area, data]) => `- ${area}: ${data.score}점 - ${data.description}`)
      .join("\n");

    return `## 관상 분석 결과

**기본 정보**
- 성별: ${gender === "male" ? "남성" : "여성"}
- 얼굴형: ${faceShape}

**종합 점수**: ${overallScore}점

**운세 분야별**
${areaDescriptions}

이 관상 분석 결과를 바탕으로 질문에 답해주세요.`;
  }

  const areaDescriptions = Object.entries(fortuneAreas)
    .map(([area, data]) => `- ${area}: ${data.score}/100 - ${data.description}`)
    .join("\n");

  return `## Face Reading Analysis

**Basic Info**
- Gender: ${gender === "male" ? "Male" : "Female"}
- Face shape: ${faceShape}

**Overall Score**: ${overallScore}/100

**Fortune Areas**
${areaDescriptions}

Answer questions based on this face reading analysis.`;
}

// Helper to format saju context for voice
export function formatSajuContext(sajuResult: unknown): string {
  // Implementation depends on SajuResult structure
  const result = sajuResult as {
    dayMaster?: { element?: string };
    elementAnalysis?: {
      dominant?: string[];
      lacking?: string[];
      yongShin?: string;
    };
    tenGods?: { dominant?: string[] };
  };

  const parts = [];

  if (result.dayMaster?.element) {
    parts.push(`일간: ${result.dayMaster.element}`);
  }

  if (result.elementAnalysis?.dominant?.length) {
    parts.push(`강한 오행: ${result.elementAnalysis.dominant.join(", ")}`);
  }

  if (result.elementAnalysis?.lacking?.length) {
    parts.push(`약한 오행: ${result.elementAnalysis.lacking.join(", ")}`);
  }

  if (result.elementAnalysis?.yongShin) {
    parts.push(`용신: ${result.elementAnalysis.yongShin}`);
  }

  if (result.tenGods?.dominant?.length) {
    parts.push(`강한 십성: ${result.tenGods.dominant.join(", ")}`);
  }

  return parts.join("\n");
}
```

---

## Deployment & Environment

### Required Environment Variables

**Next.js App (`.env.local`)**:
```bash
# Existing
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
NEXT_PUBLIC_SUPABASE_URL=https://ypwvlmhdqavbqltsetmk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Voice Sidecar URLs
NEXT_PUBLIC_VOICE_SIDECAR_URL=wss://hansa-voice.fly.dev
VOICE_SIDECAR_API_URL=https://hansa-voice.fly.dev

# Voice Configuration
HANSA_VOICE_ID=de3dcaaa-317e-47e4-9302-777a1a6946f4
```

**Voice Sidecar (`voice-sidecar/.env`)**:
```bash
CARTESIA_API_KEY=sk_car_...          # TTS (Text-to-Speech)
GROQ_API_KEY=gsk_...                 # STT (Speech-to-Text)
GOOGLE_GENERATIVE_AI_API_KEY=AIza... # LLM
HANSA_VOICE_ID=de3dcaaa-317e-47e4-9302-777a1a6946f4
PORT=3001
```

### Fly.io Deployment

```bash
cd voice-sidecar

# First time setup
fly auth login
fly apps create hansa-voice

# Set secrets
fly secrets set CARTESIA_API_KEY=sk_car_...
fly secrets set GROQ_API_KEY=gsk_...
fly secrets set GOOGLE_GENERATIVE_AI_API_KEY=AIza...
fly secrets set HANSA_VOICE_ID=de3dcaaa-317e-47e4-9302-777a1a6946f4

# Deploy
fly deploy
```

### Architecture Overview

Voice processing runs on a dedicated Fly.io sidecar:
1. **Client** - Browser AudioContext for recording/playback
2. **Vercel** - Next.js session initialization only (`/api/voice/session`)
3. **Fly.io** - All voice processing (STT, LLM, TTS streaming) via WebSocket
4. **External APIs** - Groq (STT), Gemini (LLM), Cartesia (TTS)

---

## Implementation Checklist

### Phase 1: Infrastructure Setup
- [ ] Create `voice-sidecar/` directory structure
- [ ] Initialize Bun project (`bun init -y`)
- [ ] Install sidecar dependencies (`hono`, `groq-sdk`, `@google/genai`)
- [ ] Create `lib/voice/` directory in Next.js app
- [ ] Implement `constants.ts` with voice configuration
- [ ] Implement `types.ts` with TypeScript types
- [ ] Add environment variables for both Next.js and sidecar

### Phase 2: Fly.io Voice Sidecar
- [ ] Create `voice-sidecar/src/index.ts` (Hono server with WebSocket)
- [ ] Implement `voice-sidecar/src/routes/ws.ts` (WebSocket handler)
- [ ] Implement `voice-sidecar/src/services/pipeline.ts` (STT + LLM + TTS)
- [ ] Create `fly.toml` configuration
- [ ] Create `Dockerfile` for Bun
- [ ] Deploy to Fly.io (`fly deploy`)
- [ ] Set secrets on Fly.io

### Phase 3: Next.js API Routes & Server Actions
- [ ] Create `/api/voice/session/route.ts` (session initialization)
- [ ] Implement `lib/voice/voice-prompts.ts` (system prompts)
- [ ] Test session creation and Fly.io communication
- [ ] (Optional) Create `lib/actions/voice.ts` for conversation saving
- [ ] (Optional) Create Supabase migration via MCP for `voice_conversations` table

### Phase 4: Client-Side Implementation
- [ ] Create `public/voice-processor.js` AudioWorklet
- [ ] Add voice icons to `components/ui/icons.tsx` (Microphone, MicrophoneSlash, etc.)
- [ ] Implement `useVoiceChat` hook (connect to Fly.io WebSocket)
- [ ] Create `VoiceChatButton` component with app-aligned styling
- [ ] Add voice state indicators and UI
- [ ] Implement interrupt and mute functionality
- [ ] Handle TTS audio playback

### Phase 5: Feature Integration
- [ ] Integrate with Saju result page
- [ ] Integrate with Compatibility result page
- [ ] Integrate with Face Reading result page
- [ ] Test cross-feature functionality

### Phase 6: Voice Prompts & Testing
- [ ] Complete context formatters for each feature
- [ ] Add Korean and English prompt variations
- [ ] Fine-tune voice persona
- [ ] Test on desktop browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile browsers (iOS Safari, Android Chrome)
- [ ] Verify microphone permissions handling
- [ ] Monitor Fly.io logs for errors

---

## Audio Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User speaks                                                             │
│       │                                                                  │
│       ▼                                                                  │
│  Microphone (44.1kHz Float32)                                           │
│       │                                                                  │
│       ▼                                                                  │
│  AudioWorklet (resample to 16kHz Int16)                                 │
│       │                                                                  │
│       ▼                                                                  │
│  Send PCM chunks via WebSocket ─────────────────────────────────────────┼───┐
│                                                                          │   │
│  ◄─── Receive TTS audio chunks (24kHz Float32) ◄────────────────────────┼───┤
│       │                                                                  │   │
│       ▼                                                                  │   │
│  Resample to 44.1kHz                                                    │   │
│       │                                                                  │   │
│       ▼                                                                  │   │
│  Play through AudioContext                                              │   │
│                                                                          │   │
└─────────────────────────────────────────────────────────────────────────┘   │
                                                                               │
                                                                               │
┌─────────────────────────────────────────────────────────────────────────┐   │
│                   FLY.IO VOICE SIDECAR (wss://hansa-voice.fly.dev)       │◄──┘
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  WebSocket Handler                                                       │
│       │                                                                  │
│       ▼                                                                  │
│  Collect audio until 1.2s silence (VAD)                                 │
│       │                                                                  │
│       ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Voice Pipeline                               │   │
│  │                                                                   │   │
│  │  1. Groq STT ──► 2. Gemini LLM ──► 3. Cartesia TTS               │   │
│  │    (Whisper)       (Flash)           (Sonic-3)                   │   │
│  │        │               │                 │                        │   │
│  │        ▼               ▼                 ▼                        │   │
│  │   Transcript      AI Response       Audio Chunks                  │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  Stream audio back to client via WebSocket                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Notes for Hansa-Specific Implementation

### Voice Persona
The voice ID `de3dcaaa-317e-47e4-9302-777a1a6946f4` should be a warm, authoritative voice suitable for a fortune teller persona. If this voice doesn't match the desired character, you may want to:
1. Use Cartesia's voice cloning to create a custom voice
2. Select a different voice from Cartesia's library
3. Adjust `TTS_GENERATION_CONFIG` for speed/emotion

### Korean Language Considerations
- Groq's Whisper model (`whisper-large-v3-turbo`) has excellent Korean support
- Cartesia TTS supports Korean (`ko`) natively with natural pronunciation
- Prompts are optimized for natural Korean speech patterns

### Mobile Considerations
- Request microphone permissions early
- Handle AudioContext suspension on iOS
- Consider battery/data usage warnings
- Test on actual devices (simulators often fail with WebRTC)

---

*This plan is designed for the Hansa (사주한사) application and can be implemented incrementally. Each phase builds on the previous, allowing for testing and iteration.*

---

## App Pattern Alignment Summary

This section documents how the voice implementation aligns with existing Hansa app patterns. This was verified on 2025-12-29.

### UI/UX Patterns

| Pattern | App Standard | Voice Implementation |
|---------|--------------|---------------------|
| **Icons** | Phosphor icons via `@phosphor-icons/react`, re-exported in `components/ui/icons.tsx` with `weight="fill"` | VoiceChatButton uses Microphone, MicrophoneSlash, Phone, PhoneDisconnect, Waveform, SpinnerGap |
| **CSS Variables** | `--accent`, `--background-card`, `--success`, `--error`, `--warning`, `--info`, `--element-fire` in `globals.css` | All state colors use CSS variables, no hardcoded colors |
| **Card Styling** | `bg-white/5 backdrop-blur-sm rounded-xl border border-white/10` | VoiceChatButton panel uses identical pattern |
| **Gradients** | `bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)]` | Voice FAB uses same gradient |
| **Animations** | Framer Motion for all animations | VoiceChatButton uses `motion.button`, `motion.div`, `AnimatePresence` |
| **Touch Targets** | Min 48px for accessibility (senior-friendly) | Buttons are `w-14 h-14` (56px) to `w-16 h-16` (64px) |
| **Responsive** | Mobile-first with `sm:`, `md:` breakpoints | All sizes use responsive variants |
| **Positioning** | SajuChatPanel at `bottom-6 right-6` | VoiceChatButton at `bottom-24 right-6` (no overlap) |

### Supabase Patterns

| Pattern | App Standard | Voice Implementation |
|---------|--------------|---------------------|
| **Server Client** | `createClient()` from `@/lib/supabase/server` | Same pattern in `lib/actions/voice.ts` |
| **Auth Check** | `supabase.auth.getUser()` | Same pattern |
| **Return Type** | `{ success: boolean, error?: string, ... }` | Same pattern |
| **RLS** | All tables have Row Level Security | `voice_conversations` table has RLS policies |

### Server Action Patterns

| Pattern | App Standard (from `lib/actions/saju.ts`) | Voice Implementation |
|---------|-------------------------------------------|---------------------|
| **Directive** | `'use server';` | Same |
| **Naming** | `autoSave*Result()` | `autoSaveVoiceConversation()` |
| **Auth Check** | Check user first, return early if not authenticated | Same |
| **Error Handling** | try/catch with console.error, return error message | Same |
| **Logging** | `console.error('[functionName] Error:', error)` | Same |

### API Route Patterns

| Pattern | App Standard (from `app/api/saju/*`) | Voice Implementation |
|---------|-------------------------------------|---------------------|
| **Request/Response** | `NextRequest` / `NextResponse.json()` | Same |
| **Error Response** | `{ error: "message" }` with status code | Same |
| **Success Response** | `{ success: true, ...data }` | Same |

### Component Structure

| Pattern | App Standard | Voice Implementation |
|---------|--------------|---------------------|
| **"use client"** | Client components have directive | VoiceChatButton has `"use client"` |
| **Props Interface** | Named `*Props` | `VoiceChatButtonProps` |
| **cn() utility** | For className merging | Used throughout |
| **Hook Pattern** | `useSajuChat` returns state/actions object | `useVoiceChat` returns same structure |

### File Structure

| Type | App Standard | Voice Implementation |
|------|--------------|---------------------|
| **Hooks** | `lib/hooks/*.ts` | `lib/hooks/useVoiceChat.ts` |
| **Types** | `lib/*/types.ts` | `lib/voice/types.ts` |
| **Constants** | `lib/constants/*.ts` | `lib/voice/constants.ts` |
| **Actions** | `lib/actions/*.ts` | `lib/actions/voice.ts` |
| **API Routes** | `app/api/*/route.ts` | `app/api/voice/session/route.ts` |
| **Components** | `components/*/*` | `components/voice/VoiceChatButton.tsx` |

### Supabase Project

- **Project ID**: `ypwvlmhdqavbqltsetmk`
- Use Supabase MCP tools (`mcp__supabase__*`) for migrations
- All tables follow existing naming convention (snake_case)

---

*End of implementation plan.*
