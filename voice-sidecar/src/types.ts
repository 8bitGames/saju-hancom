import type { ServerWebSocket } from "bun";

export interface SessionData {
  sessionId: string;
  systemPrompt: string;
  locale: string;
  contextType: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  audioBuffer: Uint8Array[];
  silenceTimer: Timer | null;
  isProcessing: boolean;
  // Current TTS context ID for interruption support
  currentTTSContextId?: string;
}

export interface InitMessage {
  type: "init";
  sessionId: string;
  systemPrompt: string;
  locale: string;
  contextType: string;
  greeting: string;
}

export interface WSData {
  sessionId: string;
}

export type VoiceWebSocket = ServerWebSocket<WSData>;
