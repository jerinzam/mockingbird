import { db } from '@/index';
import { 
  entitiesTable, 
  interviewEntitiesTable, 
  trainingEntitiesTable, 
  entityTypes,
  entityStatus,
  entityVisibility 
} from '@/db/schema';
import { organizationsTable } from '@/db/schema'; // Add this import
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
// import { createClient } from '@/utils/supabaseServer'; // Auth client (commented)
// import { getServerSession } from 'next-auth'; // Auth session (commented)

export async function GET(req: Request) {
  try {
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();

    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as typeof entityTypes[number] | null;
    const organization_slug = searchParams.get('organization_slug');
    const status = searchParams.get('status') as typeof entityStatus[number] | null;
    const visibility = searchParams.get('visibility') as typeof entityVisibility[number] | null;

    let organization_id: string | undefined = undefined;

    // If slug is provided, look up org ID
    if (organization_slug) {
      const [org] = await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.slug, organization_slug));
      if (!org) {
        return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
      }
      organization_id = org.id.toString();
    }

    // Build where conditions
    const conditions = [];
    if (type && entityTypes.includes(type)) {
      conditions.push(eq(entitiesTable.type, type));
    }
    if (organization_id) {
      conditions.push(eq(entitiesTable.organization_id, organization_id));
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

    // Only add where clause if we have conditions
    const entities = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

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