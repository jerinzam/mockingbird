import { NextResponse } from 'next/server';
import { db } from '@/index';
import { interviewTable, interviewSessionTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface Body {
  interviewId: string;
  token?: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body and extract interview ID and optional token
    const { interviewId, token }: Body = await req.json();

    // Validate and parse the interview ID as a number
    const numericId = Number(interviewId);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid interview ID' }, { status: 400 });
    }

    // Fetch the interview details from DB
    const interviewRes = await db
      .select()
      .from(interviewTable)
      .where(eq(interviewTable.id, numericId));

    // Return 404 if the interview doesn't exist
    if (!interviewRes.length) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = interviewRes[0];

    // If the interview is private, validate the token
    if (!interview.is_public) {
      // Token is mandatory for private interviews
      if (!token) {
        return NextResponse.json({ error: 'Token required for private interview' }, { status: 403 });
      }

      // Check whether the token exists for the given interview
      const matchingTokenSession = await db
        .select()
        .from(interviewSessionTable)
        .where(eq(interviewSessionTable.token, token));

      // Validate token belongs to the correct interview
      const validToken = matchingTokenSession.find(
        (row) => row.interview_id === numericId
      );

      if (!validToken) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
      }

      // TODO: Extend here with optional token expiry / usage check
    }

    // Generate a backend UUID for this session (used on frontend for reference)
    const generatedUUID = uuidv4();

    // Insert a new interview session record into the DB
    const insertedRows = await db.insert(interviewSessionTable).values({
      session_uuid: generatedUUID,         // Public-safe identifier
      interview_id: numericId,     // Foreign key to interview
      
    }).returning({
      id: interviewSessionTable.id,
        session_uuid: interviewSessionTable.session_uuid,
    });

    // Return session UUID to client for redirection
    return NextResponse.json(
      { sessionId: insertedRows[0].session_uuid },
      { status: 201 }
    );

  } catch (err) {
    console.error('[CREATE_SESSION_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
