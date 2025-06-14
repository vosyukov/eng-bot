import { drizzle } from 'drizzle-orm/node-postgres';

import { MessageStatus, MessageType, scheduledMessage } from "./scheduled-message.entity.ts";
import { and, eq, inArray, lte } from 'drizzle-orm';
import { RoleType } from "../assistant.ts";
import { SQL } from 'drizzle-orm/sql/sql';

const db = drizzle(process.env.DATABASE_URL!);
export type ScheduledMessageRow = typeof scheduledMessage.$inferSelect;

export class ScheduleMessageRepository {
	public async addMessage(
		chatId: number,
		message: string,
		type: MessageType,
		sender: RoleType,
		time: Date = new Date(),
	): Promise<void> {
		const record: typeof scheduledMessage.$inferInsert = {
			time,
			chatId,
			message,
			status: MessageStatus.NEW,
			type,
			sender,
		};
		await db.insert(scheduledMessage).values(record);
	}

	public async getMessages(
		filter: { types?: MessageType[]; statuses?: MessageStatus[] },
	): Promise<ScheduledMessageRow[]> {
		const conditions: SQL[] = [];

		if (filter.statuses?.length) {
			conditions.push(inArray(scheduledMessage.status, filter.statuses));
		}

		if (filter.types?.length) {
			conditions.push(inArray(scheduledMessage.type, filter.types));
		}

		const items = await db.select().from(scheduledMessage).where(
			and(...conditions),
		);

		return items;
	}

	public async updateStatus(
		criteria: { ids?: string[]; chatIds?: number[]; types?: MessageType[] },
		status: MessageStatus,
	): Promise<void> {
		const conditions: SQL[] = [];

		if (criteria.ids?.length) {
			conditions.push(inArray(scheduledMessage.id, criteria.ids));
		}

		if (criteria.chatIds?.length) {
			conditions.push(inArray(scheduledMessage.chatId, criteria.chatIds));
		}

		if (criteria.types?.length) {
			conditions.push(inArray(scheduledMessage.type, criteria.types));
		}

		await db.update(scheduledMessage)
			.set({
				status,
			})
			.where(and(...conditions));
	}
}
