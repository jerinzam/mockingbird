import { db } from '@/index';
import { organizationMembersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function isOrgAdmin(userId: string, orgId: number) {
  console.log("XXXXXXXXisOrgAdmin")
  const [membership] = await db
    .select()
    .from(organizationMembersTable)
    .where(
      eq(organizationMembersTable.user_id, userId) &&
      eq(organizationMembersTable.organization_id, orgId) &&
      eq(organizationMembersTable.role, 'admin')
    );
  return !!membership;
}