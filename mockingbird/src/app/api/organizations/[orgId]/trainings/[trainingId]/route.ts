// src/app/api/organizations/[orgId]/trainings/[trainingId]/route.ts
import { db } from '@/index';
import { entitiesTable, trainingEntitiesTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { getPublicOrgContext } from '@/utils/orgContext';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; trainingId: string }> }
) {
  const { orgId: orgSlug, trainingId } = await params;
  const { context, error } = await getPublicOrgContext(orgSlug);
  
  if (error) return error;
  if (!context) return NextResponse.json({ error: 'Failed to get context' }, { status: 500 });

  try {
    const [training] = await db
      .select()
      .from(entitiesTable)
      .innerJoin(
        trainingEntitiesTable,
        eq(trainingEntitiesTable.entity_id, entitiesTable.id)
      )
      .where(
        and(
          eq(entitiesTable.id, Number(trainingId)),
          eq(entitiesTable.type, 'training'),
          eq(entitiesTable.organization_id, context.org.id.toString())
        )
      );

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: training });
  } catch (error) {
    console.error('[GET_TRAINING_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get training' },
      { status: 500 }
    );
  }
}