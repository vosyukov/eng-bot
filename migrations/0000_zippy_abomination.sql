CREATE TABLE "scheduled_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time" timestamp NOT NULL,
	"sender" text NOT NULL,
	"chat_id" integer NOT NULL,
	"message" jsonb NOT NULL,
	"status" smallint NOT NULL,
	"type" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time" timestamp NOT NULL,
	"sender" text NOT NULL,
	"chat_id" integer NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"pub_date" timestamp NOT NULL,
	"content" text,
	"feed_url" text NOT NULL,
	"guid" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rss_items_guid_unique" UNIQUE("guid")
);
