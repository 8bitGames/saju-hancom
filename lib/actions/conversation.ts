'use server';

import { createClient } from '@/lib/supabase/server';
import type { ConversationMessage } from '@/lib/voice/types';

export interface SaveConversationInput {
  contextType: 'saju' | 'compatibility' | 'faceReading';
  contextId?: string; // The result ID (saju_result.id, etc.)
  messages: ConversationMessage[];
}

export interface GetConversationInput {
  contextType: 'saju' | 'compatibility' | 'faceReading';
  contextId?: string;
}

/**
 * Save or update a unified conversation (text + voice)
 */
export async function saveConversation(input: SaveConversationInput): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
  savedAt?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Convert Date objects to ISO strings for JSONB storage
    const messagesForDb = input.messages.map(m => ({
      ...m,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }));

    // Try to find existing conversation for this context
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('context_type', input.contextType)
      .eq('context_id', input.contextId || '')
      .single();

    if (existing) {
      // Update existing conversation
      const { error } = await supabase
        .from('conversations')
        .update({
          messages: messagesForDb,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('[saveConversation] Update error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        conversationId: existing.id,
        savedAt: new Date().toISOString(),
      };
    } else {
      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          context_type: input.contextType,
          context_id: input.contextId || null,
          messages: messagesForDb,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('[saveConversation] Insert error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        conversationId: data?.id,
        savedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('[saveConversation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get conversation for a specific context
 */
export async function getConversation(input: GetConversationInput): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
  messages?: ConversationMessage[];
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('id, messages')
      .eq('user_id', user.id)
      .eq('context_type', input.contextType)
      .eq('context_id', input.contextId || '')
      .single();

    if (error) {
      // PGRST116 = no rows found
      if (error.code === 'PGRST116') {
        return { success: true, messages: [] };
      }
      console.error('[getConversation] Error:', error);
      return { success: false, error: error.message };
    }

    // Convert timestamps back to Date objects
    const messages: ConversationMessage[] = (data?.messages || []).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));

    return {
      success: true,
      conversationId: data?.id,
      messages,
    };
  } catch (error) {
    console.error('[getConversation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add a single message to an existing conversation
 */
export async function addMessageToConversation(input: {
  conversationId: string;
  message: ConversationMessage;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current messages
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', input.conversationId)
      .eq('user_id', user.id) // Security: ensure user owns this conversation
      .single();

    if (fetchError) {
      console.error('[addMessageToConversation] Fetch error:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Add new message
    const messages = existing?.messages || [];
    const messageForDb = {
      ...input.message,
      timestamp: input.message.timestamp instanceof Date
        ? input.message.timestamp.toISOString()
        : input.message.timestamp,
    };
    messages.push(messageForDb);

    // Update conversation
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        messages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.conversationId);

    if (updateError) {
      console.error('[addMessageToConversation] Update error:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[addMessageToConversation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all user's analyses for building full context
 * Returns saju, compatibility, and face reading results
 */
export async function getUserAnalysesContext(): Promise<{
  success: boolean;
  error?: string;
  analyses?: {
    saju?: any;
    compatibility?: {
      coworker?: any;
      love?: any;
    };
    faceReading?: any;
  };
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch all analyses in parallel
    const [sajuResult, compatibilityResults, faceReadingResult] = await Promise.all([
      // Get latest saju result
      supabase
        .from('saju_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Get compatibility results (both coworker and love)
      supabase
        .from('compatibility_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Get latest face reading result
      supabase
        .from('face_reading_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    // Organize compatibility by type
    let coworkerCompat = null;
    let loveCompat = null;
    if (compatibilityResults.data) {
      for (const result of compatibilityResults.data) {
        if (result.relation_type === 'coworker' && !coworkerCompat) {
          coworkerCompat = result;
        } else if (result.relation_type === 'love' && !loveCompat) {
          loveCompat = result;
        }
      }
    }

    return {
      success: true,
      analyses: {
        saju: sajuResult.data || undefined,
        compatibility: {
          coworker: coworkerCompat || undefined,
          love: loveCompat || undefined,
        },
        faceReading: faceReadingResult.data || undefined,
      },
    };
  } catch (error) {
    console.error('[getUserAnalysesContext] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
