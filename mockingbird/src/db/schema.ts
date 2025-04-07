import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

type Domain = typeof domains[number];

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
    .notNull()
});

// Optional: If you want to add relations or do more complex queries
export const interviewsRelations = relations(interviewTable, ({ }) => ({
  // You can add relations to other tables here in the future
}));

// Type inference helper
export type Interview = typeof interviewTable.$inferSelect;
export type NewInterview = typeof interviewTable.$inferInsert;

// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   fullName: text('full_name'),
//   phone: varchar('phone', { length: 256 }),
// });