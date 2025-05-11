import { db } from '@/index';
import { organizationsTable, organizationMembersTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';

export async function GET() {
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Find the user's default org
  const [membership] = await db
    .select()
    .from(organizationMembersTable)
    .where(
      and(
        eq(organizationMembersTable.user_id, user.id),
        eq(organizationMembersTable.is_default, true)
      )
    );

  if (!membership) {
    return NextResponse.json({ error: 'No default org found' }, { status: 404 });
  }

  // Fetch the org details
  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, membership.organization_id));

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json({ org });
}