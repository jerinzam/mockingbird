// app/api/interview/route.ts
import { createClient } from '@/utils/supabaseServer';
import { db } from '@/index';
import { interviewTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'public' or 'user'
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // For user's interviews, require authentication
    if (scope === 'user') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const interviews = await db
        .select()
        .from(interviewTable)
        .where(eq(interviewTable.owner, user.id))
        .orderBy(interviewTable.created_at);
      
      return NextResponse.json(interviews);
    }
    
    // For public interviews, no auth required
    const publicInterviews = await db
      .select()
      .from(interviewTable)
      .where(eq(interviewTable.is_public, true))
      .orderBy(interviewTable.created_at);
    
    return NextResponse.json(publicInterviews);
  } catch (error) {
    console.error('[GET_INTERVIEWS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}