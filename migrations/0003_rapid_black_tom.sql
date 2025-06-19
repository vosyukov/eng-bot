ALTER TABLE "scheduled_message" RENAME COLUMN "chat_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "message_history" RENAME COLUMN "chat_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "chat_id" integer;