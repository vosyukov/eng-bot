import { Injectable, Inject, Optional } from '@nestjs/common';
import { and, inArray } from 'drizzle-orm';
import { RoleType } from '../assistant/index';
import { SQL } from 'drizzle-orm/sql/sql';
import { messageHistory } from './message-history.entity';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export type MessageHistoryRow = typeof messageHistory.$inferSelect;

@Injectable()
export class MessageHistoryRepository {
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
        };
      }
    }
  }

  /**
   * Close the database connection pool if it was created by this repository
   */
  public async close(): Promise<void> {
    if (this.pool && !this.isInjected) {
      console.log('Closing MessageHistoryRepository database connection...');
      await this.pool.end();
      console.log('MessageHistoryRepository database connection closed');
    }
  }

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
    await this.db.insert(messageHistory).values(record);
  }

  public async getMessages(
    filter: { chatIds?: number[] },
  ): Promise<MessageHistoryRow[]> {
    const conditions: SQL[] = [];

    if (filter.chatIds?.length) {
      conditions.push(inArray(messageHistory.chatId, filter.chatIds));
    }

    const items = await this.db.select().from(messageHistory).where(
      and(...conditions),
    );

    return items;
  }
}
