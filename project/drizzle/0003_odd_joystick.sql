ALTER TABLE "tasks" ALTER COLUMN "position" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;