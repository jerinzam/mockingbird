// src/app/api/entities/[id]/route.ts

import { db } from '@/index';
import { 
  entitiesTable, 
  interviewEntitiesTable, 
  trainingEntitiesTable,
  entityTypes,
  organizationMembersTable,
  type Entity,
  type InterviewEntity,
  type TrainingEntity
} from '@/db/schema';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { eq, and } from 'drizzle-orm';

type EntityWithDetails = Entity & {
  interview?: InterviewEntity;
  training?: TrainingEntity;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string, entityId: string }> }
) {
  try {
    const supabase = await createClient();
    const { orgId, entityId } = await params;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // const orgId = parseInt(params.orgId);
    // const entityId = parseInt(params.entityId);
    
    if (isNaN(parseInt(orgId)) || isNaN(parseInt(entityId))) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization or entity ID' },
        { status: 400 }
      );
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
        { success: false, error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Get base entity and verify it belongs to the organization
    const [entity] = await db
      .select()
      .from(entitiesTable)
      .where(
        and(
          eq(entitiesTable.id, parseInt(entityId)),
          eq(entitiesTable.organization_id, orgId.toString())
        )
      );

    if (!entity) {
      return NextResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      );
    }

    // Get type-specific data
    let entityWithDetails = { ...entity };
    if (entity.type === 'interview' as typeof entityTypes[number]) {
      const [interview] = await db
        .select()
        .from(interviewEntitiesTable)
        .where(eq(interviewEntitiesTable.entity_id, entity.id));
      entityWithDetails = { ...entity, interview } as EntityWithDetails;
    }
    if (entity.type === 'training' as typeof entityTypes[number]) {
      const [training] = await db
        .select()
        .from(trainingEntitiesTable)
        .where(eq(trainingEntitiesTable.entity_id, entity.id));
      entityWithDetails = { ...entity, training } as EntityWithDetails;
    }

    return NextResponse.json({
      success: true,
      data: entityWithDetails
    });

  } catch (err) {
    console.error('[GET_ENTITY_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to get entity' },
      { status: 500 }
    );
  }
}