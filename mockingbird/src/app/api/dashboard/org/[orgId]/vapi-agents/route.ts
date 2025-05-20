import { db } from '@/index';
import { vapiAgentsTable, organizationsTable, organizationMembersTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await params;
    if (isNaN(Number(orgId))) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    // Get org by ID first
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, Number(orgId)));

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
          eq(organizationMembersTable.organization_id, Number(orgId))
        )
      );

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Get VAPI agents for the organization
    const agents = await db
      .select()
      .from(vapiAgentsTable)
      .where(eq(vapiAgentsTable.organization_id, orgId));

    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error('[GET_VAPI_AGENTS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get VAPI agents' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = Number(params.orgId);
    if (isNaN(orgId)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    // Get org by ID first
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId));

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
          eq(organizationMembersTable.organization_id, orgId)
        )
      );

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    const { name, vapi_agent_id, api_key } = await req.json();
    const [agent] = await db
      .insert(vapiAgentsTable)
      .values({
        organization_id: orgId.toString(),
        name,
        vapi_agent_id,
        api_key,
        created_at: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('[CREATE_VAPI_AGENT_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create VAPI agent' },
      { status: 500 }
    );
  }
}