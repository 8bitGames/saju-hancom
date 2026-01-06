"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type {
  VoiceState,
  ConversationMessage,
  UseVoiceChatReturn,
  WSMessage,
  VoiceSessionConfig,
} from "@/lib/voice/types";
import { AUDIO_CONFIG } from "@/lib/voice/constants";

interface UseVoiceChatOptions {
  config: VoiceSessionConfig;
  onMessage?: (message: ConversationMessage) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

export function useVoiceChat({
  config,
  onMessage,
  onError,
  onStateChange,
}: UseVoiceChatOptions): UseVoiceChatReturn {
  // State
  const [state, setState] = useState<VoiceState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTranscript, setUserTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vadRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const isSpeakingRef = useRef(false);

  // Update state with callback
  const updateState = useCallback(
    (newState: VoiceState) => {
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Handle error
  const handleError = useCallback(
    (errorMsg: string) => {
      setError(errorMsg);
      updateState("error");
      onError?.(errorMsg);
    },
    [onError, updateState]
  );

  // Add message to conversation
  const addMessage = useCallback(
    (message: ConversationMessage) => {
      setMessages((prev) => [...prev, message]);
      onMessage?.(message);
    },
    [onMessage]
  );

  // Play TTS audio chunk
  const playAudioChunk = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM Float32 to AudioBuffer
      const float32Array = new Float32Array(bytes.buffer);
      audioQueueRef.current.push(float32Array);

      // Start playback if not already playing
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (err) {
      console.error("[useVoiceChat] Error playing audio:", err);
    }
  }, []);

  // Play next audio chunk from queue
  const playNextInQueue = useCallback(async () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;

    const audioBuffer = audioContextRef.current.createBuffer(
      1,
      chunk.length,
      AUDIO_CONFIG.tts.sampleRate
    );
    audioBuffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  }, []);

  // Handle WebSocket messages
  const handleWSMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WSMessage = JSON.parse(event.data);

        switch (message.type) {
          case "ready":
            updateState("ready");
            if (message.conversationId) {
              setConversationId(message.conversationId);
            }
            break;

          case "history":
            // Load existing conversation history
            if (message.messages) {
              setMessages(message.messages);
            }
            break;

          case "listening":
            updateState("listening");
            setUserTranscript("");
            // Resume VAD when listening
            vadRef.current?.start();
            break;

          case "transcript":
            // User's speech transcription
            if (message.text) {
              setUserTranscript(message.text);
            }
            break;

          case "processing":
            updateState("processing");
            // Pause VAD while AI is processing to prevent interruption
            vadRef.current?.pause();
            // Add user message to conversation
            if (userTranscript) {
              addMessage({
                id: crypto.randomUUID(),
                role: "user",
                content: userTranscript,
                channel: "voice",
                timestamp: new Date(),
              });
            }
            break;

          case "speaking":
            updateState("speaking");
            setAiTranscript("");
            // Pause VAD while AI speaks to avoid feedback
            vadRef.current?.pause();
            break;

          case "response":
            // AI text response (for display)
            if (message.text) {
              setAiTranscript((prev) => prev + message.text);
            }
            break;

          case "tts_chunk":
            // Streaming audio chunk to play immediately
            if (message.data) {
              playAudioChunk(message.data);
            }
            break;

          case "tts_audio":
            // Complete audio (fallback for non-streaming clients)
            if (message.data) {
              playAudioChunk(message.data);
            }
            break;

          case "tts_done":
            // AI finished speaking
            if (aiTranscript) {
              addMessage({
                id: crypto.randomUUID(),
                role: "assistant",
                content: aiTranscript,
                channel: "voice",
                timestamp: new Date(),
              });
            }
            updateState("listening");
            // Resume VAD after AI finishes
            vadRef.current?.start();
            break;

          case "interrupted":
            // Clear audio queue on interrupt
            audioQueueRef.current = [];
            updateState("listening");
            vadRef.current?.start();
            break;

          case "ended":
            updateState("idle");
            break;

          case "error":
            handleError(message.error || "Unknown error");
            break;
        }
      } catch (err) {
        console.error("[useVoiceChat] Error parsing message:", err);
      }
    },
    [updateState, userTranscript, aiTranscript, addMessage, playAudioChunk, handleError]
  );

  // Initialize VAD with Silero
  const initVAD = useCallback(async () => {
    try {
      // Dynamic import for client-side only
      const { MicVAD } = await import("@ricky0123/vad-web");

      // Create AudioContext for playback
      audioContextRef.current = new AudioContext({ sampleRate: AUDIO_CONFIG.tts.sampleRate });

      // Initialize VAD with absolute paths to public assets
      const baseUrl = window.location.origin;
      const vad = await MicVAD.new({
        baseAssetPath: `${baseUrl}/vad/`,
        onnxWASMBasePath: `${baseUrl}/vad/`,
        model: "legacy",
        positiveSpeechThreshold: 0.8, // Higher threshold for better accuracy
        negativeSpeechThreshold: 0.3,
        redemptionMs: 500, // More time before ending speech
        preSpeechPadMs: 300, // Capture audio before speech starts

        onSpeechStart: () => {
          console.log("[VAD] Speech started");
          isSpeakingRef.current = true;
        },

        onSpeechEnd: (audio: Float32Array) => {
          console.log("[VAD] Speech ended, audio length:", audio.length);
          isSpeakingRef.current = false;

          // Only send if we have WebSocket connection and meaningful audio
          if (wsRef.current?.readyState === WebSocket.OPEN && audio.length > 8000) {
            // Convert Float32 to Int16 PCM for better quality transmission
            const int16Audio = float32ToInt16(audio);

            // Encode as base64 using chunked approach to avoid stack overflow
            const uint8Array = new Uint8Array(int16Audio.buffer);
            let binary = "";
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, i + chunkSize);
              binary += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const base64 = btoa(binary);

            console.log("[VAD] Sending audio:", int16Audio.length, "samples");
            wsRef.current.send(JSON.stringify({ type: "audio", data: base64 }));
          }
        },
      });

      vadRef.current = vad;
      return true;
    } catch (err) {
      console.error("[useVoiceChat] VAD init error:", err);
      handleError("Failed to initialize voice detection");
      return false;
    }
  }, [handleError]);

  // Convert Float32 to Int16
  const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  };

  // Connect to voice session
  const connect = useCallback(async () => {
    if (state !== "idle" && state !== "error") return;

    updateState("connecting");
    setError(null);

    try {
      // Create session via API
      const response = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: config.locale,
          primaryContext: config.primaryContext,
          contextId: config.primaryContext.data?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create voice session");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Session creation failed");
      }

      sessionIdRef.current = data.sessionId;
      setConversationId(data.conversationId || null);

      // Load existing messages if resuming
      if (data.existingMessages) {
        setMessages(data.existingMessages);
      }

      // Initialize VAD
      const vadReady = await initVAD();
      if (!vadReady) return;

      // Connect to WebSocket
      const ws = new WebSocket(data.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[useVoiceChat] WebSocket connected");
        // VAD will auto-start and begin listening
        vadRef.current?.start();
      };

      ws.onmessage = handleWSMessage;

      ws.onerror = () => {
        handleError("WebSocket connection error");
      };

      ws.onclose = () => {
        if (state !== "idle") {
          updateState("idle");
        }
      };
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [state, config, updateState, initVAD, handleWSMessage, handleError]);

  // Disconnect from voice session
  const disconnect = useCallback(() => {
    // Stop VAD
    vadRef.current?.pause();
    vadRef.current?.destroy();
    vadRef.current = null;

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "end" }));
      wsRef.current.close();
      wsRef.current = null;
    }

    // Close audio context
    audioContextRef.current?.close();
    audioContextRef.current = null;

    // Clear state
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    sessionIdRef.current = null;

    updateState("idle");
  }, [updateState]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (vadRef.current) {
      if (isMuted) {
        vadRef.current.start();
      } else {
        vadRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Interrupt AI speaking
  const interrupt = useCallback(() => {
    if (state === "speaking" && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "interrupt" }));
      audioQueueRef.current = [];
    }
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    isConnected: state !== "idle" && state !== "error" && state !== "connecting",
    isMuted,
    error,
    userTranscript,
    aiTranscript,
    messages,
    conversationId,
    connect,
    disconnect,
    toggleMute,
    interrupt,
  };
}
