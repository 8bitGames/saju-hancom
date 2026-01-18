import type { SajuResult } from "@/lib/saju/types";

// ============================================
// Unified Conversation Types (Text + Voice)
// ============================================

// Unified message type for both text and voice conversations
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  channel: "text" | "voice";
  timestamp: Date;
}

// Alias for backward compatibility
export type VoiceMessage = ConversationMessage;

// Unified conversation type
export interface Conversation {
  id: string;
  userId: string;
  contextType: "saju" | "compatibility" | "faceReading";
  contextId?: string; // The result ID (saju_result.id, etc.)
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Analysis Context Types
// ============================================

// Generic context data - allows flexible data structure per context type
// Gemini-generated interpretation (from /api/saju/interpret)
export interface SajuInterpretation {
  personalityReading?: {
    summary?: string;
    coreTraits?: string[];
    strengths?: string[];
    challenges?: string[];
  };
  elementInsight?: {
    balance?: string;
    recommendation?: string;
  };
  tenGodInsight?: {
    dominant?: string;
    lifePattern?: string;
  };
  starInsight?: {
    positive?: string;
    caution?: string;
  };
  overallMessage?: string;
}

export interface SajuContext {
  type: "saju";
  data: {
    id?: string;
    name?: string;
    pillars?: string;
    dayMaster?: string;
    elements?: string;
    yearlyFortune?: string;
    analysis?: {
      personality?: string;
      career?: string;
      relationships?: string;
      health?: string;
    };
    advice?: string[];
    // Gemini-generated detailed interpretation (takes precedence when available)
    interpretation?: SajuInterpretation;
    [key: string]: unknown; // Allow additional fields
  };
}

export interface CompatibilityContext {
  type: "compatibility";
  data: {
    id?: string;
    person1: {
      name: string;
      pillars?: string;
      dayMaster?: string;
    };
    person2: {
      name: string;
      pillars?: string;
      dayMaster?: string;
    };
    relationType: string;
    score: number;
    gradeText: string;
    analysis?: {
      communication?: string;
      collaboration?: string;
      trust?: string;
      growth?: string;
    };
    advice?: string[];
    cautions?: string[];
    aiInterpretation?: {
      summary?: string;
      communication?: string;
      chemistry?: string;
      challenges?: string;
      advice?: string;
    };
    [key: string]: unknown; // Allow additional fields
  };
}

export interface FaceReadingContext {
  type: "faceReading";
  data?: {
    id?: string;
    gender?: "male" | "female";
    faceShape?: string;
    overallScore?: number;
    fortuneAreas?: Record<string, { score: number; description: string }>;
    features?: Record<string, { koreanName: string; score: number; description: string; fortune: string }>;
    strengths?: string[];
    advice?: string[];
    [key: string]: unknown; // Allow additional fields
  };
  // Legacy flat fields for simpler usage
  gender?: "male" | "female";
  faceShape?: string;
  overallScore?: number;
  fortuneAreas?: Record<string, { score: number; description: string }>;
}

export type PrimaryContext = SajuContext | CompatibilityContext | FaceReadingContext;

// All user's analyses - Cheonggiun has full picture of the user
export interface UserAnalysesContext {
  saju?: SajuContext;
  compatibility?: {
    coworker?: CompatibilityContext;
    love?: CompatibilityContext;
  };
  faceReading?: FaceReadingContext;
}

// ============================================
// Voice Session Configuration
// ============================================

export interface VoiceSessionConfig {
  locale: string;
  // Primary context for this conversation (what page user is on)
  primaryContext: PrimaryContext;
  // All user's analyses for full context (Cheonggiun knows everything about user)
  userAnalyses?: UserAnalysesContext;
  // Previous conversation history (for resuming)
  conversationId?: string;
  existingMessages?: ConversationMessage[];
}

// ============================================
// Voice State Machine
// ============================================

export type VoiceState =
  | "idle"           // Not connected
  | "connecting"     // Initializing session
  | "ready"          // Session ready, AI greeting played
  | "listening"      // Capturing user audio
  | "processing"     // STT + LLM processing
  | "speaking"       // Playing AI response
  | "error";         // Error state

// ============================================
// Audio Types
// ============================================

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface TranscriptResult {
  text: string;
  isFinal: boolean;
  words?: Array<{ word: string; start: number; end: number }>;
}

// ============================================
// Voice Hook Return Type
// ============================================

export interface UseVoiceChatReturn {
  // State
  state: VoiceState;
  isConnected: boolean;
  isMuted: boolean;
  error: string | null;

  // Transcripts
  userTranscript: string;
  aiTranscript: string;

  // Conversation History (unified - includes text messages too)
  messages: ConversationMessage[];
  conversationId: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  interrupt: () => void;
}

// ============================================
// WebSocket Message Types
// ============================================

export type WSMessageType =
  | "init"
  | "ready"
  | "audio"
  | "transcript"
  | "response"
  | "tts_start"   // TTS streaming started
  | "tts_chunk"   // Streaming audio chunk
  | "tts_audio"   // Complete audio (fallback)
  | "tts_done"    // TTS streaming completed
  | "timing"      // E2E timing data
  | "processing"
  | "listening"
  | "speaking"
  | "interrupt"
  | "interrupted"
  | "end"
  | "ended"
  | "error"
  | "history"; // For loading existing conversation

export interface WSMessage {
  type: WSMessageType;
  data?: string;
  text?: string;
  error?: string;
  sessionId?: string;
  conversationId?: string;
  messages?: ConversationMessage[];
}
