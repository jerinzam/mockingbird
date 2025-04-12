// src/app/api/interview-score/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { sessionId } = await request.json();

    // Validate sessionId
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Fetch from Supabase Edge Function
    const supabaseResponse = await fetch(
      'https://tbfnpyhazbqtvyazrjwd.supabase.co/functions/v1/interviewscoring-retriever', 
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "sessionId":sessionId })
      }
    );

    // Check if the response is ok
    if (!supabaseResponse.ok) {
      const errorData = await supabaseResponse.text();
      console.error('Supabase Error:', errorData);
      return NextResponse.json({ 
        error: errorData || 'Failed to fetch interview score' 
      }, { status: supabaseResponse.status });
    }

    // Parse and return the response
    const data = await supabaseResponse.json();
    return NextResponse.json(data);

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}