CREATE TABLE "scheduled_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time" timestamp NOT NULL,
	"chat_id" integer NOT NULL,
	"message" text NOT NULL,
	"status" smallint
);
