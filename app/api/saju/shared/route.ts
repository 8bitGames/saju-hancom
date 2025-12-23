import { NextRequest, NextResponse } from 'next/server';
import { getSajuResultById } from '@/lib/supabase/usage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing result ID' },
        { status: 400 }
      );
    }

    const result = await getSajuResultById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result: result.result,
    });
  } catch (error: any) {
    console.error('[Shared Result API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
