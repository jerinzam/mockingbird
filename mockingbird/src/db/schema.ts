import { integer, pgTable, serial, text, timestamp, varchar, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  duration: varchar('duration', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  is_public: boolean('is_public'),
  owner: uuid('owner').notNull()
});

export const interviewsRelations = relations(interviewTable, ({ }) => ({}));

export type Interview = typeof interviewTable.$inferSelect;
export type NewInterview = typeof interviewTable.$inferInsert;

export const interviewSessionTable = pgTable('interview_session', {
  id: serial('id').primaryKey(),
  interview_id: integer('interview_role_id')
    .notNull()
    .references(() => interviewTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  call_transcript: text('call_transcript'),
  call_ended_reason: text('call_ended_reason'),
  call_started_time: timestamp('call_started_time'),
  call_ended_time: timestamp('call_ended_time'),
  token: varchar('token', { length: 255 }).unique(),
  session_uuid: varchar('session_uuid', { length: 36 }).notNull().unique()
});

export type InterviewSession = typeof interviewSessionTable.$inferSelect;
export type NewInterviewSession = typeof interviewSessionTable.$inferInsert;

// ✅ New Invite Table
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  invite_code: varchar('invite_code', { length: 255 }).notNull().unique(),
  interview_id: integer('interview_id').notNull().references(() => interviewTable.id),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_by: uuid('created_by').notNull()
});

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
