ALTER TABLE "user" ALTER COLUMN "telegram_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "max_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_max_id_unique" UNIQUE("max_id");