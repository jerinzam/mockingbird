CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"domain" varchar(50) NOT NULL,
	"seniority" varchar(20) NOT NULL,
	"duration" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;