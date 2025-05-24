// src/app/api/feature-flags/check/route.ts
import { db } from '@/index';
import { organizationsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type FeatureFlags = {
    [key: string]: {
      is_enabled: boolean;
    };
  };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const featureFlag = searchParams.get('featureFlag');

  if (!orgId || !featureFlag) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, parseInt(orgId)));

    if (!org) {
      return NextResponse.json({ enabled: false }, { status: 404 });
    }

    const isEnabled = (org.feature_flags as FeatureFlags)?.[featureFlag]?.is_enabled ?? false;
    return NextResponse.json({ enabled: isEnabled });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}