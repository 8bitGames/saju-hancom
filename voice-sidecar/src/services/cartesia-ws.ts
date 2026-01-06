/**
 * Cartesia WebSocket TTS Service
 *
 * Optimized for low latency streaming audio generation.
 * Key optimizations:
 * - Persistent WebSocket connection (saves ~200ms per request)
 * - Streaming audio chunks (reduces time-to-first-byte)
 * - Configurable buffer delay for quality vs latency tradeoff
 *
 * @see https://docs.cartesia.ai/api-reference/tts/tts
 */

import {
  CARTESIA_WS_CONFIG,
  AUDIO_CONFIG,
  TTS_MODEL,
  HANSA_VOICE_ID,
} from "../constants";

interface CartesiaMessage {
  type: "chunk" | "timestamps" | "done" | "error";
  context_id?: string;
  data?: string; // base64 audio for chunk type
  step_time?: number;
  done?: boolean;
  error?: string;
  status_code?: number;
}

interface TTSRequest {
  model_id: string;
  transcript: string;
  voice: {
    mode: "id";
    id: string;
    __experimental_controls?: {
      speed?: "slowest" | "slow" | "normal" | "fast" | "fastest" | number;
      emotion?: string[];
    };
  };
  language: string;
  context_id: string;
  continue: boolean;
  output_format: {
    container: "raw";
    encoding: "pcm_s16le" | "pcm_f32le";
    sample_rate: number;
  };
  // Lower = faster first byte, higher = better quality for streamed input
  // Since we send complete text, 0 is optimal for fastest response
  max_buffer_delay_ms?: number;
}

type AudioChunkCallback = (chunk: Uint8Array) => void;
type DoneCallback = () => void;
type ErrorCallback = (error: string) => void;

class CartesiaWebSocketService {
  private ws: WebSocket | null = null;
  private isConnecting = false;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Pending requests by context_id
  private pendingRequests = new Map<
    string,
    {
      onChunk: AudioChunkCallback;
      onDone: DoneCallback;
      onError: ErrorCallback;
    }
  >();

  // Connection promise for ensuring connection before sending
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    // Pre-warm connection on service instantiation
    this.connect();
  }

  private getWsUrl(): string {
    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      throw new Error("CARTESIA_API_KEY is not set");
    }
    return `${CARTESIA_WS_CONFIG.wsUrl}?api_key=${apiKey}&cartesia_version=${CARTESIA_WS_CONFIG.apiVersion}`;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (this.isConnected) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 50);
        return;
      }

      this.isConnecting = true;
      console.log("[Cartesia WS] Connecting...");

      try {
        this.ws = new WebSocket(this.getWsUrl());

        this.ws.onopen = () => {
          console.log("[Cartesia WS] Connected");
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("[Cartesia WS] Error:", error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log(`[Cartesia WS] Closed: ${event.code} ${event.reason}`);
          this.isConnected = false;
          this.isConnecting = false;
          this.ws = null;
          this.connectionPromise = null;

          // Reject all pending requests
          for (const [contextId, handlers] of this.pendingRequests) {
            handlers.onError("WebSocket connection closed");
            this.pendingRequests.delete(contextId);
          }

          // Auto-reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[Cartesia WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private handleMessage(data: string): void {
    try {
      const message: CartesiaMessage = JSON.parse(data);
      const contextId = message.context_id;

      if (!contextId) {
        console.warn("[Cartesia WS] Message without context_id:", message);
        return;
      }

      const handlers = this.pendingRequests.get(contextId);
      if (!handlers) {
        // Message for unknown context (possibly already completed)
        return;
      }

      switch (message.type) {
        case "chunk":
          if (message.data) {
            // Decode base64 audio chunk and send immediately
            const binaryString = atob(message.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            handlers.onChunk(bytes);
          }
          break;

        case "done":
          handlers.onDone();
          this.pendingRequests.delete(contextId);
          break;

        case "error":
          console.error("[Cartesia WS] TTS Error:", message.error);
          handlers.onError(message.error || "Unknown TTS error");
          this.pendingRequests.delete(contextId);
          break;

        case "timestamps":
          // Timestamps are useful for subtitles, but not needed for audio playback
          break;

        default:
          console.warn("[Cartesia WS] Unknown message type:", message);
      }
    } catch (error) {
      console.error("[Cartesia WS] Failed to parse message:", error);
    }
  }

  /**
   * Generate TTS audio with streaming chunks
   *
   * @param text - Text to synthesize
   * @param language - Language code (e.g., "ko", "en")
   * @param onChunk - Called for each audio chunk (for immediate streaming)
   * @param onDone - Called when generation is complete
   * @param onError - Called on error
   * @returns context_id for potential interruption
   */
  async generateStreaming(
    text: string,
    language: string,
    onChunk: AudioChunkCallback,
    onDone: DoneCallback,
    onError: ErrorCallback
  ): Promise<string> {
    // Ensure connection
    await this.connect();

    if (!this.ws || !this.isConnected) {
      onError("WebSocket not connected");
      return "";
    }

    // Generate unique context ID for this request
    const contextId = `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Register handlers
    this.pendingRequests.set(contextId, { onChunk, onDone, onError });

    // Build request
    const request: TTSRequest = {
      model_id: TTS_MODEL,
      transcript: text,
      voice: {
        mode: "id",
        id: HANSA_VOICE_ID,
        // Optional: Add speed control for faster speech
        // __experimental_controls: { speed: "normal" }
      },
      language: language === "ko" ? "ko" : language,
      context_id: contextId,
      continue: false, // Complete text, no continuation
      output_format: {
        container: AUDIO_CONFIG.tts.container,
        encoding: AUDIO_CONFIG.tts.encoding,
        sample_rate: AUDIO_CONFIG.tts.sampleRate,
      },
      // 0 = no buffering, start generating immediately for fastest first byte
      // Since we send complete text at once, this is optimal
      max_buffer_delay_ms: 0,
    };

    console.log(`[Cartesia WS] Generating TTS for: "${text.substring(0, 50)}..." (${contextId})`);

    try {
      this.ws.send(JSON.stringify(request));
    } catch (error) {
      this.pendingRequests.delete(contextId);
      onError(`Failed to send request: ${error}`);
    }

    return contextId;
  }

  /**
   * Cancel an ongoing TTS generation
   */
  cancelGeneration(contextId: string): void {
    const handlers = this.pendingRequests.get(contextId);
    if (handlers) {
      this.pendingRequests.delete(contextId);
      console.log(`[Cartesia WS] Cancelled generation: ${contextId}`);
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isConnected && this.ws !== null;
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.ws.close(1000, "Service shutdown");
      this.ws = null;
    }
    this.isConnected = false;
    this.pendingRequests.clear();
  }
}

// Export singleton instance for connection reuse across requests
export const cartesiaWS = new CartesiaWebSocketService();
