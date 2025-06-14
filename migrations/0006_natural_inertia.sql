CREATE TABLE "message_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time" timestamp NOT NULL,
	"sender" text NOT NULL,
	"chat_id" integer NOT NULL,
	"message" text NOT NULL
);
