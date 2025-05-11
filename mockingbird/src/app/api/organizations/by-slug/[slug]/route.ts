import { db } from '@/index';
import { organizationsTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, slug));

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, org });
  } catch (error) {
    console.error('[GET_ORGANIZATION_BY_SLUG_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get organization by slug' },
      { status: 500 }
    );
  }
}