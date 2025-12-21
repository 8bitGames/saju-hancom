import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackUsage } from '@/lib/supabase/usage';
import type { UsageActionType } from '@/lib/supabase/types';

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
    const { actionType, sajuResultId, metadata } = body as {
      actionType: UsageActionType;
      sajuResultId?: string;
      metadata?: any;
    };

    if (!actionType) {
      return NextResponse.json(
        { success: false, error: 'Missing action type' },
        { status: 400 }
      );
    }

    const result = await trackUsage(user.id, actionType, sajuResultId, metadata);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
