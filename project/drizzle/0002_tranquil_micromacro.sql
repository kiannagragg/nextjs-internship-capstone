CREATE TYPE "public"."list_type" AS ENUM('todo', 'in_progress', 'review', 'done', 'custom');--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activity_action";--> statement-breakpoint
CREATE TYPE "public"."activity_action" AS ENUM('created', 'updated', 'deleted', 'moved', 'archived', 'unarchived', 'restored', 'completed', 'assigned', 'unassigned', 'commented', 'invited', 'removed', 'role_changed');--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE "public"."activity_action" USING "action"::"public"."activity_action";--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "type" "list_type" DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;