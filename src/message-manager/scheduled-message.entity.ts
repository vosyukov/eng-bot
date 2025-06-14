import { integer, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
export enum MessageStatus {
	NEW,
	PROCESSING,
	SENT,
	REVOKED,
}
export enum MessageType {
	SCHEDULED,
	URGENT,
}
export const scheduledMessage = pgTable('scheduled_message', {
	id: uuid('id').primaryKey().defaultRandom(),
	time: timestamp('time').notNull(),
	sender: text('sender').notNull(),
	chatId: integer('chat_id').notNull(),
	message: text('message').notNull(),
	status: smallint('status').notNull(),
	type: smallint('type').notNull(),
});
