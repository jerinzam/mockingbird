// src/utils/session.ts
import { createClient } from '@/utils/supabaseServer';
import { db } from '@/index';
import { entitySessionsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface SessionStartRequest {
  token?: string;
  metadata?: Record<string, any>;
}

export interface SessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    type: string;
    metadata: Record<string, any>;
  };
  error?: string;
}

export const sessionUtils = {
  // Get organization context
  async getOrgContext(orgSlug: string) {
    const supabase = await createClient();
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', orgSlug)
      .single();

    if (orgError || !org) {
      throw new Error('Organization not found');
    }

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      throw new Error('Authentication error');
    }

    return {
      org,
      user: session?.user
    };
  },

  // Validate entity exists
  async validateEntity(entityId: number) {
    const [entity] = await db
      .select()
      .from(entitySessionsTable)
      .where(eq(entitySessionsTable.entity_id, entityId));

    if (!entity) {
      throw new Error('Entity not found');
    }

    return entity;
  },

  // Check for active session
  async getActiveSession(entityId: number, userId?: string) {
    if (!userId) return null;

    const [activeSession] = await db
      .select()
      .from(entitySessionsTable)
      .where(
        and(
          eq(entitySessionsTable.entity_id, entityId),
          eq(entitySessionsTable.user_id, userId),
          eq(entitySessionsTable.status, 'in_progress')
        )
      );

    return activeSession;
  },

  // Create new session
  async createSession(entityId: number, orgId: string, userId?: string, token?: string, metadata: Record<string, any> = {}) {
    const [session] = await db
      .insert(entitySessionsTable)
      .values({
        entity_id: entityId,
        session_uuid: uuidv4(),
        status: 'created',
        user_id: userId,
        token,
        org_id: orgId,
        metadata: {
          started_at: new Date().toISOString(),
          ...metadata
        }
      })
      .returning();

    return session;
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: 'in_progress' | 'completed' | 'cancelled') {
    const [updatedSession] = await db
      .update(entitySessionsTable)
      .set({ 
        status,
        updated_at: new Date(),
        ...(status === 'completed' && { ended_at: new Date() })
      })
      .where(eq(entitySessionsTable.session_uuid, sessionId))
      .returning();

    return updatedSession;
  },

  // Update call details
  async updateCallDetails(sessionId: string, details: {
    transcript?: string;
    started_time?: Date;
    ended_time?: Date;
    ended_reason?: string;
  }) {
    const [updatedSession] = await db
      .update(entitySessionsTable)
      .set({
        call_transcript: details.transcript,
        call_started_time: details.started_time,
        call_ended_time: details.ended_time,
        call_ended_reason: details.ended_reason,
        updated_at: new Date()
      })
      .where(eq(entitySessionsTable.session_uuid, sessionId))
      .returning();

    return updatedSession;
  }
};