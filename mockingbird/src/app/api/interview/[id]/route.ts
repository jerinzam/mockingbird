import { NextResponse } from 'next/server';
import { db } from '@/index';
import { interviewTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Required for dynamic route handlers in app directory
export async function GET(
  _req: Request,
  { params }: { params: Record<'id', string> }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(interviewTable)
      .where(eq(interviewTable.id, id));

    if (!result.length) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[GET_INTERVIEW_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
