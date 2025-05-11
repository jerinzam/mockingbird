import { db } from '@/index';
import { vapiAgentsTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';
import { isOrgAdmin } from '@/utils/checkOrgAdmin';

export async function GET(req: Request, { params }: { params: { orgId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = Number(params.orgId);
  if (!(await isOrgAdmin(user.id, orgId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const agents = await db
    .select()
    .from(vapiAgentsTable)
    .where(eq(vapiAgentsTable.organization_id, orgId));
  return NextResponse.json({ success: true, agents });
}

export async function POST(req: Request, { params }: { params: { orgId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = Number(params.orgId);
  if (!(await isOrgAdmin(user.id, orgId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, vapi_agent_id, api_key } = await req.json();
  const [agent] = await db.insert(vapiAgentsTable).values({
    organization_id: orgId,
    name,
    vapi_agent_id,
    api_key,
    created_at: new Date(),
  }).returning();

  return NextResponse.json({ success: true, agent });
}