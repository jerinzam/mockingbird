// src/app/api/entities/[id]/route.ts

import { db } from '@/index';
import { 
  entitiesTable, 
  interviewEntitiesTable, 
  trainingEntitiesTable,
  entityTypes,
  type Entity,
  type InterviewEntity,
  type TrainingEntity,
  invites
} from '@/db/schema';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { eq, and } from 'drizzle-orm';

type EntityWithDetails = Entity & {
    interview?: InterviewEntity;
    training?: TrainingEntity;
};

// src/app/api/entities/[id]/route.ts

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: entityId } = await params;
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (isNaN(parseInt(entityId))) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity ID' },
        { status: 400 }
      );
    }

    // Get base entity
    const [entity] = await db
      .select()
      .from(entitiesTable)
      .where(eq(entitiesTable.id, parseInt(entityId)));

    if (!entity) {
      return NextResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      );
    }

    // Check token validity for private entities
    let hasValidToken = false;
    if (entity.visibility === 'private' && token) {
      const [validToken] = await db
        .select()
        .from(invites)
        .where(
          and(
            eq(invites.entity_id, parseInt(entityId)),
            eq(invites.invite_code, token)
          )
        );
      hasValidToken = !!validToken;
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
      data: entityWithDetails,
      hasValidToken
    });

  } catch (err) {
    console.error('[GET_ENTITY_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to get entity' },
      { status: 500 }
    );
  }
}