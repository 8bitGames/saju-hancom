/**
 * Standardized API Response Utilities
 * Consistent error handling and response formatting
 */

import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "BAD_REQUEST"
  | "PAYMENT_REQUIRED";

interface ApiErrorDetails {
  code: ApiErrorCode;
  status: number;
  message: string;
  messageKo: string;
}

const ERROR_MAP: Record<ApiErrorCode, ApiErrorDetails> = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    status: 400,
    message: "Invalid input data",
    messageKo: "입력 데이터가 올바르지 않습니다.",
  },
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    status: 400,
    message: "Bad request",
    messageKo: "잘못된 요청입니다.",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    status: 401,
    message: "Authentication required",
    messageKo: "로그인이 필요합니다.",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    status: 403,
    message: "Access denied",
    messageKo: "접근 권한이 없습니다.",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    status: 404,
    message: "Resource not found",
    messageKo: "요청한 리소스를 찾을 수 없습니다.",
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    status: 429,
    message: "Too many requests",
    messageKo: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  },
  PAYMENT_REQUIRED: {
    code: "PAYMENT_REQUIRED",
    status: 402,
    message: "Payment required",
    messageKo: "결제가 필요합니다.",
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    status: 500,
    message: "Internal server error",
    messageKo: "서버 오류가 발생했습니다.",
  },
  SERVICE_UNAVAILABLE: {
    code: "SERVICE_UNAVAILABLE",
    status: 503,
    message: "Service temporarily unavailable",
    messageKo: "서비스가 일시적으로 이용 불가능합니다.",
  },
};

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ApiErrorCode,
  customMessage?: string,
  details?: unknown,
  locale: "ko" | "en" = "ko"
): Response {
  const errorDetails = ERROR_MAP[code];
  const message =
    customMessage ||
    (locale === "ko" ? errorDetails.messageKo : errorDetails.message);

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && process.env.NODE_ENV === "development" ? { details } : {}),
    },
  };

  return new Response(JSON.stringify(response), {
    status: errorDetails.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Handle validation errors from Zod
 */
export function validationErrorResponse(
  error: ZodError,
  locale: "ko" | "en" = "ko"
): Response {
  const issues = error.issues;
  const firstIssue = issues[0];
  const message = firstIssue?.message || ERROR_MAP.VALIDATION_ERROR.messageKo;

  return errorResponse(
    "VALIDATION_ERROR",
    message,
    process.env.NODE_ENV === "development" ? error.format() : undefined,
    locale
  );
}

/**
 * Handle unknown errors safely
 */
export function handleApiError(
  error: unknown,
  locale: "ko" | "en" = "ko"
): Response {
  // Log error for monitoring
  console.error("[API Error]", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return validationErrorResponse(error, locale);
  }

  // Handle known error types
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : locale === "ko"
          ? "서버 오류가 발생했습니다."
          : "An error occurred";

    return errorResponse(
      "INTERNAL_ERROR",
      message,
      process.env.NODE_ENV === "development"
        ? { stack: error.stack }
        : undefined,
      locale
    );
  }

  return errorResponse("INTERNAL_ERROR", undefined, undefined, locale);
}

/**
 * Parse request body safely with error handling
 */
export async function parseRequestBody<T>(
  request: Request
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  try {
    const body = await request.json();
    return { success: true, data: body as T };
  } catch {
    return {
      success: false,
      response: errorResponse("BAD_REQUEST", "Invalid JSON body"),
    };
  }
}

/**
 * Get locale from request
 */
export function getLocaleFromRequest(request: Request): "ko" | "en" {
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  return acceptLanguage.includes("en") ? "en" : "ko";
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandling<T extends Request>(
  handler: (request: T, ...args: unknown[]) => Promise<Response>
) {
  return async (request: T, ...args: unknown[]): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      const locale = getLocaleFromRequest(request);
      return handleApiError(error, locale);
    }
  };
}
