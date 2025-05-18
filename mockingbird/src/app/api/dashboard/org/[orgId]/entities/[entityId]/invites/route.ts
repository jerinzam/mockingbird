import { createClient } from '@/utils/supabaseServer';
import { db } from '@/index';
import { invites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { organizationsTable } from '@/db/schema';

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

    const invitesData = await db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.entity_id, parseInt(entityId)),
        //   eq(invites.organization_id, org.id)
        )
      )
      .orderBy(invites.created_at);
    
    return NextResponse.json(invitesData);
  } catch (error) {
    console.error('[GET_ENTITY_INVITES_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string; entityId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { orgId, entityId } = await params;
    const body = await req.json();

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

    const { invites: invites_json } = body;
    
    const createdInvites = await Promise.all(
      invites_json.map(async (invite: { name?: string; email?: string; phone?: string }) => {
        const [created] = await db
          .insert(invites)
          .values({
            entity_id: parseInt(entityId),
            organization_id: org.id.toString(),
            invite_code: crypto.randomUUID(),
            name: invite.name || null,
            email: invite.email || null,
            phone: invite.phone || null,
            created_by: user.id
          })
          .returning();
        return created;
      })
    );

    return NextResponse.json(createdInvites);
  } catch (error) {
    console.error('[CREATE_ENTITY_INVITES_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}