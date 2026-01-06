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

/**
 * Upsert a saju result - insert new or update existing based on birth data
 * Uses composite key: (user_id, birth_year, month, day, hour, minute, gender, is_lunar, city)
 * This prevents duplicate records for the same birth data
 */
export async function upsertSajuResult(
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
): Promise<{ success: boolean; error?: string; resultId?: string; isNew: boolean }> {
  const supabase = await createClient();

  // Use upsert with onConflict to handle duplicates
  const { data, error } = await supabase
    .from('saju_results')
    .upsert(
      {
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
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,birth_year,birth_month,birth_day,birth_hour,birth_minute,gender,is_lunar,city',
        ignoreDuplicates: false, // Update on conflict
      }
    )
    .select('id, created_at, updated_at')
    .single();

  if (error) {
    console.error('[upsertSajuResult] Error:', error);
    return { success: false, error: error.message, isNew: false };
  }

  // Check if this was a new insert or an update
  const isNew = data.created_at === data.updated_at;

  return { success: true, resultId: data.id, isNew };
}

/**
 * Upsert a compatibility result - insert new or update existing based on birth data
 * Uses composite key for both persons' birth data and relation type
 */
export async function upsertCompatibilityResult(
  userId: string,
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  relationType: string,
  resultData: any
): Promise<{ success: boolean; error?: string; resultId?: string; isNew: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compatibility_results')
    .upsert(
      {
        user_id: userId,
        p1_name: person1.name,
        p1_birth_year: person1.year,
        p1_birth_month: person1.month,
        p1_birth_day: person1.day,
        p1_birth_hour: person1.hour,
        p1_birth_minute: person1.minute,
        p1_gender: person1.gender,
        p1_is_lunar: person1.isLunar,
        p2_name: person2.name,
        p2_birth_year: person2.year,
        p2_birth_month: person2.month,
        p2_birth_day: person2.day,
        p2_birth_hour: person2.hour,
        p2_birth_minute: person2.minute,
        p2_gender: person2.gender,
        p2_is_lunar: person2.isLunar,
        relation_type: relationType,
        result_data: resultData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,p1_birth_year,p1_birth_month,p1_birth_day,p1_birth_hour,p1_birth_minute,p1_gender,p1_is_lunar,p2_birth_year,p2_birth_month,p2_birth_day,p2_birth_hour,p2_birth_minute,p2_gender,p2_is_lunar,relation_type',
        ignoreDuplicates: false,
      }
    )
    .select('id, created_at, updated_at')
    .single();

  if (error) {
    console.error('[upsertCompatibilityResult] Error:', error);
    return { success: false, error: error.message, isNew: false };
  }

  const isNew = data.created_at === data.updated_at;
  return { success: true, resultId: data.id, isNew };
}

/**
 * Upsert a couple result - insert new or update existing based on birth data
 * Uses composite key for both persons' birth data and relation type
 */
export async function upsertCoupleResult(
  userId: string,
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  relationType: string,
  resultData: any
): Promise<{ success: boolean; error?: string; resultId?: string; isNew: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('couple_results')
    .upsert(
      {
        user_id: userId,
        p1_name: person1.name,
        p1_birth_year: person1.year,
        p1_birth_month: person1.month,
        p1_birth_day: person1.day,
        p1_birth_hour: person1.hour,
        p1_birth_minute: person1.minute,
        p1_gender: person1.gender,
        p1_is_lunar: person1.isLunar,
        p2_name: person2.name,
        p2_birth_year: person2.year,
        p2_birth_month: person2.month,
        p2_birth_day: person2.day,
        p2_birth_hour: person2.hour,
        p2_birth_minute: person2.minute,
        p2_gender: person2.gender,
        p2_is_lunar: person2.isLunar,
        relation_type: relationType,
        result_data: resultData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,p1_birth_year,p1_birth_month,p1_birth_day,p1_birth_hour,p1_birth_minute,p1_gender,p1_is_lunar,p2_birth_year,p2_birth_month,p2_birth_day,p2_birth_hour,p2_birth_minute,p2_gender,p2_is_lunar,relation_type',
        ignoreDuplicates: false,
      }
    )
    .select('id, created_at, updated_at')
    .single();

  if (error) {
    console.error('[upsertCoupleResult] Error:', error);
    return { success: false, error: error.message, isNew: false };
  }

  const isNew = data.created_at === data.updated_at;
  return { success: true, resultId: data.id, isNew };
}

/**
 * Save a face reading result with image upload
 * Uses hash-based deduplication - if same result hash exists, update it
 */
export async function saveFaceReadingResult(
  userId: string,
  resultData: any,
  imageBase64?: string,
  gender?: string,
  label?: string
): Promise<{ success: boolean; error?: string; resultId?: string; isNew: boolean; imageUrl?: string }> {
  const supabase = await createClient();

  // Create a simple hash from the result data for deduplication
  const resultHash = JSON.stringify({
    overallScore: resultData.overallScore,
    faceShape: resultData.faceShape?.type,
  });

  let imageUrl: string | undefined;

  // Upload image to Supabase Storage if provided
  if (imageBase64) {
    try {
      // Convert base64 to blob
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const filename = `${userId}/${Date.now()}.jpg`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-readings')
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('[saveFaceReadingResult] Image upload error:', uploadError);
        // Continue without image - don't fail the entire save
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('face-readings')
          .getPublicUrl(uploadData.path);

        imageUrl = urlData.publicUrl;
      }
    } catch (uploadErr) {
      console.error('[saveFaceReadingResult] Image processing error:', uploadErr);
      // Continue without image
    }
  }

  // Check if a result with same hash exists
  const { data: existing } = await supabase
    .from('face_reading_results')
    .select('id, image_url')
    .eq('user_id', userId)
    .eq('result_hash', resultHash)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('face_reading_results')
      .update({
        result_data: resultData,
        image_url: imageUrl || existing.image_url, // Keep existing image if no new one
        gender: gender || 'male',
        label,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id, image_url')
      .single();

    if (error) {
      console.error('[saveFaceReadingResult] Update error:', error);
      return { success: false, error: error.message, isNew: false };
    }

    return { success: true, resultId: data.id, isNew: false, imageUrl: data.image_url };
  }

  // Insert new
  const { data, error } = await supabase
    .from('face_reading_results')
    .insert({
      user_id: userId,
      result_data: resultData,
      result_hash: resultHash,
      image_url: imageUrl,
      gender: gender || 'male',
      label,
    })
    .select('id, image_url')
    .single();

  if (error) {
    console.error('[saveFaceReadingResult] Insert error:', error);
    return { success: false, error: error.message, isNew: false };
  }

  return { success: true, resultId: data.id, isNew: true, imageUrl: data.image_url };
}

/**
 * Get user's compatibility results
 */
export async function getUserCompatibilityResults(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compatibility_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, results: [] };
  }

  return { success: true, results: data || [] };
}

/**
 * Get user's couple results
 */
export async function getUserCoupleResults(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('couple_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, results: [] };
  }

  return { success: true, results: data || [] };
}

/**
 * Get a couple result by ID
 */
export async function getCoupleResultById(userId: string, resultId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('couple_results')
    .select('*')
    .eq('id', resultId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return { success: false, error: error.message, result: null };
  }

  return { success: true, result: data };
}

/**
 * Update couple result with detailed analysis data
 * This adds the detailed Myeongrihak analysis to an existing couple result
 */
export async function updateCoupleDetailedResult(
  userId: string,
  person1Birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  person2Birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  relationType: string,
  detailedResultData: any
): Promise<{ success: boolean; error?: string; resultId?: string }> {
  const supabase = await createClient();

  // Find the existing couple result
  const { data: existing, error: findError } = await supabase
    .from('couple_results')
    .select('id, result_data')
    .eq('user_id', userId)
    .eq('p1_birth_year', person1Birth.year)
    .eq('p1_birth_month', person1Birth.month)
    .eq('p1_birth_day', person1Birth.day)
    .eq('p1_birth_hour', person1Birth.hour)
    .eq('p1_birth_minute', person1Birth.minute)
    .eq('p1_gender', person1Birth.gender)
    .eq('p1_is_lunar', person1Birth.isLunar)
    .eq('p2_birth_year', person2Birth.year)
    .eq('p2_birth_month', person2Birth.month)
    .eq('p2_birth_day', person2Birth.day)
    .eq('p2_birth_hour', person2Birth.hour)
    .eq('p2_birth_minute', person2Birth.minute)
    .eq('p2_gender', person2Birth.gender)
    .eq('p2_is_lunar', person2Birth.isLunar)
    .eq('relation_type', relationType)
    .single();

  if (findError || !existing) {
    console.error('[updateCoupleDetailedResult] Record not found:', findError?.message);
    return { success: false, error: 'Couple result not found' };
  }

  // Update the result_data to include detailed analysis
  const updatedResultData = {
    ...existing.result_data,
    detailedResult: detailedResultData,
  };

  const { error: updateError } = await supabase
    .from('couple_results')
    .update({
      result_data: updatedResultData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (updateError) {
    console.error('[updateCoupleDetailedResult] Update error:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true, resultId: existing.id };
}

/**
 * Update compatibility result with detailed analysis data
 * This adds the detailed Myeongrihak analysis to an existing compatibility (workplace) result
 */
export async function updateCompatibilityDetailedResult(
  userId: string,
  person1Birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  person2Birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  },
  relationType: string,
  detailedResultData: any
): Promise<{ success: boolean; error?: string; resultId?: string }> {
  const supabase = await createClient();

  // Find the existing compatibility result
  const { data: existing, error: findError } = await supabase
    .from('compatibility_results')
    .select('id, result_data')
    .eq('user_id', userId)
    .eq('p1_birth_year', person1Birth.year)
    .eq('p1_birth_month', person1Birth.month)
    .eq('p1_birth_day', person1Birth.day)
    .eq('p1_birth_hour', person1Birth.hour)
    .eq('p1_birth_minute', person1Birth.minute)
    .eq('p1_gender', person1Birth.gender)
    .eq('p1_is_lunar', person1Birth.isLunar)
    .eq('p2_birth_year', person2Birth.year)
    .eq('p2_birth_month', person2Birth.month)
    .eq('p2_birth_day', person2Birth.day)
    .eq('p2_birth_hour', person2Birth.hour)
    .eq('p2_birth_minute', person2Birth.minute)
    .eq('p2_gender', person2Birth.gender)
    .eq('p2_is_lunar', person2Birth.isLunar)
    .eq('relation_type', relationType)
    .single();

  if (findError || !existing) {
    console.error('[updateCompatibilityDetailedResult] Record not found:', findError?.message);
    return { success: false, error: 'Compatibility result not found' };
  }

  // Update the result_data to include detailed analysis
  const updatedResultData = {
    ...existing.result_data,
    detailedResult: detailedResultData,
  };

  const { error: updateError } = await supabase
    .from('compatibility_results')
    .update({
      result_data: updatedResultData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (updateError) {
    console.error('[updateCompatibilityDetailedResult] Update error:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true, resultId: existing.id };
}

/**
 * Get user's face reading results
 */
export async function getUserFaceReadingResults(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('face_reading_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, results: [] };
  }

  return { success: true, results: data || [] };
}

/**
 * Get a saju result by ID for public sharing
 * Uses admin client to bypass RLS since this is for public viewing
 * Returns only the essential data needed for display (no user info)
 */
export async function getSajuResultById(resultId: string) {
  // Use dynamic import to avoid issues with server/client bundling
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');

  // Create admin client that bypasses RLS for public shared results
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabaseAdmin
    .from('saju_results')
    .select('id, birth_year, birth_month, birth_day, birth_hour, birth_minute, gender, is_lunar, city, result_data, created_at')
    .eq('id', resultId)
    .single();

  if (error) {
    console.error('[getSajuResultById] Error:', error.message);
    return { success: false, error: error.message, result: null };
  }

  if (!data) {
    return { success: false, error: 'Result not found', result: null };
  }

  return {
    success: true,
    result: {
      id: data.id,
      birthData: {
        year: data.birth_year,
        month: data.birth_month,
        day: data.birth_day,
        hour: data.birth_hour,
        minute: data.birth_minute,
        gender: data.gender,
        isLunar: data.is_lunar,
        city: data.city,
      },
      resultData: data.result_data,
      createdAt: data.created_at,
    },
  };
}

// ============================================================================
// Daily Fortune (오늘의 운세) 캐싱
// ============================================================================

/**
 * 저장된 일운(오늘의 운세) 조회
 * 같은 날짜의 같은 사주 결과에 대해 캐싱된 운세가 있으면 반환
 */
export async function getDailyFortune(
  userId: string,
  sajuResultId: string,
  date: string // YYYY-MM-DD format
): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saju_daily_fortunes')
    .select('fortune_data')
    .eq('user_id', userId)
    .eq('saju_result_id', sajuResultId)
    .eq('fortune_date', date)
    .single();

  if (error) {
    // PGRST116 = no rows found, which is not an error for cache miss
    if (error.code === 'PGRST116') {
      return { success: true, data: undefined };
    }
    console.error('[getDailyFortune] Error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data: data?.fortune_data };
}

/**
 * 일운(오늘의 운세) 저장 (upsert)
 * 같은 날짜의 같은 사주 결과에 대해 운세를 저장하거나 업데이트
 */
export async function saveDailyFortune(
  userId: string,
  sajuResultId: string,
  date: string, // YYYY-MM-DD format
  fortuneData: unknown
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('saju_daily_fortunes')
    .upsert(
      {
        user_id: userId,
        saju_result_id: sajuResultId,
        fortune_date: date,
        fortune_data: fortuneData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,saju_result_id,fortune_date',
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error('[saveDailyFortune] Error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 사용자의 최근 일운 목록 조회
 */
export async function getRecentDailyFortunes(
  userId: string,
  limit: number = 7
): Promise<{
  success: boolean;
  fortunes?: Array<{
    date: string;
    sajuResultId: string;
    fortuneData: unknown;
  }>;
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saju_daily_fortunes')
    .select('fortune_date, saju_result_id, fortune_data')
    .eq('user_id', userId)
    .order('fortune_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getRecentDailyFortunes] Error:', error.message);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    fortunes: (data || []).map((row) => ({
      date: row.fortune_date,
      sajuResultId: row.saju_result_id,
      fortuneData: row.fortune_data,
    })),
  };
}
