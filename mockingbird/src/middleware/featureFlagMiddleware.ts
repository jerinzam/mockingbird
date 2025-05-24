// src/middleware/featureFlagMiddleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { db } from '@/index';
import { organizationsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

type FeatureFlags = {
    [key: string]: {
      is_enabled: boolean;
    };
  };

// Define protected routes and their required feature flags
const PROTECTED_ROUTES = {
  '/dashboard/organizations/[orgId]/entities/create': 'interview_creator',
  '/dashboard/organizations/[orgId]/entities/create/*': 'interview_creator',
  '/dashboard/entities/create': 'interview_creator',
  // Add more routes and their required feature flags
} as const;

export async function checkFeatureFlag(req: NextRequest, orgId: string, featureFlag: string) {
    try {
      const [org] = await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, parseInt(orgId)));
  
      if (!org) {
        console.log('Organization not found:', orgId);
        return false;
      }
  
      console.log('Feature flags from DB:', org.feature_flags);
      console.log('Checking flag:', featureFlag);
      
      const isEnabled = (org.feature_flags as FeatureFlags)?.[featureFlag]?.is_enabled ?? 
          FEATURE_FLAGS[featureFlag as keyof typeof FEATURE_FLAGS].defaultEnabled;
      
      console.log('Is feature enabled:', isEnabled);
      return isEnabled;
    } catch (error) {
      console.error('Feature flag check error:', error);
      return false;
    }
  }

export async function featureFlagMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip processing for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt')
  ) {
    return null;
  }

  // Check if the current path matches any protected route
  const matchedRoute = Object.entries(PROTECTED_ROUTES).find(([route]) => {
    const pattern = route.replace(/\[.*?\]/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(pathname);
  });

  if (!matchedRoute) {
    return null;
  }

  const [_, requiredFeatureFlag] = matchedRoute;
  
  // Extract organization ID from the URL
  const orgIdMatch = pathname.match(/\/organizations\/(\d+)/);
  const orgId = orgIdMatch?.[1];

  if (!orgId) {
    return NextResponse.redirect(new URL('/dashboard?error=Organization not found', req.url));
  }

  const isFeatureEnabled = await checkFeatureFlag(req, orgId, requiredFeatureFlag);

  if (!isFeatureEnabled) {
    const url = new URL('/dashboard', req.url);
    url.searchParams.set('error', FEATURE_FLAGS[requiredFeatureFlag as keyof typeof FEATURE_FLAGS].disabledMessage);
    return NextResponse.redirect(url);
  }

  return null;
}