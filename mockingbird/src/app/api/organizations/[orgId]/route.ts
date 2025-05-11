import { db } from '@/index';
import { organizationsTable, organizationMembersTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';

// Helper to check if user is an admin of the org
async function isOrgAdmin(userId: string, orgId: number) {
  try {
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.user_id, userId),
          eq(organizationMembersTable.organization_id, orgId),
          eq(organizationMembersTable.role, 'admin')
        )
      );
    return !!membership;
  } catch (error) {
    console.error('[IS_ORG_ADMIN_ERROR]', error);
    return false;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { orgId } = await params;
    const orgIdNum = Number(orgId);
    if (isNaN(orgIdNum)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgIdNum));

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, org });
  } catch (error) {
    console.error('[GET_ORGANIZATION_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get organization' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { orgId } = await params;
    const orgIdNum = Number(orgId);
    if (isNaN(orgIdNum)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow org admins to update
    if (!(await isOrgAdmin(user.id, orgIdNum))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await req.json();

    const [org] = await db
      .update(organizationsTable)
      .set({ name, description })
      .where(eq(organizationsTable.id, orgIdNum))
      .returning();

    return NextResponse.json({ success: true, org });
  } catch (error) {
    console.error('[UPDATE_ORGANIZATION_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}