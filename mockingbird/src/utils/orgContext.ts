// src/utils/orgContext.ts
import { db } from '@/index';
import { organizationsTable, organizationMembersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/utils/supabaseServer';
import { NextResponse } from 'next/server';

export type OrgContext = {
  org: {
    id: number;
    name: string;
    slug: string;
    // Add other org fields as needed
  };
  user?: {
    id: string;
    email: string;
  };
};

export async function getOrgContext(orgSlug: string): Promise<{ context: OrgContext | null; error: NextResponse | null }> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        context: null, 
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
      };
    }

    // Get organization by slug
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, orgSlug));

    if (!org) {
      return { 
        context: null, 
        error: NextResponse.json({ error: 'Organization not found' }, { status: 404 }) 
      };
    }

    // Check if user is a member of the organization
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.user_id, user.id),
          eq(organizationMembersTable.organization_id, org.id)
        )
      );

    if (!membership) {
      return { 
        context: null, 
        error: NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 }) 
      };
    }

    return {
      context: {
        org,
        user: {
          id: user.id,
          email: user.email || ''
        }
      },
      error: null
    };
  } catch (error) {
    console.error('[GET_ORG_CONTEXT_ERROR]', error);
    return { 
      context: null, 
      error: NextResponse.json(
        { error: 'Failed to get organization context' },
        { status: 500 }
      )
    };
  }
}

export async function getPublicOrgContext(orgSlug: string): Promise<{ context: OrgContext | null; error: NextResponse | null }> {
    try {
      const [org] = await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.slug, orgSlug));
  
      if (!org) {
        return { 
          context: null, 
          error: NextResponse.json({ error: 'Organization not found' }, { status: 404 }) 
        };
      }
  
      return {
        context: {
          org,
          // No user context for public access
        },
        error: null
      };
    } catch (error) {
      console.error('[GET_PUBLIC_ORG_CONTEXT_ERROR]', error);
      return { 
        context: null, 
        error: NextResponse.json(
          { error: 'Failed to get organization context' },
          { status: 500 }
        )
      };
    }
  }