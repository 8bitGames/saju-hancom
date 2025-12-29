/**
 * Environment Variable Configuration and Validation
 * Ensures all required environment variables are set at startup
 */

import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),

  // Stripe (Required for payments)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_", "Invalid Stripe publishable key"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "Invalid Stripe secret key"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "Invalid Stripe webhook secret"),

  // AI Configuration (Required)
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "Google AI API key is required"),

  // App Configuration (Optional with defaults)
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Sentry (Optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // SEO Verification (Optional)
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  NAVER_SITE_VERIFICATION: z.string().optional(),

  // Logging (Optional)
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at app startup to ensure all required vars are set
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join(".")).join(", ");
      console.error("❌ Invalid environment variables:", missingVars);
      console.error("   Please check your .env.local file");

      if (process.env.NODE_ENV === "development") {
        console.error("\n   Missing or invalid variables:");
        error.issues.forEach((issue) => {
          console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
        });
      }

      throw new Error(`Invalid environment configuration: ${missingVars}`);
    }
    throw error;
  }
}

/**
 * Get validated environment config
 * Caches the result after first validation
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get the base URL for the app
 */
export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://hansa.ai.kr"
  );
}
