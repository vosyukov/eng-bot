import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const messageHistory = pgTable('message_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	time: timestamp('time').notNull(),
	sender: text('sender').notNull(),
	chatId: integer('chat_id').notNull(),
	message: text('message').notNull(),
});
