// src/app/api/get-interviews/route.ts
import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { interviewTable } from '@/db/schema';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

export async function GET() {
  try {
    const interviews = await db.select().from(interviewTable);
    return NextResponse.json(interviews);
  } catch (error: any) {
    console.error('[GET_INTERVIEWS_ERROR]', error);
    return new NextResponse('Failed to fetch interviews', { status: 500 });
  }
}