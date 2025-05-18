import { db } from '@/index';
import { 
  entitiesTable, 
  interviewEntitiesTable, 
  trainingEntitiesTable, 
  entityTypes,
  entityStatus,
  entityVisibility 
} from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as typeof entityTypes[number] | null;
    const status = searchParams.get('status') as typeof entityStatus[number] | null;
    const visibility = searchParams.get('visibility') as typeof entityVisibility[number] | null;
    const {orgId} = await params;
    // Build where conditions
    const conditions = [eq(entitiesTable.organization_id, orgId)];
    
    if (type && entityTypes.includes(type)) {
      conditions.push(eq(entitiesTable.type, type));
    }
    if (status && entityStatus.includes(status)) {
      conditions.push(eq(entitiesTable.status, status));
    }
    if (visibility && entityVisibility.includes(visibility)) {
      conditions.push(eq(entitiesTable.visibility, visibility));
    }

    // Get entities with their type-specific data
    const query = db
      .select()
      .from(entitiesTable)
      .orderBy(entitiesTable.created_at);

    const entities = await query.where(and(...conditions));

    // Get type-specific data
    const entitiesWithDetails = await Promise.all(
      entities.map(async (entity) => {
        if (entity.type === 'interview') {
          const [interview] = await db
            .select()
            .from(interviewEntitiesTable)
            .where(eq(interviewEntitiesTable.entity_id, entity.id));
          return { ...entity, interview };
        }
        if (entity.type === 'training') {
          const [training] = await db
            .select()
            .from(trainingEntitiesTable)
            .where(eq(trainingEntitiesTable.entity_id, entity.id));
          return { ...entity, training };
        }
        return entity;
      })
    );

    return NextResponse.json({
      success: true,
      data: entitiesWithDetails
    });

  } catch (err) {
    console.error('[LIST_ENTITIES_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to list entities' },
      { status: 500 }
    );
  }
}