import { Injectable } from "@nestjs/common";
import { and, inArray } from "drizzle-orm";
import { RoleType } from "../assistant/assistant.types";
import { SQL } from "drizzle-orm/sql/sql";
import { messageHistory } from "./message-history.entity";
import { DatabaseService } from "../database/drizzle.module";

export type MessageHistoryRow = typeof messageHistory.$inferSelect;

@Injectable()
export class MessageHistoryRepository {
  private readonly db: any;

  constructor(private readonly databaseService: DatabaseService) {
    this.db = this.databaseService.orm;
  }

  public async addMessage(
    userId: string,
    message: string,
    sender: RoleType,
    time: Date = new Date(),
  ): Promise<void> {
    const record: typeof messageHistory.$inferInsert = {
      time,
      userId,
      message,
      sender,
    };
    await this.db.insert(messageHistory).values(record);
  }

  public async getMessages(filter: {
    userIds?: string[];
  }): Promise<MessageHistoryRow[]> {
    const conditions: SQL[] = [];

    if (filter.userIds?.length) {
      conditions.push(inArray(messageHistory.userId, filter.userIds));
    }

    const items = await this.db
      .select()
      .from(messageHistory)
      .where(and(...conditions))
      .orderBy(messageHistory.time);

    return items;
  }
}
