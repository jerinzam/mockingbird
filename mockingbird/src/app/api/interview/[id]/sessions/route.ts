// app/api/interview/[interviewId]/sessions/route.ts

import { db } from '@/index';
import { interviewSessionTable, interviewTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

import { createClient } from '@/utils/supabaseServer';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {

    const { id } = await params;
    const interviewId = Number(id);
    if (!interviewId || isNaN(interviewId)) {
      return NextResponse.json({ error: 'Invalid interview ID' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interview = await db
      .select({ owner: interviewTable.owner })
      .from(interviewTable)
      .where(eq(interviewTable.id, interviewId));

    if (!interview.length) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    if (interview[0].owner !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }


    const sessions = await db
      .select({
        id: interviewSessionTable.id,
        session_uuid: interviewSessionTable.session_uuid,
        created_at: interviewSessionTable.created_at,
        call_ended_reason: interviewSessionTable.call_ended_reason,
        interview_role_id: interviewSessionTable.interview_id,
      })
      .from(interviewSessionTable)
      .where(eq(interviewSessionTable.interview_id, interviewId));

    return NextResponse.json(sessions);
  } catch (err) {
    console.error('[GET_SESSIONS_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
