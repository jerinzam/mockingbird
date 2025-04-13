import { NextResponse } from 'next/server';
import { db } from '@/index';
import { interviewTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

// Correct type signature for dynamic route handlers in App Router
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const {id} = await params;
    const numericid = await Number(id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(interviewTable)
      .where(eq(interviewTable.id, numericid));

    if (!result.length) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[GET_INTERVIEW_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
