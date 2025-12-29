"use client";

import { useState, useCallback, useEffect } from "react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import type { VoiceSessionConfig, VoiceState, ConversationMessage } from "@/lib/voice/types";
import {
  Phone,
  PhoneDisconnect,
  Microphone,
  MicrophoneSlash,
  Waveform,
  SpinnerGap,
  X,
  Stop,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface VoiceChatButtonProps {
  config: VoiceSessionConfig;
  className?: string;
  onConversationUpdate?: (messages: ConversationMessage[]) => void;
  /** Render as inline button (for tab bars) instead of floating */
  inline?: boolean;
}

// State-based styling and icons
const STATE_CONFIG: Record<
  VoiceState,
  { icon: React.ReactNode; label: string; color: string; pulse?: boolean }
> = {
  idle: {
    icon: <Phone weight="fill" size={24} />,
    label: "Start Voice Chat",
    color: "bg-violet-600 hover:bg-violet-700",
  },
  connecting: {
    icon: <SpinnerGap weight="bold" size={24} className="animate-spin" />,
    label: "Connecting...",
    color: "bg-violet-500",
  },
  ready: {
    icon: <Waveform weight="fill" size={24} />,
    label: "Ready",
    color: "bg-green-600",
    pulse: true,
  },
  listening: {
    icon: <Microphone weight="fill" size={24} />,
    label: "Listening...",
    color: "bg-green-500",
    pulse: true,
  },
  processing: {
    icon: <SpinnerGap weight="bold" size={24} className="animate-spin" />,
    label: "Processing...",
    color: "bg-amber-500",
  },
  speaking: {
    icon: <Waveform weight="fill" size={24} />,
    label: "Hansa is speaking",
    color: "bg-blue-500",
    pulse: true,
  },
  error: {
    icon: <Phone weight="fill" size={24} />,
    label: "Error - Tap to retry",
    color: "bg-red-600 hover:bg-red-700",
  },
};

export function VoiceChatButton({
  config,
  className,
  onConversationUpdate,
  inline = false,
}: VoiceChatButtonProps) {
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
  } = useVoiceChat({
    config,
    onMessage: () => {
      // Notify parent of conversation updates
      onConversationUpdate?.(messages);
    },
    onError: (err) => {
      console.error("[VoiceChatButton] Error:", err);
    },
  });

  // Auto-expand when connected
  useEffect(() => {
    if (isConnected) {
      setIsExpanded(true);
    }
  }, [isConnected]);

  // Notify parent when messages change
  useEffect(() => {
    if (messages.length > 0) {
      onConversationUpdate?.(messages);
    }
  }, [messages, onConversationUpdate]);

  const handleMainButton = useCallback(() => {
    if (state === "idle" || state === "error") {
      connect();
    } else if (state === "speaking") {
      interrupt();
    }
  }, [state, connect, interrupt]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsExpanded(false);
  }, [disconnect]);

  const stateConfig = STATE_CONFIG[state];

  // Inline mode - render as a tab-style button
  if (inline && !isExpanded) {
    return (
      <button
        onClick={handleMainButton}
        className={cn(
          "py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap",
          state === "idle" || state === "error"
            ? "text-white/60 hover:text-white hover:bg-white/5"
            : "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg",
          stateConfig.pulse && "animate-pulse",
          className
        )}
        title={stateConfig.label}
      >
        <Phone className="w-4 h-4 flex-shrink-0" weight="fill" />
        <span className="whitespace-nowrap">음성 통화</span>
      </button>
    );
  }

  // Floating mode - collapsed state (just the button)
  if (!inline && !isExpanded) {
    return (
      <button
        onClick={handleMainButton}
        className={cn(
          "fixed bottom-40 right-4 z-50",
          "flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg",
          "text-white transition-all duration-200",
          stateConfig.color,
          stateConfig.pulse && "animate-pulse",
          className
        )}
        title={stateConfig.label}
      >
        {stateConfig.icon}
      </button>
    );
  }

  // Expanded state - full voice call UI (works for both inline and floating)
  return (
    <div
      className={cn(
        inline
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          : "fixed bottom-40 right-4 z-50",
        className
      )}
      onClick={inline ? (e) => e.target === e.currentTarget && handleDisconnect() : undefined}
    >
    <div
      className={cn(
        "w-80 rounded-2xl shadow-xl",
        "bg-gray-900/95 backdrop-blur-sm border border-gray-700",
        "overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-gray-500"
            )}
          />
          <span className="text-sm font-medium text-white">
            {isConnected ? "Voice Chat Active" : "Voice Chat"}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X weight="bold" size={18} />
        </button>
      </div>

      {/* Transcript Display */}
      <div className="px-4 py-3 min-h-[100px] max-h-[200px] overflow-y-auto">
        {error && (
          <div className="text-sm text-red-400 mb-2">{error}</div>
        )}

        {state === "listening" && userTranscript && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 block mb-1">You:</span>
            <p className="text-sm text-gray-300">{userTranscript}</p>
          </div>
        )}

        {(state === "processing" || state === "speaking") && aiTranscript && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">Hansa:</span>
            <p className="text-sm text-white">{aiTranscript}</p>
          </div>
        )}

        {state === "connecting" && (
          <div className="flex items-center justify-center h-16">
            <SpinnerGap weight="bold" size={32} className="animate-spin text-violet-500" />
          </div>
        )}

        {state === "ready" && !userTranscript && !aiTranscript && (
          <div className="text-center text-gray-500 text-sm py-4">
            Start speaking to Hansa
          </div>
        )}

        {state === "listening" && !userTranscript && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-500 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">Listening...</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-gray-800/30">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          disabled={!isConnected}
          className={cn(
            "p-3 rounded-full transition-all duration-200",
            isMuted
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white",
            !isConnected && "opacity-50 cursor-not-allowed"
          )}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicrophoneSlash weight="fill" size={20} />
          ) : (
            <Microphone weight="fill" size={20} />
          )}
        </button>

        {/* Main Action Button */}
        <button
          onClick={handleMainButton}
          className={cn(
            "p-4 rounded-full transition-all duration-200",
            state === "speaking"
              ? "bg-amber-600 hover:bg-amber-700"
              : stateConfig.color,
            "text-white"
          )}
          title={state === "speaking" ? "Tap to interrupt" : stateConfig.label}
        >
          {state === "speaking" ? (
            <Stop weight="fill" size={24} />
          ) : (
            stateConfig.icon
          )}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleDisconnect}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
          title="End call"
        >
          <PhoneDisconnect weight="fill" size={20} />
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-800/50 text-center">
        <span className="text-xs text-gray-500">{stateConfig.label}</span>
      </div>
    </div>
    </div>
  );
}
