"use client";

/**
 * Toast Notification Utilities
 * Wraps sonner for consistent toast styling and behavior
 */

import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 3000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 3000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Show a loading toast that can be updated
   */
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Show a promise toast that updates based on promise state
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

/**
 * Common toast messages for consistent UX
 */
export const toastMessages = {
  // Success messages
  saved: () => toast.success("저장되었습니다"),
  copied: () => toast.success("복사되었습니다"),
  deleted: () => toast.success("삭제되었습니다"),
  sent: () => toast.success("전송되었습니다"),

  // Error messages
  genericError: () =>
    toast.error("오류가 발생했습니다", {
      description: "잠시 후 다시 시도해주세요",
    }),
  networkError: () =>
    toast.error("네트워크 오류", {
      description: "인터넷 연결을 확인해주세요",
    }),
  authError: () =>
    toast.error("로그인이 필요합니다", {
      description: "로그인 후 이용해주세요",
    }),
  limitExceeded: () =>
    toast.warning("이용 한도 초과", {
      description: "프리미엄으로 업그레이드하여 무제한 이용하세요",
    }),

  // Info messages
  comingSoon: () => toast.info("준비 중입니다", { description: "곧 만나보실 수 있어요" }),
  offline: () =>
    toast.warning("오프라인 상태", {
      description: "인터넷 연결이 끊어졌습니다",
    }),
  online: () => toast.success("온라인 상태", { description: "연결이 복구되었습니다" }),
};
