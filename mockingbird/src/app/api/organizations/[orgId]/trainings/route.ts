import { db } from '@/index';
import { entitiesTable, trainingEntitiesTable } from '@/db/schema';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { eq, and } from 'drizzle-orm';
import { getOrgContext,getPublicOrgContext } from '@/utils/orgContext';


export async function GET(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
  ) {
    const { orgId: orgSlug } = await params;
    const { context, error } = await getPublicOrgContext(orgSlug);
    
    if (error) return error;
    if (!context) return NextResponse.json({ error: 'Failed to get context' }, { status: 500 });
  
    try {
      const trainings = await db
        .select()
        .from(entitiesTable)
        .innerJoin(
          trainingEntitiesTable,
          eq(trainingEntitiesTable.entity_id, entitiesTable.id)
        )
        .where(
          and(
            eq(entitiesTable.type, 'training'),
            eq(entitiesTable.organization_id, context.org.id.toString())
          )
        );
  
      return NextResponse.json({ success: true, data: trainings });
    } catch (error) {
      console.error('[GET_TRAININGS_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get trainings' },
        { status: 500 }
      );
    }
  }

//   export async function POST(
//     req: Request,
//     { params }: { params: { orgId: string } }
//   ) {
//     const { orgId: orgSlug } = params;
//     const { context, error } = await getOrgContext(orgSlug);
    
//     if (error) return error;
//     if (!context) return NextResponse.json({ error: 'Failed to get context' }, { status: 500 });
  
//     try {
//       const body = await req.json();
//       const { title, description, category, difficulty_level, prerequisites, learning_objectives, estimated_completion_time } = body;
  
//       const result = await db.transaction(async (tx) => {
//         const [entity] = await tx.insert(entitiesTable).values({
//           type: 'training',
//           title,
//           description,
//           organization_id: context.org.id.toString(), // Use context.org.id instead of params.orgId
//           created_by: context.user?.id, // Use context.user.id instead of user.id
//         }).returning();
  
//         const [training] = await tx.insert(trainingEntitiesTable).values({
//           entity_id: entity.id,
//           category,
//           difficulty_level,
//           prerequisites,
//           learning_objectives,
//           estimated_completion_time
//         }).returning();
  
//         return { ...entity, training };
//       });
  
//       return NextResponse.json({ success: true, data: result });
//     } catch (error) {
//       console.error('[CREATE_TRAINING_ERROR]', error);
//       return NextResponse.json(
//         { success: false, error: 'Failed to create training' },
//         { status: 500 }
//       );
//     }
//   }