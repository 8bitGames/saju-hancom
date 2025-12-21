import { createClient } from './server';
import type { UsageActionType } from './types';

// Usage limits enabled - free tier users get 1 download
const DISABLE_USAGE_LIMITS = false;

/**
 * Check if user has remaining free tier usage for a specific action
 */
export async function checkUsageLimit(
  userId: string,
  actionType: UsageActionType
): Promise<{ allowed: boolean; count: number; limit: number }> {
  // TEMPORARY: Skip limit check during testing
  if (DISABLE_USAGE_LIMITS) {
    return { allowed: true, count: 0, limit: 999 };
  }

  const supabase = await createClient();

  // Check user's subscription tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', userId)
    .single();

  // Premium users have unlimited usage
  if (
    profile?.subscription_tier === 'premium' &&
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date()
  ) {
    return { allowed: true, count: 0, limit: -1 }; // -1 means unlimited
  }

  // Free tier: limit to 1 per action type
  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('id')
    .eq('user_id', userId)
    .eq('action_type', actionType);

  const count = usage?.length || 0;
  const limit = 1;

  return {
    allowed: count < limit,
    count,
    limit,
  };
}

/**
 * Track a usage action
 */
export async function trackUsage(
  userId: string,
  actionType: UsageActionType,
  sajuResultId?: string,
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if user has remaining usage
  const { allowed } = await checkUsageLimit(userId, actionType);

  if (!allowed) {
    return {
      success: false,
      error: 'Usage limit reached. Please upgrade to premium.',
    };
  }

  // Record the usage
  const { error } = await supabase.from('usage_tracking').insert({
    user_id: userId,
    action_type: actionType,
    saju_result_id: sajuResultId,
    metadata,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Save a saju result to the database
 */
export async function saveSajuResult(
  userId: string,
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  },
  resultData: any
): Promise<{ success: boolean; error?: string; resultId?: string }> {
  const supabase = await createClient();

  // Check save limit
  const usageCheck = await checkUsageLimit(userId, 'save_result');
  if (!usageCheck.allowed) {
    return {
      success: false,
      error: 'You have already saved a result. Upgrade to premium for unlimited saves.',
    };
  }

  // Save the result
  const { data, error } = await supabase
    .from('saju_results')
    .insert({
      user_id: userId,
      birth_year: birthData.year,
      birth_month: birthData.month,
      birth_day: birthData.day,
      birth_hour: birthData.hour,
      birth_minute: birthData.minute,
      gender: birthData.gender,
      is_lunar: birthData.isLunar,
      city: birthData.city,
      result_data: resultData,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Track the save action
  await trackUsage(userId, 'save_result', data.id);

  return { success: true, resultId: data.id };
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', userId)
    .single();

  const isPremium =
    profile?.subscription_tier === 'premium' &&
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  return {
    tier: profile?.subscription_tier || 'free',
    isPremium: isPremium || false,
    expiresAt: profile?.subscription_expires_at,
  };
}

/**
 * Get user's saved results
 */
export async function getUserSajuResults(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saju_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, results: [] };
  }

  return { success: true, results: data || [] };
}
