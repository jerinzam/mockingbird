import { db } from '@/index';
import { interviewSessionTable, interviewTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET /api/interview/session/[session_uuid]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id: sessionUUID } = await params;

    if (!sessionUUID || typeof sessionUUID !== 'string') {
      return NextResponse.json({ error: 'Invalid session UUID' }, { status: 400 });
    }

    const token = req.nextUrl.searchParams.get('token');

    const result = await db
      .select({
        id: interviewSessionTable.id,
        session_uuid: interviewSessionTable.session_uuid,
        created_at: interviewSessionTable.created_at,
        interview_id: interviewSessionTable.interview_id,
        call_transcript: interviewSessionTable.call_transcript,
        call_started_time: interviewSessionTable.call_started_time,
        call_ended_time: interviewSessionTable.call_ended_time,
        call_ended_reason: interviewSessionTable.call_ended_reason,
        token: interviewSessionTable.token,
        interview: {
          id: interviewTable.id,
          title: interviewTable.title,
          domain: interviewTable.domain,
          seniority: interviewTable.seniority,
          duration: interviewTable.duration,
          description: interviewTable.description,
          key_skills: interviewTable.key_skills,
          is_public: interviewTable.is_public,
        }
      })
      .from(interviewSessionTable)
      .where(eq(interviewSessionTable.session_uuid, sessionUUID))
      .leftJoin(interviewTable, eq(interviewSessionTable.interview_id, interviewTable.id));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = result[0];

    if (!sessionData.interview || !sessionData.interview.is_public) {
      if (!token || token.toUpperCase() !== sessionData.token?.toUpperCase()) {
        return NextResponse.json({ error: 'Unauthorized access to private session' }, { status: 403 });
      }
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('[GET_SESSION_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
