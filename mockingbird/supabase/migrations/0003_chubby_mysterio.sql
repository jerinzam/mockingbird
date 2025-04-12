CREATE TABLE "interview_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"call_transcript" text,
	"call_ended_reason" text,
	"call_started_time" timestamp,
	"call_ended_time" timestamp
);
--> statement-breakpoint
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_interview_role_id_interviews_id_fk" FOREIGN KEY ("interview_role_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;