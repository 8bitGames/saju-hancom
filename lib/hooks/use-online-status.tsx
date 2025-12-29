"use client";

/**
 * Online Status Hook
 * Detects network connectivity changes and provides offline/online status
 */

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@/lib/utils/toast";

interface UseOnlineStatusOptions {
  /** Show toast notifications on status change */
  showToast?: boolean;
  /** Callback when going offline */
  onOffline?: () => void;
  /** Callback when coming back online */
  onOnline?: () => void;
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { showToast = true, onOffline, onOnline } = options;

  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);

    if (wasOffline) {
      if (showToast) {
        toast.success("온라인 상태", {
          description: "인터넷 연결이 복구되었습니다",
        });
      }
      onOnline?.();
    }

    setWasOffline(false);
  }, [wasOffline, showToast, onOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);

    if (showToast) {
      toast.warning("오프라인 상태", {
        description: "인터넷 연결이 끊어졌습니다",
        duration: 10000,
      });
    }

    onOffline?.();
  }, [showToast, onOffline]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

/**
 * Provider component that enables online status tracking at app level
 */
export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  // Just track status at provider level, no UI rendered
  useOnlineStatus({ showToast: true });

  return <>{children}</>;
}
