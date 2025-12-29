# Voice Chat & Texting Architecture

A comprehensive guide to the real-time voice and text chat system implementation.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Text Chat System](#text-chat-system)
4. [Voice Chat System](#voice-chat-system)
5. [Voice Integration with Cartesia](#voice-integration-with-cartesia)
6. [Supabase Integration](#supabase-integration)
7. [Prompts & AI Configuration](#prompts--ai-configuration)
8. [Client-Side Implementation](#client-side-implementation)
9. [Libraries & Dependencies](#libraries--dependencies)
10. [Billing & Credits](#billing--credits)
11. [Deployment](#deployment)

---

## System Overview

The platform implements a **dual-communication system**:

| Feature | Text Chat | Voice Chat |
|---------|-----------|------------|
| AI Model | Gemini (gemini-flash-lite-latest) | Gemini (gemini-flash-lite-latest) |
| STT | N/A | Cartesia (ink-whisper) or Groq (whisper-large-v3-turbo) |
| TTS | N/A | Cartesia (sonic-3) or ElevenLabs |
| Transport | HTTP (Server Actions) | WebSocket (Fly.io sidecar) |
| Real-time | Streaming via fetch | Bidirectional audio streaming |
| Latency | ~500ms | ~1-2s round trip |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐              ┌──────────────────────────────────┐ │
│  │   Text Chat UI       │              │      Voice Chat UI               │ │
│  │  - ChatRuntime       │              │  - VoiceChatContainer            │ │
│  │  - ChatWithMemory    │              │  - useVoiceWebSocket hook        │ │
│  └──────────┬───────────┘              └─────────────┬────────────────────┘ │
│             │                                        │                       │
│             │ HTTP (fetch)                          │ WebSocket              │
│             │                                        │                       │
└─────────────┼────────────────────────────────────────┼───────────────────────┘
              │                                        │
              ▼                                        ▼
┌─────────────────────────────────┐    ┌────────────────────────────────────────┐
│     VERCEL (Next.js App)        │    │      FLY.IO (Voice Sidecar)            │
├─────────────────────────────────┤    ├────────────────────────────────────────┤
│                                 │    │                                        │
│  Server Actions:                │    │  Bun WebSocket Server:                 │
│  - src/actions/chat.ts          │    │  - voice-sidecar/src/index.ts          │
│  - getOrCreateChat()            │    │  - WebSocket handler                   │
│  - sendMessage()                │    │                                        │
│  - getChatHistory()             │◄───┼──── JWT Validation                     │
│                                 │    │      /api/voice/sidecar/validate       │
│  API Routes:                    │    │                                        │
│  - /api/voice/sidecar/session   │────┼──► Session creation                    │
│  - /api/voice/sidecar/validate  │    │                                        │
│  - /api/voice/sidecar/billing   │◄───┼──── Billing updates                    │
│  - /api/voice/sidecar/messages  │◄───┼──── Message persistence                │
│                                 │    │                                        │
│  Libraries:                     │    │  Services:                             │
│  - lib/chat-context.ts          │    │  - CartesiaTTS (text-to-speech)        │
│  - lib/gemini.ts                │    │  - CartesiaSTT (speech-to-text)        │
│  - lib/memory-extraction.ts     │    │  - GeminiLLM (conversation)            │
│                                 │    │  - SessionManager (lifecycle)          │
│                                 │    │  - VAD (voice activity detection)      │
└────────────┬────────────────────┘    └──────────────┬─────────────────────────┘
             │                                        │
             │                                        │
             ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Supabase   │  │   Cartesia   │  │    Gemini    │  │      Groq        │ │
│  │  - Auth      │  │  - STT API   │  │  - LLM API   │  │  - STT (Whisper) │ │
│  │  - Postgres  │  │  - TTS WS    │  │  - Streaming │  │  - LLM (Llama)   │ │
│  │  - Storage   │  │  - Clone API │  │              │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Text Chat System

### Overview

Text chat uses **Next.js Server Actions** with streaming responses from Gemini.

### Key Files

| File | Purpose |
|------|---------|
| `src/actions/chat.ts` | Server actions for chat operations |
| `src/lib/chat-context.ts` | Context building with RAG |
| `src/lib/gemini.ts` | Gemini AI client configuration |
| `src/lib/memory-extraction.ts` | Memory extraction from conversations |
| `src/lib/relationship/memory-extractor.ts` | Relationship tracking |
| `src/components/chat/chat-runtime.tsx` | React context for state |
| `src/components/chat/chat-with-memory.tsx` | Chat UI component |

### Server Action: sendMessage

```typescript
// src/actions/chat.ts
'use server';

export async function sendMessage(
  chatId: string,
  content: string,
  locale: string = 'en',
): Promise<{ response: string; tokensUsed: number } | { error: string }> {

  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Verify chat ownership
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.fanId, userRecord.id)),
    with: { model: true },
  });

  // 3. Handle billing (fractional credits)
  const chatPricePerMsg = chat.model.pricingConfig?.chat_per_msg ?? 0.1;
  const priceCents = Math.round(chatPricePerMsg * 100);
  // Charge when accumulated >= 100 cents = 1 credit

  // 4. Save user message
  await saveMessageAsync({ chatId, role: 'user', content });

  // 5. Build RAG context
  const context = await buildChatContext(chatId, content, locale);
  const { systemInstruction, history } = formatContextForGemini(context);

  // 6. Generate AI response
  const chatSession = genai.chats.create({
    model: CHAT_MODEL,
    config: { systemInstruction },
    history,
  });
  const result = await chatSession.sendMessage({ message: content });

  // 7. Save assistant message
  await saveMessageAsync({
    chatId,
    role: 'assistant',
    content: result.text,
    tokensUsed: result.usageMetadata?.totalTokenCount,
  });

  // 8. Extract memories (async, non-blocking)
  processExchangeForMemoriesDirect(chatId, content, result.text)
    .catch(console.error);

  return { response: result.text, tokensUsed };
}
```

### Context Building with RAG

```typescript
// src/lib/chat-context.ts

export async function buildChatContext(
  chatId: string,
  userMessage: string,
  locale: string = 'en',
): Promise<ChatContext> {

  // Parallel context fetching for performance
  const [memories, recentMessages, userContext, contentPolicy, relationship] =
    await Promise.all([
      // Vector search for semantic recall (top 5 relevant memories)
      searchSimilarMessages(chatId, userMessage, 5, 0.6),
      // Recent conversation (last 6 messages)
      getRecentMessages(chatId, 6),
      // User context cache for personalization
      getUserContextForChat(chatId, { maxTokens: 600, refreshIfStale: true }),
      // Content policy for boundaries
      getModelContentPolicy(model.id),
      // Relationship for emotional continuity
      getOrCreateRelationship(chat.fanId, model.id),
    ]);

  // Build system prompt with persona-first architecture
  return {
    systemPrompt: buildSystemPrompt(model, memories, userLanguage, fanName, ...),
    memories,
    recentMessages,
    userLanguage,
    fanName,
    relationship,
    userContext,
  };
}
```

### System Prompt Structure (Persona-First)

```typescript
function buildSystemPrompt(model, memories, userLanguage, fanName, ...): string {
  // SECTION 1: WHO YOU ARE (Persona & Soul)
  const personaSection = `# You are ${model.name}
${model.bio}
${model.basePrompt}
${model.textingStyle ? `Your texting vibe:\n${model.textingStyle}` : ''}`;

  // SECTION 2: YOUR RELATIONSHIP WITH THIS PERSON
  const relationshipSection = formatRelationshipContext(relationship, fanName);

  // SECTION 3: WHAT YOU KNOW ABOUT THEM
  const userKnowledgeSection = userContextSection;

  // SECTION 4: PAST MEMORIES TOGETHER
  const memoriesSection = memories.map(m =>
    `• ${m.role === 'user' ? fanName : 'You'}: "${m.content.slice(0, 150)}..."`
  ).join('\n');

  // SECTION 5: RESPONSE FORMAT
  const formatSection = `
Reply in JSON:
{
  "script": "Your message (clean text for voice)",
  "displayText": "Same message with emojis if that matches your style",
  "mood": "happy|curious|playful|romantic|excited|chill|thoughtful|supportive",
  "expectsResponse": true,
  "suggestions": [{"id": "s1", "text": "possible reply", "type": "reaction"}]
}`;

  return `${personaSection}${relationshipSection}${userKnowledgeSection}${memoriesSection}${formatSection}`;
}
```

---

## Voice Chat System

### Overview

Voice chat uses a **separate Bun WebSocket server** (voice sidecar) deployed on Fly.io for low-latency bidirectional audio streaming.

### Key Files

| File | Purpose |
|------|---------|
| `voice-sidecar/src/index.ts` | Sidecar entry point |
| `voice-sidecar/src/websocket/handler.ts` | Voice session handling |
| `voice-sidecar/src/services/cartesia-tts.ts` | Text-to-speech |
| `voice-sidecar/src/services/cartesia-stt.ts` | Speech-to-text |
| `voice-sidecar/src/services/gemini-llm.ts` | LLM for conversation |
| `voice-sidecar/src/services/session.ts` | Session lifecycle & billing |
| `voice-sidecar/src/config/voice-config.ts` | Configuration |
| `src/hooks/use-voice-websocket.ts` | Client-side voice hook |
| `src/app/api/voice/sidecar/session/route.ts` | Session creation API |
| `src/app/api/voice/sidecar/validate/route.ts` | Token validation API |

### Voice Session Flow

```
1. Client requests session token
   POST /api/voice/sidecar/session
   ├── Authenticate user (Supabase)
   ├── Verify model has voice enabled
   ├── Check user credit balance
   ├── Create voiceSession in database
   └── Return JWT token + sidecar URL

2. Client connects to sidecar
   WebSocket connect to wss://mirage-voice-sidecar.fly.dev
   ├── Send { type: 'start', token, modelId, sessionId, locale }
   └── Sidecar validates token with Next.js backend

3. Sidecar validates session
   POST /api/voice/sidecar/validate
   ├── Verify JWT signature
   ├── Check session is active
   ├── Load model context & voice settings
   ├── Fetch conversation history
   └── Return { valid: true, modelContext, voiceId, conversationHistory }

4. Voice conversation loop
   ├── AI generates greeting (dynamic based on history)
   ├── Client streams audio → Sidecar
   ├── VAD detects speech boundaries
   ├── STT transcribes speech
   ├── LLM generates response
   ├── TTS synthesizes audio
   └── Stream audio back to client

5. Session ends
   ├── Persist voice messages to database
   ├── Final billing calculation
   └── Clean up resources
```

### WebSocket Handler

```typescript
// voice-sidecar/src/websocket/handler.ts

export async function handleMessage(
  ws: ServerWebSocket<ConnectionState>,
  data: string | Buffer,
  deps: HandlerDeps,
): Promise<void> {
  const state = ws.data;

  // Handle binary audio data
  if (parsed.type === 'binary') {
    await handleAudioData(ws, parsed.data, deps);
    return;
  }

  // Handle JSON messages
  switch (message.type) {
    case 'start':
      await handleStart(ws, message, deps);
      break;
    case 'end':
      await handleEnd(ws, deps);
      break;
    case 'interrupt':
      handleInterrupt(ws);
      break;
  }
}

async function processUserSpeech(ws, deps): Promise<void> {
  // 1. Transcribe speech (STT)
  const transcription = await state.stt.transcribe();
  ws.send(serverMessages.transcript(transcription.text, true));

  // 2. Signal response starting
  ws.send(serverMessages.responseStart());

  // 3. Stream LLM response with progressive TTS
  for await (const chunk of state.llm.generateStream(...)) {
    fullResponse += chunk;
    sentenceBuffer += chunk;

    // Extract complete sentences
    const [sentences, remaining] = sentenceUtils.extractSentences(sentenceBuffer);

    for (const sentence of sentences) {
      // Synthesize and stream audio for each sentence
      for await (const audioChunk of state.tts.synthesizeStream(sentence)) {
        ws.send(audioChunk);
      }
    }
    sentenceBuffer = remaining;
  }

  // 4. Add to conversation history
  deps.sessionManager.addMessage(sessionId, 'user', transcription.text);
  deps.sessionManager.addMessage(sessionId, 'assistant', fullResponse);

  // 5. Signal response complete
  ws.send(serverMessages.responseEnd(fullResponse));
}
```

### Voice Configuration

```typescript
// voice-sidecar/src/config/voice-config.ts

// Gemini LLM Settings
export const GROQ_CONFIG = {
  model: 'gemini-flash-lite-latest',
  temperature: 0.6,
  topP: 0.95,
  maxTokens: 150,
};

// Cartesia STT (Speech-to-Text) Settings
export const STT_CONFIG = {
  model: 'ink-whisper',
  language: 'auto',
  sampleRate: 16000,
  vadThreshold: 0.035,
  silenceThresholdMs: 1000, // Wait 1s after user stops speaking
};

// Cartesia TTS (Text-to-Speech) Settings
export const TTS_CONFIG = {
  model: 'sonic-3',
  outputFormat: {
    container: 'raw',
    encoding: 'pcm_f32le',
    sampleRate: 24000, // Resampled to 44.1kHz for client
  },
  voiceControls: {
    speed: 0.9,
    emotion: {},
  },
};
```

---

## Voice Integration with Cartesia

### Cartesia TTS (Text-to-Speech)

```typescript
// voice-sidecar/src/services/cartesia-tts.ts

export class CartesiaTTS implements ITTSProvider {
  // WebSocket URL for streaming
  private getWebSocketUrl(): string {
    return `wss://api.cartesia.ai/tts/websocket?cartesia_version=2025-04-16&api_key=${this.apiKey}`;
  }

  // Streaming synthesis for low latency
  async *synthesizeStream(text: string): AsyncGenerator<ArrayBuffer> {
    const ws = new WebSocket(this.getWebSocketUrl());

    // Send generation request
    ws.send(JSON.stringify({
      context_id: crypto.randomUUID(),
      model_id: 'sonic-3',
      transcript: text,
      voice: { mode: 'id', id: this.voiceId },
      output_format: {
        container: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 24000,
      },
      language: this.language, // e.g., 'ko', 'en', 'ja'
    }));

    // Yield audio chunks as they arrive
    while (!isDone) {
      if (audioQueue.length > 0) {
        const chunk = audioQueue.shift()!;
        // Resample from 24kHz to 44.1kHz for frontend
        const resampled = resampleFloat32Buffer(chunk, 24000, 44100);
        yield resampled;
      }
    }
  }
}
```

### Cartesia STT (Speech-to-Text)

```typescript
// voice-sidecar/src/services/cartesia-stt.ts

export class CartesiaSTT implements ISTTProvider {
  private audioBuffer: ArrayBuffer[] = [];

  // Add audio chunk to buffer
  addAudioChunk(chunk: ArrayBuffer): void {
    this.audioBuffer.push(chunk);
  }

  // Transcribe when speech ends
  async transcribe(): Promise<STTResult> {
    // Combine all audio chunks
    const combinedAudio = new Uint8Array(totalLength);

    // Create WAV header for raw PCM
    const wavBuffer = createWavBuffer(combinedAudio, 16000, 1, 16);

    // Send to Cartesia STT API
    const formData = new FormData();
    formData.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'audio.wav');
    formData.append('model', 'ink-whisper');

    const response = await fetch('https://api.cartesia.ai/stt', {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Cartesia-Version': '2024-11-13',
      },
      body: formData,
    });

    const result = await response.json();
    return { text: result.text, isFinal: true };
  }
}
```

### Voice Cloning

```typescript
// src/actions/voice.ts

export async function cloneVoice(input: CloneVoiceInput): Promise<VoiceCloneResult> {
  // 1. Upload audio sample to Supabase storage
  const { data: uploadData } = await supabase.storage
    .from('voice-samples')
    .upload(storagePath, audioBuffer, { contentType: input.mimeType });

  // 2. Clone voice with Cartesia
  const cartesia = getCartesiaClient();
  const clonedVoice = await cartesia.voices.clone(audioBlob, {
    name: `${input.modelName} Voice`,
    description: `Voice clone for model ${input.modelName}`,
    language: 'en',
    mode: 'similarity',
  });

  // 3. Generate TTS preview sample
  const ttsResponse = await cartesia.tts.bytes({
    modelId: 'sonic-3',
    transcript: SAMPLE_TEXTS[language],
    voice: { mode: 'id', id: clonedVoice.id },
    outputFormat: {
      container: 'wav',
      encoding: 'pcm_f32le',
      sampleRate: 48000,
    },
  });

  // 4. Save voice ID to model
  await db.update(models).set({
    voiceId: clonedVoice.id,
    voiceStatus: 'active',
  });

  return { success: true, voiceId: clonedVoice.id };
}
```

### Supported Languages

Cartesia supports these languages for TTS:

```typescript
const CARTESIA_SUPPORTED_LANGUAGES = [
  'en', 'fr', 'de', 'es', 'pt', 'zh', 'ja', 'hi', 'it', 'ko',
  'nl', 'pl', 'ru', 'sv', 'tr', 'tl', 'bg', 'ro', 'ar', 'cs',
  'el', 'fi', 'hr', 'ms', 'sk', 'da', 'ta', 'uk', 'hu', 'no',
  'vi', 'bn', 'th', 'he', 'ka', 'id', 'te', 'gu', 'kn', 'ml',
  'mr', 'pa',
];
```

---

## Supabase Integration

### Database Schema (Voice-related)

```sql
-- Voice Sessions Table
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id),
  user_id UUID REFERENCES users(id),
  model_id UUID REFERENCES models(id),
  status TEXT DEFAULT 'active', -- active, ended, failed
  credit_rate INTEGER DEFAULT 2, -- credits per minute
  started_at TIMESTAMP DEFAULT now(),
  ended_at TIMESTAMP,
  duration_ms INTEGER,
  credits_used INTEGER
);

-- Models Table (voice fields)
ALTER TABLE models ADD COLUMN voice_id TEXT;
ALTER TABLE models ADD COLUMN voice_status TEXT DEFAULT 'none'; -- none, cloning, active, failed
ALTER TABLE models ADD COLUMN voice_sample_url TEXT;
ALTER TABLE models ADD COLUMN voice_preview_url TEXT;
ALTER TABLE models ADD COLUMN voice_cloned_at TIMESTAMP;
ALTER TABLE models ADD COLUMN voice_prompt TEXT; -- Custom voice instructions

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id),
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- Chats Table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES users(id),
  model_id UUID REFERENCES models(id),
  pending_credit_cents INTEGER DEFAULT 0, -- For fractional billing
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

### Supabase Storage Buckets

```
voice-samples/
├── voice-samples/{modelId}/{timestamp}.webm  # Original voice sample
└── voice-previews/{modelId}/{timestamp}.wav  # TTS preview
```

### Authentication Flow

```typescript
// Server Actions (Next.js)
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Voice Sidecar (JWT validation)
const secret = new TextEncoder().encode(SIDECAR_SECRET);
const { payload } = await jwtVerify(token, secret);
// payload contains: userId, sessionId, modelId, chatId, locale
```

### Message Persistence

The voice sidecar persists messages back to the main app:

```typescript
// voice-sidecar/src/services/session.ts

private async persistMessages(session: VoiceSession): Promise<void> {
  const newMessages = session.conversationHistory.filter(
    (msg) => msg.timestamp >= session.startedAt,
  );

  const response = await fetch(`${this.nextjsApiUrl}/api/voice/sidecar/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.sidecarSecret}`,
    },
    body: JSON.stringify({
      chatId: session.chatId,
      userId: session.userId,
      sessionId: session.id,
      messages: newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });
}
```

---

## Prompts & AI Configuration

### Voice System Prompt (Persona-First)

```typescript
// voice-sidecar/src/services/gemini-llm.ts

private buildSystemPrompt(
  context: ModelContext,
  locale: string,
  userContext?: UserContext,
): string {
  // SECTION 1: WHO YOU ARE (Persona & Soul)
  const personaSection = `# You are ${context.name}
${context.bio}
${context.basePrompt || 'You are warm, engaging, and genuinely interested in the people you talk to.'}
${context.textingStyle ? `Your conversation style:\n${context.textingStyle}` : ''}`;

  // SECTION 2: WHO YOU'RE TALKING TO
  const userSection = userContext?.formattedPrompt
    ? `
---
# The person you're talking to
${userContext.formattedPrompt}
Make them feel remembered. Reference what you know about them naturally.`
    : '';

  // SECTION 3: VOICE GUIDELINES
  const voiceGuidelines = context.voicePrompt || `
---
# Voice conversation mode

You're in a voice call. Keep responses short (1-2 sentences) and conversational.

- Plain text only - no JSON, no formatting
- No emojis - your voice carries the emotion
- End sentences with proper punctuation for natural pauses
- React naturally: "oh nice!", "wait really?", "no way!"
- Sound like a friend, not a formal assistant`;

  // SECTION 4: LANGUAGE
  const languageSection = `
---
Speak in ${languageNames[locale] || 'English'}.`;

  return `${personaSection}${userSection}${voiceGuidelines}${languageSection}`;
}
```

### Dynamic Greeting Generation

```typescript
// voice-sidecar/src/services/gemini-llm.ts

async generateGreeting(
  context: ModelContext,
  history: ConversationMessage[],
  locale: string,
  userContext?: UserContext,
): Promise<string> {
  // Use fallback for short conversations
  if (history.length < 3) {
    return getFallbackGreeting(locale);
  }

  // Build dynamic greeting prompt
  let prompt = buildDynamicGreetingPrompt(context, history, locale);

  // Add user context for personalization
  if (userContext?.formattedPrompt) {
    prompt += `\n\n${userContext.formattedPrompt}
## CRITICAL: PERSONALIZED GREETING
⚠️ Your greeting MUST reference something personal about this fan:
- Mention their name, recent activity, or something you know about them
- Make them feel remembered and special from the first word`;
  }

  const response = await this.ai.models.generateContent({
    model: this.model,
    config: { systemInstruction: prompt, temperature: 0.9 },
    contents: [{ role: 'user', parts: [{ text: 'Generate a greeting.' }] }],
  });

  return sanitizeResponse(response.text);
}
```

### Response Sanitization

```typescript
// voice-sidecar/src/services/gemini-llm.ts

function sanitizeResponse(text: string): string {
  let result = text;

  // Remove JSON formatting if model ignores instructions
  if (/^\s*[[{"`]/.test(result)) {
    const jsonFieldMatch = result.match(
      /["']?(response|message|content|text)["']?\s*:\s*["']([^"']+)["']/i,
    );
    if (jsonFieldMatch) result = jsonFieldMatch[2];
  }

  // Remove laughter expressions for TTS
  result = removeLaughter(result);

  return result;
}

function removeLaughter(text: string): string {
  return text
    // Korean laughter
    .replace(/ㅋ{2,}/g, '').replace(/ㅎ{2,}/g, '')
    // English laughter
    .replace(/\b(a*ha+h?a*)+\b/gi, '').replace(/\blol+\b/gi, '')
    // Clean up
    .replace(/\s{2,}/g, ' ').trim();
}
```

---

## Client-Side Implementation

### Voice WebSocket Hook

```typescript
// src/hooks/use-voice-websocket.ts

export function useVoiceWebSocket(options: UseVoiceWebSocketOptions): UseVoiceWebSocketReturn {
  // State machine: idle → connecting → connected → listening → processing → speaking
  const [state, setState] = useState<VoiceWebSocketState>('idle');

  const connect = useCallback(async () => {
    // 1. Get session token from Next.js API
    const sessionResponse = await fetch('/api/voice/sidecar/session', {
      method: 'POST',
      body: JSON.stringify({ chatId, locale }),
    });
    const { token, sidecarUrl, sessionId, modelId } = await sessionResponse.json();

    // 2. Initialize AudioContext (44.1kHz for playback)
    audioContextRef.current = new AudioContext({
      sampleRate: 44100,
      latencyHint: 'interactive',
    });

    // 3. Get microphone access with echo cancellation
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // 4. Set up audio worklet for PCM capture
    await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
    workletNodeRef.current = new AudioWorkletNode(
      audioContextRef.current,
      'pcm-processor',
      { processorOptions: { targetSampleRate: 16000 } },
    );

    // 5. Connect to WebSocket
    const ws = new WebSocket(sidecarUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'start', token, modelId, sessionId, locale }));
    };

    // 6. Handle messages
    ws.onmessage = handleWebSocketMessage;

    // 7. Send audio from worklet
    workletNodeRef.current.port.onmessage = (event) => {
      if (ws.readyState === WebSocket.OPEN && isListeningRef.current) {
        ws.send(event.data); // Raw PCM Int16 data
      }
    };
  }, [chatId, locale]);

  // Handle incoming messages
  const handleWebSocketMessage = useCallback(async (event: MessageEvent) => {
    // Binary = audio data
    if (event.data instanceof Blob) {
      const float32Data = new Float32Array(await event.data.arrayBuffer());
      playbackQueueRef.current.push(float32Data);
      playNextChunk();
      return;
    }

    // JSON messages
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case 'ready':
        setState('connected');
        break;
      case 'transcript':
        onTranscript?.(msg.text, msg.isFinal);
        break;
      case 'response_start':
        setState('speaking');
        setIsListening(false); // Pause mic during AI speech
        break;
      case 'response_end':
        setState('listening');
        setIsListening(true); // Resume mic
        break;
    }
  }, []);

  return { state, connect, disconnect, interrupt, toggleMute, ... };
}
```

### Audio Processor Worklet

```javascript
// public/audio-processor.js

class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options.processorOptions?.targetSampleRate || 16000;
    this.buffer = [];
    this.bufferSize = 4096;
  }

  // Resample from AudioContext rate to 16kHz
  resample(samples, sourceSampleRate, targetSampleRate) {
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

  // Convert Float32 to Int16
  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  process(inputs, outputs, parameters) {
    const samples = inputs[0][0]; // Mono channel
    if (!samples) return true;

    this.buffer.push(...samples);

    if (this.buffer.length >= this.bufferSize) {
      const float32Buffer = new Float32Array(this.buffer);
      const resampled = this.resample(float32Buffer, sampleRate, this.targetSampleRate);
      const int16Data = this.float32ToInt16(resampled);
      this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
      this.buffer = [];
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
```

---

## Libraries & Dependencies

### Voice Sidecar (Bun)

```json
{
  "dependencies": {
    "@google/genai": "^1.0.0",    // Gemini AI SDK
    "groq-sdk": "^0.8.0",         // Groq LLM (optional)
    "ws": "^8.18.0"               // WebSocket for Cartesia TTS
  }
}
```

### Main App (Next.js)

```json
{
  "dependencies": {
    "@cartesia/cartesia-js": "^1.3.2",   // Cartesia voice cloning
    "@google/genai": "^1.0.0",           // Gemini AI
    "@supabase/supabase-js": "^2.x",     // Supabase client
    "drizzle-orm": "^0.x",               // Database ORM
    "jose": "^5.x"                        // JWT handling
  }
}
```

### Audio Formats

| Stage | Format | Sample Rate | Encoding |
|-------|--------|-------------|----------|
| Microphone capture | Float32 | Browser native (44.1kHz/48kHz) | - |
| Network transmission (to STT) | Int16 PCM | 16kHz | pcm_s16le |
| STT input | WAV | 16kHz | pcm_s16le |
| TTS output (Cartesia) | Float32 PCM | 24kHz | pcm_f32le |
| Playback (resampled) | Float32 | 44.1kHz | pcm_f32le |

---

## Billing & Credits

### Voice Billing

```typescript
// voice-sidecar/src/services/session.ts

const BILLING_INTERVAL_MS = 60_000; // Bill every minute
const CREDITS_PER_MINUTE = 10;      // Rate: 10 credits/minute

// Billing timer runs every 60 seconds
private startBillingTimer(sessionId: string): void {
  setInterval(async () => {
    const durationMs = Date.now() - session.startedAt;
    await this.billSession(sessionId, durationMs, false);
  }, BILLING_INTERVAL_MS);
}

// Call Next.js API to deduct credits
private async billSession(sessionId, durationMs, isFinal): Promise<boolean> {
  const response = await fetch(`${this.nextjsApiUrl}/api/voice/sidecar/billing`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${this.sidecarSecret}` },
    body: JSON.stringify({ userId, sessionId, durationMs, isFinal }),
  });
  return response.json().canContinue;
}
```

### Text Chat Billing (Fractional)

```typescript
// src/actions/chat.ts

// Support fractional pricing (e.g., 0.1 credits per message)
const chatPricePerMsg = chat.model.pricingConfig?.chat_per_msg ?? 0.1;
const priceCents = Math.round(chatPricePerMsg * 100); // 0.1 = 10 cents

// Accumulate in pendingCreditCents
const newPendingCents = currentPendingCents + priceCents;

// Only charge when accumulated >= 100 cents = 1 credit
const creditsToCharge = Math.floor(newPendingCents / 100);
const remainingCents = newPendingCents % 100;

// Update pending cents on chat
await db.update(chats)
  .set({ pendingCreditCents: remainingCents })
  .where(eq(chats.id, chatId));
```

---

## Deployment

### Voice Sidecar (Fly.io)

```toml
# voice-sidecar/fly.toml

app = "mirage-voice-sidecar"
primary_region = "nrt"  # Tokyo for low latency to Korea

[build]
  builder = "paketobuildpacks/builder:full"
  buildpacks = ["oven-sh/bun:latest"]

[env]
  PORT = "8080"
  NODE_ENV = "production"
  STT_PROVIDER = "groq"
  LLM_PROVIDER = "gemini"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[services]]
  protocol = "tcp"
  internal_port = 8080
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[mounts]
  source = "data"
  destination = "/data"
```

Deploy commands:
```bash
cd voice-sidecar
fly deploy
fly logs  # Monitor logs
```

### Main App (Vercel)

Environment variables:
```
SIDECAR_SECRET=...
VOICE_SIDECAR_URL=wss://mirage-voice-sidecar.fly.dev
CARTESIA_API_KEY=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
```

---

## Quick Reference

### Audio Flow

```
User speaks → Mic (44.1kHz) → Resample (16kHz) → Int16 PCM → WebSocket
→ Sidecar STT → Text → LLM → Response text
→ TTS (24kHz Float32) → Resample (44.1kHz) → WebSocket → Browser playback
```

### State Machine

```
Voice States: idle → connecting → connected → listening → processing → speaking → listening (loop)

- idle: Not connected
- connecting: Creating session, connecting WebSocket
- connected: WebSocket ready, waiting for AI greeting
- listening: Capturing mic audio, VAD active
- processing: User stopped speaking, STT + LLM in progress
- speaking: AI audio playing, mic paused
```

### Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| Input sample rate | 16000 Hz | STT optimal rate |
| Output sample rate | 44100 Hz | Browser playback |
| Cartesia native rate | 24000 Hz | TTS output |
| Silence threshold | 1000 ms | Time before processing |
| VAD threshold | 0.035 | Voice activity sensitivity |
| Billing interval | 60000 ms | Billing frequency |
| Credits per minute | 10 | Voice chat rate |
