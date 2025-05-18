// src/app/api/entities/[id]/sessions/start/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';
import { sessionUtils } from '@/utils/session';
interface SessionMetadata {
    type?: string;
    [key: string]: any;
  }
  
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; orgId: string }> }
) {
  try {
    const { id, orgId } = await params;
    const supabase = await createClient();
    const body = await req.json();

    // Get organization context
    const context = await sessionUtils.getOrgContext(orgId);

    // Validate entity
    // const entity = await sessionUtils.validateEntity(Number(id));

    // Check for active session
    // const activeSession = await sessionUtils.getActiveSession(
    //   Number(id),
    //   context.user?.id
    // );

    // if (activeSession) {
    //   return NextResponse.json({
    //     success: true,
    //     data: {
    //       sessionId: activeSession.session_uuid,
    //       type: (activeSession.metadata as SessionMetadata)?.type || 'unknown',
    //       metadata: activeSession.metadata,
    //       redirectUrl: `/entities/${id}/sessions/${activeSession.session_uuid}`
    //     }
    //   });
    // }

    // Create new session
    const session = await sessionUtils.createSession(
      Number(id),
      orgId,
      context.user?.id,
      body.token,
      body.metadata
    );
    
    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId: session.session_uuid,
          type: (session.metadata as SessionMetadata)?.type || 'unknown',
          metadata: session.metadata
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to start session:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to start session' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string; orgId: string } }
) {
  try {
    const supabase = await createClient();
    const context = await sessionUtils.getOrgContext(params.orgId);
    const token = new URL(req.url).searchParams.get('token');

    const { data: session, error } = await supabase
      .from('entity_sessions')
      .select('*')
      .eq('entity_id', Number(params.id))
      .eq(context.user ? 'user_id' : 'token', context.user ? context.user.id : token)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { success: false, error: 'No active session found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.session_uuid,
        type: session.metadata?.type,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Failed to get session status:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get session status' },
      { status: 500 }
    );
  }
}