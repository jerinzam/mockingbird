// src/app/api/entities/create/route.ts

import { db } from '@/index';
import { entitiesTable, interviewEntitiesTable, trainingEntitiesTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';

export async function POST(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { orgId: organization_id } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      type,
      title,
      description,
      // Common fields
      ...commonFields
    } = body;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create base entity
      const [entity] = await tx.insert(entitiesTable).values({
        type,
        title,
        description,
        organization_id,
        created_by: user.id,
        ...commonFields
      }).returning();

      // 2. Create type-specific entity
      if (type === 'interview') {
        const { domain, seniority, key_skills, duration } = body;
        const [interviewEntity] = await tx.insert(interviewEntitiesTable).values({
          entity_id: entity.id,
          domain,
          seniority,
          key_skills,
          duration
        }).returning();
        return { ...entity, interview: interviewEntity };
      } 
      
      if (type === 'training') {
        const { 
          category, 
          difficulty_level, 
          prerequisites, 
          learning_objectives, 
          estimated_completion_time 
        } = body;
        const [trainingEntity] = await tx.insert(trainingEntitiesTable).values({
          entity_id: entity.id,
          category,
          difficulty_level,
          prerequisites,
          learning_objectives,
          estimated_completion_time
        }).returning();
        return { ...entity, training: trainingEntity };
      }

      throw new Error('Invalid entity type');
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('[CREATE_ENTITY_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create entity' },
      { status: 500 }
    );
  }
}