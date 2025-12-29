import type { ServerWebSocket } from "bun";
import { processVoicePipeline } from "../services/pipeline";
import { sessionStore } from "./session";
import { VAD_CONFIG, AUDIO_CONFIG, HANSA_VOICE_ID, TTS_MODEL } from "../constants";
import type { SessionData, VoiceWebSocket, WSData } from "../types";

// Active WebSocket sessions
const wsSessions = new Map<string, SessionData>();

export const wsHandler = {
  async open(ws: VoiceWebSocket) {
    const sessionId = ws.data?.sessionId;

    if (!sessionId) {
      ws.send(JSON.stringify({ type: "error", error: "Missing sessionId" }));
      ws.close();
      return;
    }

    console.log(`[WS] Connection opened: ${sessionId}`);

    // Auto-initialize from sessionStore (set by POST /session)
    const storedSession = sessionStore.get(sessionId);
    if (storedSession) {
      console.log(`[WS] Auto-initializing from stored session: ${sessionId}`);
      await initializeSession(ws, sessionId, {
        systemPrompt: storedSession.systemPrompt,
        locale: storedSession.locale,
        contextType: storedSession.contextType,
        greeting: storedSession.greeting,
        existingMessages: storedSession.existingMessages,
      });
    } else {
      // Wait for init message (fallback)
      console.log(`[WS] Session not in store, waiting for init message: ${sessionId}`);
    }
  },

  async message(ws: VoiceWebSocket, message: string | Buffer) {
    const sessionId = ws.data?.sessionId;
    if (!sessionId) {
      ws.send(JSON.stringify({ type: "error", error: "No session" }));
      return;
    }

    // Handle binary audio data
    if (message instanceof Buffer || message instanceof ArrayBuffer) {
      const session = wsSessions.get(sessionId);
      if (session) {
        await handleAudioChunk(ws, session, Buffer.from(message));
      }
      return;
    }

    // Handle JSON messages
    try {
      const messageStr = typeof message === "string" ? message : message.toString();
      const data = JSON.parse(messageStr);

      switch (data.type) {
        case "init":
          await initializeSession(ws, sessionId, data);
          break;

        case "audio":
          // Handle base64 encoded audio from client
          if (data.data) {
            const session = wsSessions.get(sessionId);
            if (session) {
              const binaryString = atob(data.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await handleAudioChunk(ws, session, Buffer.from(bytes));
            }
          }
          break;

        case "silence":
          // Voice activity ended - this is handled by the silence timer in handleAudioChunk
          // No action needed here, the timer triggers processing automatically
          break;

        case "interrupt":
          await handleInterrupt(ws, sessionId);
          break;

        case "end":
          await endSession(ws, sessionId);
          break;

        default:
          console.warn(`[WS] Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error("[WS] Message parse error:", error);
      ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
    }
  },

  close(ws: VoiceWebSocket) {
    const sessionId = ws.data?.sessionId;
    if (sessionId) {
      const session = wsSessions.get(sessionId);
      if (session) {
        if (session.silenceTimer) clearTimeout(session.silenceTimer);
        wsSessions.delete(sessionId);
      }
      sessionStore.delete(sessionId);
      console.log(`[WS] Connection closed: ${sessionId}`);
    }
  },
};

async function initializeSession(
  ws: VoiceWebSocket,
  sessionId: string,
  data: {
    systemPrompt: string;
    locale: string;
    contextType: string;
    greeting: string;
    existingMessages?: Array<{ role: "user" | "assistant"; content: string; channel: string }>;
  }
) {
  const { systemPrompt, locale, contextType, greeting, existingMessages } = data;

  console.log(`[WS] Initializing session: ${sessionId}`);

  // Initialize conversation history from existing messages
  const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> =
    existingMessages?.map(m => ({ role: m.role, content: m.content })) || [];

  const session: SessionData = {
    sessionId,
    systemPrompt,
    locale,
    contextType,
    conversationHistory,
    audioBuffer: [],
    silenceTimer: null,
    isProcessing: false,
  };

  wsSessions.set(sessionId, session);

  // Send ready with existing messages if resuming
  ws.send(JSON.stringify({
    type: "ready",
    sessionId,
    messages: existingMessages || [],
  }));

  // Speak greeting only if no existing messages (new conversation)
  if (greeting && (!existingMessages || existingMessages.length === 0)) {
    await speakText(session, greeting, ws);
    session.conversationHistory.push({ role: "assistant", content: greeting });
  }

  ws.send(JSON.stringify({ type: "listening" }));
}

async function handleAudioChunk(
  ws: VoiceWebSocket,
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

  // Set new silence timer - process after silence detected
  session.silenceTimer = setTimeout(async () => {
    if (session.audioBuffer.length > 0 && !session.isProcessing) {
      // Combine audio chunks
      const totalLength = session.audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);

      // Calculate audio duration (16kHz, 16-bit = 2 bytes per sample)
      const audioDurationMs = (totalLength / 2) / (AUDIO_CONFIG.stt.sampleRate / 1000);

      // Skip if audio is too short (noise/clicks)
      if (audioDurationMs < VAD_CONFIG.minAudioDurationMs) {
        console.log(`[WS] Audio too short (${audioDurationMs.toFixed(0)}ms), skipping`);
        session.audioBuffer = [];
        return;
      }

      session.isProcessing = true;
      ws.send(JSON.stringify({ type: "processing" }));

      try {
        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of session.audioBuffer) {
          combinedAudio.set(chunk, offset);
          offset += chunk.length;
        }
        session.audioBuffer = [];

        console.log(`[WS] Processing audio: ${audioDurationMs.toFixed(0)}ms`);

        // Process through voice pipeline (STT -> LLM -> TTS)
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

          ws.send(JSON.stringify({ type: "speaking" }));
          await speakText(session, response, ws);
        }

      } catch (error) {
        console.error("[WS] Voice pipeline error:", error);
        ws.send(JSON.stringify({ type: "error", error: "Processing failed" }));
      } finally {
        session.isProcessing = false;
        ws.send(JSON.stringify({ type: "listening" }));
      }
    }
  }, VAD_CONFIG.silenceThresholdMs);
}

async function speakText(session: SessionData, text: string, ws: VoiceWebSocket): Promise<void> {
  try {
    console.log(`[TTS] Generating audio for: ${text.substring(0, 50)}...`);

    // Use Cartesia REST API for high-quality batch audio
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": process.env.CARTESIA_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: TTS_MODEL,
        transcript: text,
        voice: { mode: "id", id: HANSA_VOICE_ID },
        language: session.locale === "ko" ? "ko" : session.locale,
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 24000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[TTS] API error:", error);
      ws.send(JSON.stringify({ type: "error", error: "TTS generation failed" }));
      return;
    }

    // Get the complete audio buffer
    const audioBuffer = await response.arrayBuffer();
    console.log(`[TTS] Generated ${audioBuffer.byteLength} bytes of audio`);

    // Convert to base64 and send as single chunk
    const uint8Array = new Uint8Array(audioBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    ws.send(JSON.stringify({ type: "tts_audio", data: base64Audio }));
    ws.send(JSON.stringify({ type: "tts_done" }));

  } catch (error) {
    console.error("[TTS] Error:", error);
    ws.send(JSON.stringify({ type: "error", error: "TTS error" }));
  }
}

async function handleInterrupt(ws: VoiceWebSocket, sessionId: string) {
  const session = wsSessions.get(sessionId);
  if (!session) return;

  session.audioBuffer = [];
  session.isProcessing = false;

  if (session.silenceTimer) {
    clearTimeout(session.silenceTimer);
    session.silenceTimer = null;
  }

  ws.send(JSON.stringify({ type: "interrupted" }));
  ws.send(JSON.stringify({ type: "listening" }));
}

async function endSession(ws: VoiceWebSocket, sessionId: string) {
  const session = wsSessions.get(sessionId);
  if (session) {
    if (session.silenceTimer) clearTimeout(session.silenceTimer);
    wsSessions.delete(sessionId);
  }
  sessionStore.delete(sessionId);

  ws.send(JSON.stringify({ type: "ended" }));
  ws.close();
}
