// src/app/api/organizations/[orgId]/entities/[id]/sessions/[sessionId]/route.ts
import { db } from '@/index';
import { entitySessionsTable, entitiesTable, interviewEntitiesTable, trainingEntitiesTable, vapiAgentsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOrgContext } from '@/utils/orgContext';

type SessionData = {
  id: number;
  session_uuid: string;
  created_at: Date;
  entity_id: number;
  call_transcript: string | null;
  call_started_time: Date | null;
  call_ended_time: Date | null;
  call_ended_reason: string | null;
  token: string | null;
  status: string;
  metadata: any;
  entity: {
    id: number;
    type: 'interview' | 'training';
    title: string;
    description: string | null;
    status: string;
    visibility: string;
    vapi_agent_id: number | null;
    vapi_agent?: {
      id: number;
      name: string;
      vapi_agent_id: string;
      api_key: string;
    } | null;
    interview?: any;
    training?: any;
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string; sessionId: string }> }
) {
  try {
    const { orgId, id: entityId, sessionId: sessionUUID } = await params;


    if (!sessionUUID || typeof sessionUUID !== 'string') {
      return NextResponse.json({ error: 'Invalid session UUID' }, { status: 400 });
    }

    const token = req.nextUrl.searchParams.get('token');
    console.log("TESTTTTTT",orgId,sessionUUID,entityId);
    // First get the session with entity
    const sessionResult = await db
    .select({
      id: entitySessionsTable.id,
      session_uuid: entitySessionsTable.session_uuid,
      created_at: entitySessionsTable.created_at,
      entity_id: entitySessionsTable.entity_id,
      call_transcript: entitySessionsTable.call_transcript,
      call_started_time: entitySessionsTable.call_started_time,
      call_ended_time: entitySessionsTable.call_ended_time,
      call_ended_reason: entitySessionsTable.call_ended_reason,
      token: entitySessionsTable.token,
      status: entitySessionsTable.status,
      metadata: entitySessionsTable.metadata,
      entity: {
        ...entitiesTable,
        vapi_agent: vapiAgentsTable
      }
    })
    .from(entitySessionsTable)
    .where(
      and(
        eq(entitySessionsTable.session_uuid, sessionUUID),
        eq(entitySessionsTable.org_id, orgId),
        eq(entitySessionsTable.entity_id, parseInt(entityId, 10))
      )
    )
    .leftJoin(entitiesTable, eq(entitySessionsTable.entity_id, entitiesTable.id))
    .leftJoin(vapiAgentsTable, eq(entitiesTable.vapi_agent_id, vapiAgentsTable.id));
    
    if (sessionResult.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionResult[0] as SessionData;

    if (!sessionData.entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Then get the type-specific data
    if (sessionData.entity.type === 'interview') {
      const [interviewData] = await db
        .select()
        .from(interviewEntitiesTable)
        .where(eq(interviewEntitiesTable.entity_id, sessionData.entity_id));
      sessionData.entity.interview = interviewData;
    } else if (sessionData.entity.type === 'training') {
      const [trainingData] = await db
        .select()
        .from(trainingEntitiesTable)
        .where(eq(trainingEntitiesTable.entity_id, sessionData.entity_id));
      sessionData.entity.training = trainingData;
    }

    // Check visibility and token for private entities
    // if (sessionData.entity.visibility === 'private') {
    //   if (!token || token.toUpperCase() !== sessionData.token?.toUpperCase()) {
    //     return NextResponse.json({ error: 'Unauthorized access to private session' }, { status: 403 });
    //   }
    // }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('[GET_SESSION_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}