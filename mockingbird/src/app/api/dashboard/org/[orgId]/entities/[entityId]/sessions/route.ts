import { createClient } from '@/utils/supabaseServer';
import { db } from '@/index';
import { entitySessionsTable, organizationsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getOrgContext } from '@/utils/orgContext';
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; entityId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { orgId, entityId } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

      // Get org by ID first
      const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, parseInt(orgId)));

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
  
    const sessions = await db
      .select()
      .from(entitySessionsTable)
      .where(
        and(
          eq(entitySessionsTable.entity_id, parseInt(entityId)),
          eq(entitySessionsTable.org_id, org.slug)
        )
      )
      .orderBy(entitySessionsTable.created_at);
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('[GET_ENTITY_SESSIONS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}