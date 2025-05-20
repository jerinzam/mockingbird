import { createClient } from '@/utils/supabaseServer';
import { db } from '@/index';
import { entitiesTable, entitySessionsTable, organizationsTable, organizationMembersTable } from '@/db/schema';
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

        // Check if user is a member of the organization
        const [membership] = await db
        .select()
        .from(organizationMembersTable)
        .where(
          and(
            eq(organizationMembersTable.user_id, user.id),
            eq(organizationMembersTable.organization_id, parseInt(orgId))
          )
        );
  
      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this organization' },
          { status: 403 }
        );
      }
  
      // Check if entity belongs to the organization
      const [entity] = await db
        .select()
        .from(entitiesTable)
        .where(
          and(
            eq(entitiesTable.id, parseInt(entityId)),
            eq(entitiesTable.organization_id, orgId)
          )
        );
  
      if (!entity) {
        return NextResponse.json(
          { error: 'Entity not found or does not belong to this organization' },
          { status: 404 }
        );
      }
  
    const sessions = await db
      .select()
      .from(entitySessionsTable)
      .where(
        and(
          eq(entitySessionsTable.entity_id, parseInt(entityId))
          
        )
      )
      .orderBy(entitySessionsTable.created_at);
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('[GET_ENTITY_SESSIONS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}