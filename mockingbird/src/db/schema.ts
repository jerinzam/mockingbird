import { integer, pgTable, serial, text, timestamp, varchar,boolean,uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// import { boolean } from 'drizzle-orm/gel-core';

// Enum for domains
export const domains = [
  'Web Development',
  'Frontend', 
  'Backend', 
  'Full Stack', 
  'Mobile', 
  'DevOps', 
  'Data Science', 
  'Machine Learning', 
  'Cloud', 
  'Security', 
  'QA',
  'AI/ML',
  'Blockchain',
  'UI/UX'
] as const;

// type Domain = typeof domains[number];

export const interviewTable = pgTable('interviews', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  domain: varchar('domain', { 
    length: 50, 
    enum: domains 
  }).notNull(),
  seniority: varchar('seniority', { 
    length: 20, 
    enum: ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'] 
  }).notNull(),
  key_skills: text('key_skills'),
  duration: varchar('duration', { length: 50 }), // e.g., '30 mins', '1 hour'
  created_at: timestamp('created_at')
    .defaultNow()
    .notNull(),
  is_public: boolean('is_public'),
  owner: uuid('owner').notNull()
});

// Optional: If you want to add relations or do more complex queries
export const interviewsRelations = relations(interviewTable, ({ }) => ({
  // You can add relations to other tables here in the future
}));

// Type inference helper
export type Interview = typeof interviewTable.$inferSelect;
export type NewInterview = typeof interviewTable.$inferInsert;

// Define the interviewSession table
export const interviewSessionTable = pgTable('interview_session', {
  id: serial('id').primaryKey(),
  interview_id: integer('interview_role_id')
    .notNull()
    .references(() => interviewTable.id), // Foreign key reference to interviews table
  created_at: timestamp('created_at').defaultNow().notNull(),
  call_transcript: text('call_transcript'), // Store the transcript as JSON or text
  call_ended_reason: text('call_ended_reason'), // e.g., "completed", "terminated", "error"
  call_started_time: timestamp('call_started_time'),
  call_ended_time: timestamp('call_ended_time'),
  token: varchar('token', { length: 255 }).unique(), // Unique token for the session
  session_uuid: varchar('session_uuid', { length: 36 }).notNull().unique(), // Public-safe identifier
});

// Define the types for type-safe operations
export type InterviewSession = typeof interviewSessionTable.$inferSelect;
export type NewInterviewSession = typeof interviewSessionTable.$inferInsert;