import { Injectable } from "@nestjs/common";
import { user, UserInsert, UserRow } from "./user.entity";
import { and, eq } from "drizzle-orm";
import { DatabaseService } from "../database/drizzle.module";
import { SQL } from "drizzle-orm/sql/sql";

export interface UserFilter {
  userId?: string;
  telegramId?: string;
  maxId?: string;
}
@Injectable()
export class UserRepository {
  private readonly db: any;

  constructor(private readonly databaseService: DatabaseService) {
    this.db = this.databaseService.orm;
  }

  public async findById(id: string): Promise<UserRow | undefined> {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return foundUser;
  }

  public async getUser(filter: UserFilter): Promise<UserRow | null> {
    const conditions: SQL[] = [];

    if (filter.userId) {
      conditions.push(eq(user.id, filter.userId));
    }

    if (filter.telegramId) {
      conditions.push(eq(user.telegramId, filter.telegramId));
    }

    if (filter.maxId) {
      conditions.push(eq(user.maxId, filter.maxId));
    }

    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(and(...conditions))
      .limit(1);
    return foundUser || null;
  }

  public async updateUser(
    telegramId: string,
    userData: Partial<UserInsert>,
  ): Promise<UserRow | undefined> {
    const [updatedUser] = await this.db
      .update(user)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(user.telegramId, telegramId))
      .returning();
    return updatedUser;
  }

  public async upsertUser(userData: Partial<UserInsert>): Promise<UserRow> {
    const [upsertedUser] = await this.db
      .insert(user)
      .values({
        ...userData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userData.telegramId ? user.telegramId : user.maxId,
        set: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          languageCode: userData.languageCode,
          chatId: userData.chatId,
          updatedAt: new Date(),
        },
      })
      .returning();

    return upsertedUser;
  }
}
