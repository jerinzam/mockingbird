// pages/api/create-interview.ts

import { db } from '@/index';
import { interviewTable } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const result = await db.insert(interviewTable).values({
        title: body.title,
        description: body.description,
        domain: body.domain,
        seniority: body.seniority,
        duration: body.duration,
        key_skills: body.key_skills.join(','),
      }).returning(); // returning() is important for getting the new ID
  
      const createdInterview = result[0];
  
      return NextResponse.json({
        success: true,
        id: createdInterview.id, // return the ID to the frontend
      });
    } catch (err) {
      console.error('[CREATE_INTERVIEW_ERROR]', err);
      return NextResponse.json(
        { success: false, error: 'Failed to create interview' },
        { status: 500 }
      );
    }
  }
  

