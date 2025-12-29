/**
 * Security Module Exports
 * Centralized security utilities for the application
 */

// Rate Limiting
export {
  checkRateLimit,
  withRateLimit,
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
  type RateLimitType,
} from "./rate-limiter";

// Input Validation
export {
  // Schemas
  sajuAnalyzeSchema,
  sajuChatSchema,
  compatibilitySchema,
  faceReadingSchema,
  fortuneSchema,
  saveResultSchema,
  usageCheckSchema,
  stripeCheckoutSchema,
  localeSchema,
  genderSchema,
  birthDateSchema,
  birthTimeSchema,
  nameSchema,
  // Utilities
  validateInput,
  sanitizeString,
  sanitizeName,
  // Types
  type SajuAnalyzeInput,
  type SajuChatInput,
  type CompatibilityInput,
  type FaceReadingInput,
  type FortuneInput,
  type SaveResultInput,
  type UsageCheckInput,
  type StripeCheckoutInput,
} from "./validation";

// API Response
export {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleApiError,
  parseRequestBody,
  getLocaleFromRequest,
  withErrorHandling,
  type ApiErrorCode,
  type ApiResponse,
} from "./api-response";
