import { drizzle } from 'drizzle-orm/node-postgres';

import { and, inArray } from 'drizzle-orm';
import { RoleType } from '../assistant.ts';
import { SQL } from 'drizzle-orm/sql/sql';
import { messageHistory } from './message-history.entity.ts';

const db = drizzle(process.env.DATABASE_URL!);
export type MessageHistoryRow = typeof messageHistory.$inferSelect;

export class MessageHistoryRepository {
	public async addMessage(
		chatId: number,
		message: string,
		sender: RoleType,
		time: Date = new Date(),
	): Promise<void> {
		const record: typeof messageHistory.$inferInsert = {
			time,
			chatId,
			message,
			sender,
		};
		await db.insert(messageHistory).values(record);
	}

	public async getMessages(
		filter: { chatIds?: number[] },
	): Promise<MessageHistoryRow[]> {
		const conditions: SQL[] = [];

		if (filter.chatIds?.length) {
			conditions.push(inArray(messageHistory.chatId, filter.chatIds));
		}

		const items = await db.select().from(messageHistory).where(
			and(...conditions),
		);

		return items;
	}
}
