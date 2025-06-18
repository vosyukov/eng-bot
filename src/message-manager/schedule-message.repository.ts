import { Injectable } from "@nestjs/common";
import {
  MessageStatus,
  MessageType,
  scheduledMessage,
} from "./scheduled-message.entity";
import { and, inArray } from "drizzle-orm";
import { AssistantResponseType, RoleType } from "../assistant/assistant.types";
import { SQL } from "drizzle-orm/sql/sql";
import { DatabaseService } from "../database/drizzle.module";

export type ScheduledMessageRow = typeof scheduledMessage.$inferSelect;

@Injectable()
export class ScheduleMessageRepository {
  private readonly db: any;

  constructor(private readonly databaseService: DatabaseService) {
    this.db = this.databaseService.orm;
  }

  public async addMessage(
    chatId: number,
    message: { text: string; translation: string },
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

  public async getMessages(filter: {
    types?: MessageType[];
    statuses?: MessageStatus[];
  }): Promise<ScheduledMessageRow[]> {
    const conditions: SQL[] = [];

    if (filter.statuses?.length) {
      conditions.push(inArray(scheduledMessage.status, filter.statuses));
    }

    if (filter.types?.length) {
      conditions.push(inArray(scheduledMessage.type, filter.types));
    }

    const items = await this.db
      .select()
      .from(scheduledMessage)
      .where(and(...conditions));

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

    await this.db
      .update(scheduledMessage)
      .set({
        status,
      })
      .where(and(...conditions));
  }
}
