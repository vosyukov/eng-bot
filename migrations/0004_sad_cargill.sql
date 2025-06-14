ALTER TABLE "scheduled_message" ALTER COLUMN "time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scheduled_message" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scheduled_message" ADD COLUMN "sender" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scheduled_message" ADD COLUMN "type" smallint NOT NULL;