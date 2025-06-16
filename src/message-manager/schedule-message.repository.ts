import { Injectable, Inject, Optional } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { MessageStatus, MessageType, scheduledMessage } from "./scheduled-message.entity";
import { and, eq, inArray, lte } from 'drizzle-orm';
import { RoleType } from "../assistant/index";
import { SQL } from 'drizzle-orm/sql/sql';

export type ScheduledMessageRow = typeof scheduledMessage.$inferSelect;

@Injectable()
export class ScheduleMessageRepository {
  private readonly db: any;
  private pool: Pool | null = null;
  private isInjected = false;

  constructor(
    @Optional() @Inject('DRIZZLE_ORM') injectedDb?: any,
  ) {
    if (injectedDb) {
      // When used with NestJS DI
      this.db = injectedDb;
      this.isInjected = true;
    } else {
      // When instantiated directly
      try {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        this.db = drizzle(this.pool);
      } catch (error) {
        console.error('Failed to create database connection:', error);
        // Create a mock db that logs operations instead of executing them
        this.db = {
          insert: () => ({ 
            values: () => {
              console.log('Mock insert operation');
              return { };
            }
          }),
          select: () => ({ from: () => ({ where: () => [] }) }),
          update: () => ({ set: () => ({ where: () => {} }) }),
        };
      }
    }
  }

  /**
   * Close the database connection pool if it was created by this repository
   */
  public async close(): Promise<void> {
    if (this.pool && !this.isInjected) {
      console.log('Closing ScheduleMessageRepository database connection...');
      await this.pool.end();
      console.log('ScheduleMessageRepository database connection closed');
    }
  }
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
		await this.db.insert(scheduledMessage).values(record);
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

		const items = await this.db.select().from(scheduledMessage).where(
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

		await this.db.update(scheduledMessage)
			.set({
				status,
			})
			.where(and(...conditions));
	}
}
