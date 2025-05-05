import { NextResponse } from 'next/server';
import { db } from '@/index';
import { interviewTable, interviewSessionTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;
    const interviewId = Number(id);

    if (Number.isNaN(interviewId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Fetch interview
    const interviews = await db
      .select()
      .from(interviewTable)
      .where(eq(interviewTable.id, interviewId));

    if (!interviews.length) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = interviews[0];

    // If interview is private, validate the token
    if (!interview.is_public) {
      const token = req.nextUrl.searchParams.get('token');

      if (!token) {
        return NextResponse.json({ error: 'Token required for private interview' }, { status: 403 });
      }

      // Validate token exists for the given interview
      const sessions = await db
        .select()
        .from(interviewSessionTable)
        .where(
          and(
            eq(interviewSessionTable.token, token.toUpperCase()),
            eq(interviewSessionTable.interview_id, interviewId)
          )
        );

      if (!sessions.length) {
        return NextResponse.json({ error: 'Invalid or unauthorized token' }, { status: 403 });
      }
    }

    // Return interview data if public or authorized
    return NextResponse.json(interview);
  } catch (error) {
    console.error('[GET_INTERVIEW_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
