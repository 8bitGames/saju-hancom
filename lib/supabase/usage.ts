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
