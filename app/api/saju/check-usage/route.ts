import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUsageLimit } from '@/lib/supabase/usage';
import type { UsageActionType } from '@/lib/supabase/types';

// TEMPORARY: Disable usage limits for testing
const DISABLE_USAGE_LIMITS = true;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { actionType } = body as { actionType: UsageActionType };

    if (!actionType) {
      return NextResponse.json(
        { success: false, error: 'Missing action type' },
        { status: 400 }
      );
    }

    // TEMPORARY: Skip limit check during testing
    if (DISABLE_USAGE_LIMITS) {
      return NextResponse.json({
        allowed: true,
        count: 0,
        limit: 999,
      });
    }

    const result = await checkUsageLimit(user.id, actionType);

    return NextResponse.json({
      allowed: result.allowed,
      count: result.count,
      limit: result.limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
