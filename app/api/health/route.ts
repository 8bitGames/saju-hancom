/**
 * Health Check API Endpoint
 * Used for monitoring service availability and dependencies
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    memory: CheckResult;
    environment: CheckResult;
  };
}

interface CheckResult {
  status: "pass" | "fail" | "warn";
  message?: string;
  latency?: number;
}

const startTime = Date.now();

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { status: "fail", message: "Missing Supabase credentials" };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to check database connectivity
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      return { status: "fail", message: error.message, latency };
    }

    // Warn if latency is high
    if (latency > 1000) {
      return { status: "warn", message: "High latency", latency };
    }

    return { status: "pass", latency };
  } catch (error) {
    return {
      status: "fail",
      message: error instanceof Error ? error.message : "Unknown error",
      latency: Date.now() - start
    };
  }
}

function checkMemory(): CheckResult {
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (usagePercent > 90) {
      return {
        status: "fail",
        message: `Memory critical: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`
      };
    }

    if (usagePercent > 75) {
      return {
        status: "warn",
        message: `Memory high: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`
      };
    }

    return {
      status: "pass",
      message: `${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`
    };
  } catch {
    return { status: "pass", message: "Memory check not available" };
  }
}

function checkEnvironment(): CheckResult {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return {
      status: "fail",
      message: `Missing env vars: ${missing.join(", ")}`
    };
  }

  return { status: "pass" };
}

export async function GET() {
  const dbCheck = await checkDatabase();
  const memoryCheck = checkMemory();
  const envCheck = checkEnvironment();

  const checks = {
    database: dbCheck,
    memory: memoryCheck,
    environment: envCheck,
  };

  // Determine overall status
  const allChecks = Object.values(checks);
  let status: HealthStatus["status"] = "healthy";

  if (allChecks.some((c) => c.status === "fail")) {
    status = "unhealthy";
  } else if (allChecks.some((c) => c.status === "warn")) {
    status = "degraded";
  }

  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  // Return appropriate status code
  const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}
