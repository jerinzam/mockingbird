import { NextRequest } from 'next/server';
import { db } from '@/index'; // adjust path as needed
import { trainingEntitiesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trainingId: string }> }
) {
  const { trainingId } = await params;
  const id = Number(trainingId);
    if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid trainingId' }), { status: 400 });
    }


  try {
    // Fetch the training entity by its id
    const training = await db
      .select()
      .from(trainingEntitiesTable)
      .where(eq(trainingEntitiesTable.id, id))
      .limit(1);

    if (!training || training.length === 0) {
      return new Response(JSON.stringify({ error: 'Training not found' }), { status: 404 });
    }

    // Return the first (and only) result
    return new Response(JSON.stringify({ training: training[0] }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}