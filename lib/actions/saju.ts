'use server';

import { createClient } from '@/lib/supabase/server';
import {
  upsertSajuResult,
  upsertCompatibilityResult,
  upsertCoupleResult,
  saveFaceReadingResult
} from '@/lib/supabase/usage';

export interface SaveSajuResultInput {
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  resultData: any;
  interpretation?: any;
}

export async function autoSaveSajuResult(input: SaveSajuResultInput): Promise<{
  success: boolean;
  error?: string;
  resultId?: string;
  isNew: boolean;
  savedAt?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only save for authenticated users
    if (!user) {
      return { success: false, error: 'Not authenticated', isNew: false };
    }

    // Combine result data with interpretation for complete record
    const fullResultData = {
      ...input.resultData,
      interpretation: input.interpretation,
    };

    const result = await upsertSajuResult(
      user.id,
      input.birthData,
      fullResultData
    );

    if (result.success) {
      return {
        success: true,
        resultId: result.resultId,
        isNew: result.isNew,
        savedAt: new Date().toISOString(),
      };
    }

    return { success: false, error: result.error, isNew: false };
  } catch (error) {
    console.error('[autoSaveSajuResult] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isNew: false,
    };
  }
}

export interface SaveCompatibilityResultInput {
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  relationType: string;
  resultData: any;
  interpretation?: any;
}

export async function autoSaveCompatibilityResult(input: SaveCompatibilityResultInput): Promise<{
  success: boolean;
  error?: string;
  resultId?: string;
  isNew: boolean;
  savedAt?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated', isNew: false };
    }

    const fullResultData = {
      ...input.resultData,
      interpretation: input.interpretation,
    };

    const result = await upsertCompatibilityResult(
      user.id,
      input.person1,
      input.person2,
      input.relationType,
      fullResultData
    );

    if (result.success) {
      return {
        success: true,
        resultId: result.resultId,
        isNew: result.isNew,
        savedAt: new Date().toISOString(),
      };
    }

    return { success: false, error: result.error, isNew: false };
  } catch (error) {
    console.error('[autoSaveCompatibilityResult] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isNew: false,
    };
  }
}

export interface SaveCoupleResultInput {
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
  };
  relationType: string;
  resultData: any;
  interpretation?: any;
}

export async function autoSaveCoupleResult(input: SaveCoupleResultInput): Promise<{
  success: boolean;
  error?: string;
  resultId?: string;
  isNew: boolean;
  savedAt?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated', isNew: false };
    }

    const fullResultData = {
      ...input.resultData,
      interpretation: input.interpretation,
    };

    const result = await upsertCoupleResult(
      user.id,
      input.person1,
      input.person2,
      input.relationType,
      fullResultData
    );

    if (result.success) {
      return {
        success: true,
        resultId: result.resultId,
        isNew: result.isNew,
        savedAt: new Date().toISOString(),
      };
    }

    return { success: false, error: result.error, isNew: false };
  } catch (error) {
    console.error('[autoSaveCoupleResult] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isNew: false,
    };
  }
}

export interface SaveFaceReadingResultInput {
  resultData: any;
  imageBase64?: string;
  gender?: string;
  label?: string;
}

export async function autoSaveFaceReadingResult(input: SaveFaceReadingResultInput): Promise<{
  success: boolean;
  error?: string;
  resultId?: string;
  isNew: boolean;
  savedAt?: string;
  imageUrl?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated', isNew: false };
    }

    const result = await saveFaceReadingResult(
      user.id,
      input.resultData,
      input.imageBase64,
      input.gender,
      input.label
    );

    if (result.success) {
      return {
        success: true,
        resultId: result.resultId,
        isNew: result.isNew,
        savedAt: new Date().toISOString(),
        imageUrl: result.imageUrl,
      };
    }

    return { success: false, error: result.error, isNew: false };
  } catch (error) {
    console.error('[autoSaveFaceReadingResult] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isNew: false,
    };
  }
}

/**
 * Check if user is authenticated (for showing login CTA)
 */
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  userId?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return {
      isAuthenticated: !!user,
      userId: user?.id,
    };
  } catch {
    return { isAuthenticated: false };
  }
}

/**
 * Save detail analysis to database
 */
export async function saveDetailAnalysis(input: {
  fingerprint: string;
  category: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('saju_detail_analyses')
      .upsert(
        {
          user_id: user.id,
          fingerprint: input.fingerprint,
          category: input.category,
          content: input.content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,fingerprint,category',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('[saveDetailAnalysis] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[saveDetailAnalysis] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get detail analysis from database
 */
export async function getDetailAnalysis(input: {
  fingerprint: string;
  category: string;
}): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('saju_detail_analyses')
      .select('content')
      .eq('user_id', user.id)
      .eq('fingerprint', input.fingerprint)
      .eq('category', input.category)
      .single();

    if (error) {
      // PGRST116 = no rows found, which is not an error
      if (error.code === 'PGRST116') {
        return { success: true, content: undefined };
      }
      console.error('[getDetailAnalysis] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, content: data?.content };
  } catch (error) {
    console.error('[getDetailAnalysis] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all detail analyses for a fingerprint
 */
export async function getAllDetailAnalyses(fingerprint: string): Promise<{
  success: boolean;
  analyses?: Record<string, string>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('saju_detail_analyses')
      .select('category, content')
      .eq('user_id', user.id)
      .eq('fingerprint', fingerprint);

    if (error) {
      console.error('[getAllDetailAnalyses] Error:', error);
      return { success: false, error: error.message };
    }

    const analyses: Record<string, string> = {};
    for (const row of data || []) {
      analyses[row.category] = row.content;
    }

    return { success: true, analyses };
  } catch (error) {
    console.error('[getAllDetailAnalyses] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 필수 상세보기 카테고리 (PipelineResult.tsx와 동일)
const PREREQUISITE_CATEGORIES = ['dayMaster', 'tenGods', 'stars', 'fortune'] as const;

/**
 * Check if user is eligible to view fortune (has completed all prerequisite detail analyses)
 * Returns eligibility status and the most recent saju result ID (shareId)
 */
export async function checkFortuneEligibility(): Promise<{
  eligible: boolean;
  shareId?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { eligible: false };
    }

    // Get most recent saju result for shareId
    const { data: results, error: resultError } = await supabase
      .from('saju_results')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (resultError || !results?.length) {
      return { eligible: false };
    }

    const shareId = results[0].id;

    // Get all detail analyses for this user
    const { data: analyses, error: analysesError } = await supabase
      .from('saju_detail_analyses')
      .select('fingerprint, category')
      .eq('user_id', user.id);

    if (analysesError || !analyses?.length) {
      return { eligible: false };
    }

    // Group by fingerprint
    const byFingerprint: Record<string, Set<string>> = {};
    for (const row of analyses) {
      if (!byFingerprint[row.fingerprint]) {
        byFingerprint[row.fingerprint] = new Set();
      }
      byFingerprint[row.fingerprint].add(row.category);
    }

    // Check if any fingerprint has all prerequisites completed
    for (const categories of Object.values(byFingerprint)) {
      if (PREREQUISITE_CATEGORIES.every(cat => categories.has(cat))) {
        return { eligible: true, shareId };
      }
    }

    return { eligible: false };
  } catch (error) {
    console.error('[checkFortuneEligibility] Error:', error);
    return { eligible: false };
  }
}
