import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/index';
import { entitySessionsTable, entitiesTable, invites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: entityId, sessionId } = await params;
    const token = request.nextUrl.searchParams.get('token');

    // Validate params
    if (!sessionId || !entityId) {
      return NextResponse.json({ 
        error: 'Session ID and Entity ID are required' 
      }, { status: 400 });
    }

    // Get the session and entity data
    const [sessionData] = await db
      .select({
        session: entitySessionsTable,
        entity: entitiesTable
      })
      .from(entitySessionsTable)
      .where(
        and(
          eq(entitySessionsTable.session_uuid, sessionId),
          eq(entitySessionsTable.entity_id, parseInt(entityId, 10))
        )
      )
      .leftJoin(entitiesTable, eq(entitySessionsTable.entity_id, entitiesTable.id));

    if (!sessionData) {
      return NextResponse.json({ 
        error: 'Session not found' 
      }, { status: 404 });
    }

    if (!sessionData.entity) {
      return NextResponse.json({ 
        error: 'Entity not found' 
      }, { status: 404 });
    }

    // Check if entity is private and validate token if provided
    let hasValidToken = true;
    if (sessionData.entity.visibility === 'private') {
      if (!token) {
        hasValidToken = false;
      } else {
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
    }

    // Fetch from Supabase Edge Function
    const supabaseResponse = await fetch(
      'https://tbfnpyhazbqtvyazrjwd.supabase.co/functions/v1/session-scoring-retriever-v2', 
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId,
          entityId,
          orgId: sessionData.session.org_id
        })
      }
    );

    // Check if the response is ok
    if (!supabaseResponse.ok) {
      const errorData = await supabaseResponse.text();
      console.error('Supabase Error:', errorData);
      return NextResponse.json({ 
        error: errorData || 'Failed to fetch session review' 
      }, { status: supabaseResponse.status });
    }

    // Parse and return the response
    const reviewData = await supabaseResponse.json();
    return NextResponse.json({ 
      success: true,
      data: {
        review: reviewData,
        entity: sessionData.entity,
        session: sessionData.session
      },
      hasValidToken
    });

  } catch (error) {
    console.error('API Route Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Enable CORS for this route
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}