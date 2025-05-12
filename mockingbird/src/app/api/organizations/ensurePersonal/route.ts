// mockingbird/src/app/api/organizations/ensurePersonal/route.ts

import { db } from '@/index';
import { organizationsTable, organizationMembersTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { eq,and } from 'drizzle-orm';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Checking user in ensurePerson",user)
    if (!user || !user.email) {
        return NextResponse.json({ error: 'Unauthorized or missing email' }, { status: 401 });
      }

    // Check if user already has a personal org
    const [existingOrg] = await db
    .select()
    .from(organizationsTable)
    .innerJoin(
      organizationMembersTable,
      eq(organizationMembersTable.organization_id, organizationsTable.id)
    )
    .where(
      and(
        eq(organizationMembersTable.user_id, user.id),
        eq(organizationsTable.type, 'personal'),
        eq(organizationMembersTable.role, 'admin')
      )
    );
    console.log("existing org",existingOrg)
    if (existingOrg) {
      return NextResponse.json({ success: true, org: existingOrg });
    }

    // Generate a unique slug, e.g. from email or uuid
    const slug = user.email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '-' + Date.now();

    // Create new personal org
    const [org] = await db.insert(organizationsTable).values({
      name: user.email + "'s Personal Org",
      slug,
      type: 'personal',
      created_at: new Date(),
    }).returning();

    // Add user as admin/member
    await db.insert(organizationMembersTable).values({
        organization_id: org.id,
        user_id: user.id,
        role: 'admin',
        is_active: true,
        is_default: true,
        // created_at and updated_at will default
      });

    return NextResponse.json({ success: true, org });
  } catch (err) {
    console.error('[ENSURE_PERSONAL_ORG_ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to ensure personal org' }, { status: 500 });
  }
}