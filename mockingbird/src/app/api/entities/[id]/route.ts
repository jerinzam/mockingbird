// src/app/api/entities/[id]/route.ts

import { db } from '@/index';
import { 
  entitiesTable, 
  interviewEntitiesTable, 
  trainingEntitiesTable,
  entityTypes ,
  type Entity,
  type InterviewEntity,
  type TrainingEntity
} from '@/db/schema';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { eq } from 'drizzle-orm';

type EntityWithDetails = Entity & {
    interview?: InterviewEntity;
    training?: TrainingEntity;
  };

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entityId = parseInt(params.id);
    if (isNaN(entityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity ID' },
        { status: 400 }
      );
    }

    // Get base entity
    const [entity] = await db
      .select()
      .from(entitiesTable)
      .where(eq(entitiesTable.id, entityId));

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
      entityWithDetails =  { ...entity, interview } as EntityWithDetails;
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