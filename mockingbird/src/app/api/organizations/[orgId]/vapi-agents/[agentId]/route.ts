import { db } from '@/index';
import { vapiAgentsTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';
import { isOrgAdmin } from '@/utils/checkOrgAdmin';

export async function DELETE(req: Request, { params }: { params: { orgId: string, agentId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = Number(params.orgId);
  if (!(await isOrgAdmin(user.id, orgId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const agentId = Number(params.agentId);
  await db.delete(vapiAgentsTable).where(eq(vapiAgentsTable.id, agentId));
  return NextResponse.json({ success: true });
}