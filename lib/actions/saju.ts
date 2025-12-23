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
