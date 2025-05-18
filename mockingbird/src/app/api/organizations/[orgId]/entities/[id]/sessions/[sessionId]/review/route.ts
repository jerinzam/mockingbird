// src/app/api/organizations/[orgId]/entities/[id]/sessions/[sessionId]/review/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string; sessionId: string }> }
) {
  try {
    const { orgId, id: entityId, sessionId } = await params;

    // Validate params
    if (!sessionId || !entityId || !orgId) {
      return NextResponse.json({ 
        error: 'Session ID, Entity ID, and Organization ID are required' 
      }, { status: 400 });
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
          orgId
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
    const data = await supabaseResponse.json();
    return NextResponse.json({ review: data });

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