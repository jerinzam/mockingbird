// File: app/api/interview/[interviewId]/invites/route.ts

import { db } from '@/index';
import { invites, interviewTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';
import { NextResponse, type NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(
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

    const body = await req.json();
    const { invites: inputInvites } = body;

    if (!Array.isArray(inputInvites)) {
      return NextResponse.json({ error: 'Invalid invites array' }, { status: 400 });
    }

    const now = new Date();
    const records = inputInvites.map((input: any) => ({
      created_by: user.id,
      name: input.name || null,
      email: input.email || null,
      phone: input.phone || null,
      invite_code: nanoid(8),
      interview_id: interviewId,
      created_at: now,
      updated_at: now,
    }));

    const inserted = await db.insert(invites).values(records).returning();
    return NextResponse.json(inserted);
  } catch (err) {
    console.error('[CREATE_INVITES_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

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

    const rows = await db
      .select()
      .from(invites)
      .where(eq(invites.interview_id, interviewId));

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[GET_INVITES_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

