/**
 * Input Validation Schemas
 * Centralized validation for all API inputs using Zod
 */

import { z } from "zod";

// Common validation patterns
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function sanitizeName(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z가-힣\s]/g, "") // Only letters and spaces
    .slice(0, 50);
}

// Base schemas
export const localeSchema = z.enum(["ko", "en"]).catch("ko");

export const genderSchema = z.enum(["male", "female"], {
  message: "성별은 male 또는 female이어야 합니다.",
});

export const birthDateSchema = z
  .string()
  .regex(datePattern, "생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)")
  .refine(
    (date) => {
      const parsed = new Date(date);
      const now = new Date();
      const minDate = new Date("1900-01-01");
      return parsed >= minDate && parsed <= now;
    },
    { message: "유효한 생년월일을 입력해주세요." }
  );

export const birthTimeSchema = z
  .string()
  .regex(timePattern, "태어난 시간 형식이 올바르지 않습니다. (HH:MM)")
  .or(z.literal("unknown"))
  .optional();

export const nameSchema = z
  .string()
  .min(1, "이름을 입력해주세요.")
  .max(50, "이름은 50자 이하여야 합니다.")
  .transform(sanitizeName)
  .optional();

// API-specific schemas
export const sajuAnalyzeSchema = z.object({
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema.default("12:00"),
  gender: genderSchema,
  isLunar: z.boolean().default(false),
  name: nameSchema,
  locale: localeSchema,
});

export const sajuChatSchema = z.object({
  message: z
    .string()
    .min(1, "메시지를 입력해주세요.")
    .max(2000, "메시지는 2000자 이하여야 합니다.")
    .transform(sanitizeString),
  chartId: z.string().uuid("유효한 차트 ID가 아닙니다.").optional(),
  sessionId: z.string().uuid("유효한 세션 ID가 아닙니다.").optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(10000),
      })
    )
    .max(50)
    .optional(),
  locale: localeSchema,
});

export const compatibilitySchema = z.object({
  person1: z.object({
    birthDate: birthDateSchema,
    birthTime: birthTimeSchema.default("12:00"),
    gender: genderSchema,
    name: nameSchema,
    isLunar: z.boolean().default(false),
  }),
  person2: z.object({
    birthDate: birthDateSchema,
    birthTime: birthTimeSchema.default("12:00"),
    gender: genderSchema,
    name: nameSchema,
    isLunar: z.boolean().default(false),
  }),
  locale: localeSchema,
});

export const faceReadingSchema = z.object({
  imageData: z
    .string()
    .min(1, "이미지 데이터가 필요합니다.")
    .refine(
      (data) => {
        // Check if it's a valid base64 image
        const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,/;
        return base64Regex.test(data);
      },
      { message: "유효한 이미지 형식이 아닙니다." }
    )
    .refine(
      (data) => {
        // Check file size (max 10MB)
        const base64Data = data.split(",")[1] || "";
        const sizeInBytes = (base64Data.length * 3) / 4;
        return sizeInBytes <= 10 * 1024 * 1024;
      },
      { message: "이미지 크기는 10MB 이하여야 합니다." }
    ),
  locale: localeSchema,
});

export const fortuneSchema = z.object({
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema.default("12:00"),
  gender: genderSchema,
  isLunar: z.boolean().default(false),
  targetDate: z
    .string()
    .regex(datePattern, "날짜 형식이 올바르지 않습니다.")
    .optional(),
  locale: localeSchema,
});

export const saveResultSchema = z.object({
  resultType: z.enum(["saju", "compatibility", "face-reading", "fortune"]),
  resultData: z.record(z.string(), z.unknown()),
  chartId: z.string().uuid().optional(),
});

export const usageCheckSchema = z.object({
  userId: z.string().uuid("유효한 사용자 ID가 아닙니다."),
  feature: z.enum(["saju", "compatibility", "face-reading", "fortune", "chat"]),
});

// Stripe schemas
export const stripeCheckoutSchema = z.object({
  priceId: z.string().min(1, "가격 ID가 필요합니다."),
  successUrl: z.string().url("유효한 URL이 아닙니다.").optional(),
  cancelUrl: z.string().url("유효한 URL이 아닙니다.").optional(),
});

// Validation helper function
export function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): {
  success: boolean;
  data?: z.infer<T>;
  error?: string;
  errors?: z.ZodFormattedError<z.infer<T>>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const formatted = result.error.format();
  const issues = result.error.issues;
  const firstIssue = issues[0];

  return {
    success: false,
    error: firstIssue?.message || "입력 데이터가 올바르지 않습니다.",
    errors: formatted,
  };
}

// Type exports for use in API routes
export type SajuAnalyzeInput = z.infer<typeof sajuAnalyzeSchema>;
export type SajuChatInput = z.infer<typeof sajuChatSchema>;
export type CompatibilityInput = z.infer<typeof compatibilitySchema>;
export type FaceReadingInput = z.infer<typeof faceReadingSchema>;
export type FortuneInput = z.infer<typeof fortuneSchema>;
export type SaveResultInput = z.infer<typeof saveResultSchema>;
export type UsageCheckInput = z.infer<typeof usageCheckSchema>;
export type StripeCheckoutInput = z.infer<typeof stripeCheckoutSchema>;
