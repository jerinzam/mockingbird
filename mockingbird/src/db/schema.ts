// src/db/schema.ts

import { integer, pgTable, serial, text, timestamp, varchar, boolean, uuid,primaryKey, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Common enums
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

export const entityTypes = ['interview', 'training'] as const;
export const entityStatus = ['draft', 'published', 'licensed', 'invite-only'] as const;
export const entityVisibility = ['private', 'public', 'licensed'] as const;
// Organization Types
export const organizationTypes = ['personal', 'team', 'institutional'] as const;
export type OrganizationType = typeof organizationTypes[number];


// ===== Existing Tables =====

// Original interviews table (keeping for backward compatibility)
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

// Original interview session table
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

// Original invites table
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  organization_id: uuid('organization_id'),
  invite_code: varchar('invite_code', { length: 255 }).notNull().unique(),
  interview_id: integer('interview_id').references(() => interviewTable.id),
  entity_id: integer('entity_id').references(() => entitiesTable.id),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_by: uuid('created_by').notNull()
});

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;

// ===== New Entity System Tables =====

// Base entity table
export const entitiesTable = pgTable('entities', {
  id: serial('id').primaryKey(),
  organization_id: uuid('organization_id').notNull(),
  type: varchar('type', { 
    length: 50, 
    enum: entityTypes 
  }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 255 }).unique(),
  status: varchar('status', { 
    length: 50, 
    enum: entityStatus 
  }).notNull().default('draft'),
  visibility: varchar('visibility', { 
    length: 50, 
    enum: entityVisibility 
  }).notNull().default('private'),
  vapi_agent_id: integer('agent_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: uuid('created_by').notNull()
});

// Interview entities table
export const interviewEntitiesTable = pgTable('interview_entities', {
  id: serial('id').primaryKey(),
  entity_id: integer('entity_id').references(() => entitiesTable.id),
  domain: varchar('domain', { 
    length: 50, 
    enum: domains 
  }).notNull(),
  seniority: varchar('seniority', { 
    length: 20, 
    enum: ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'] 
  }).notNull(),
  key_skills: text('key_skills'),
  duration: varchar('duration', { length: 50 })
});

// Training entities table
export const trainingEntitiesTable = pgTable('training_entities', {
  id: serial('id').primaryKey(),
  entity_id: integer('entity_id').references(() => entitiesTable.id),
  category: varchar('category', { length: 50 }).notNull(),
  difficulty_level: varchar('difficulty_level', { 
    length: 20, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] 
  }).notNull(),
  prerequisites: text('prerequisites'),
  learning_objectives: text('learning_objectives'),
  estimated_completion_time: varchar('estimated_completion_time', { length: 50 })
});

// // Entity sessions table (replaces interview_session for new system)
// export const entitySessionsTable = pgTable('entity_sessions', {
//   id: serial('id').primaryKey(),
//   entity_id: integer('entity_id')
//     .notNull()
//     .references(() => entitiesTable.id),
//   created_at: timestamp('created_at').defaultNow().notNull(),
//   call_transcript: text('call_transcript'),
//   call_ended_reason: text('call_ended_reason'),
//   call_started_time: timestamp('call_started_time'),
//   call_ended_time: timestamp('call_ended_time'),
//   token: varchar('token', { length: 255 }).unique(),
//   session_uuid: varchar('session_uuid', { length: 36 }).notNull().unique(),
//   user_id: uuid('user_id'),
//   organization_id: uuid('organization_id'),
//   license_id: varchar('license_id', { length: 255 })
// });

// Entity invites table (replaces invites for new system)
// export const entityInvitesTable = pgTable('entity_invites', {
//   id: serial('id').primaryKey(),
//   invite_code: varchar('invite_code', { length: 255 }).notNull().unique(),
//   entity_id: integer('entity_id').notNull().references(() => entitiesTable.id),
//   name: varchar('name', { length: 255 }),
//   email: varchar('email', { length: 255 }),
//   phone: varchar('phone', { length: 20 }),
//   created_at: timestamp('created_at').defaultNow().notNull(),
//   updated_at: timestamp('updated_at').defaultNow().notNull(),
//   created_by: uuid('created_by').notNull()
// });

// ===== Relations =====

export const entitiesRelations = relations(entitiesTable, ({ one }) => ({
  interview: one(interviewEntitiesTable, {
    fields: [entitiesTable.id],
    references: [interviewEntitiesTable.entity_id],
  }),
  training: one(trainingEntitiesTable, {
    fields: [entitiesTable.id],
    references: [trainingEntitiesTable.entity_id],
  }),
}));

// ===== Types =====

// Entity types
export type Entity = typeof entitiesTable.$inferSelect;
export type NewEntity = typeof entitiesTable.$inferInsert;

export type InterviewEntity = typeof interviewEntitiesTable.$inferSelect;
export type NewInterviewEntity = typeof interviewEntitiesTable.$inferInsert;

export type TrainingEntity = typeof trainingEntitiesTable.$inferSelect;
export type NewTrainingEntity = typeof trainingEntitiesTable.$inferInsert;

export type EntitySession = typeof entitySessionsTable.$inferSelect;
export type NewEntitySession = typeof entitySessionsTable.$inferInsert;

// export type EntityInvite = typeof entityInvitesTable.$inferSelect;
// export type NewEntityInvite = typeof entityInvitesTable.$inferInsert;

export const organizationsTable = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logo_url: text('logo_url'),
  website: text('website'),
  is_active: boolean('is_active').default(true),
  settings: jsonb('settings').default({}),
  feature_flags: jsonb('feature_flags').default({}),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  type: varchar('type', { length: 32, enum: organizationTypes }).notNull().default('personal'),
  // Add check constraint for allowed types (if your ORM supports it, otherwise handled at app level)
});

// User-Organizations (Membership) Table
export const organizationMembersTable = pgTable('user_organizations', {
  id: serial('id').primaryKey(),
  user_id: uuid('user_id').notNull(),
  organization_id: serial('organization_id').notNull(),
  role: text('role').notNull().default('member'),
  is_active: boolean('is_active').default(true),
  is_default: boolean('is_default').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  // Unique constraint on (user_id, organization_id)
}, (table) => ({
  userOrgUnique: primaryKey({ columns: [table.user_id, table.organization_id] }),
}));

// If you want to add foreign key constraints in Drizzle, you can do so like this (if supported):
// .foreignKeys([
//   { columns: [organizationMembersTable.organization_id], references: [organizationsTable.id] },
//   { columns: [organizationMembersTable.user_id], references: [auth.users.id] }, // adjust as needed
// ]);

export const vapiAgentsTable = pgTable('vapi_agents', {
  id: serial('id').primaryKey(),
  organization_id: uuid('organization_id').notNull(),
  name: text('name').notNull(),
  vapi_agent_id: text('vapi_agent_id').notNull(),
  api_key: text('api_key').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const entitySessionsTable = pgTable('entity_sessions', {
  id:  serial('id').primaryKey(),
  session_uuid: uuid('session_uuid').defaultRandom().notNull(),
  entity_id: integer('entity_id').notNull(),
  user_id: text('user_id'),
  token: text('token'),
  status: text('status', { 
    enum: ['created', 'in_progress', 'completed', 'cancelled'] 
  }).default('created'),
  metadata: jsonb('metadata').default({}).notNull(),
  session_details: jsonb('session_details').default({}).notNull(),
  started_at: timestamp('started_at'),
  ended_at: timestamp('ended_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  org_id:  text('org_id'),
  call_transcript: text('call_transcript'),
  call_started_time: timestamp('call_started_time'),
  call_ended_time: timestamp('call_ended_time'),
  call_ended_reason: text('call_ended_reason')
});