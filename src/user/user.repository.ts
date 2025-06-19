import { Injectable } from "@nestjs/common";
import { user, UserInsert, UserRow } from "./user.entity";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database/drizzle.module";

@Injectable()
export class UserRepository {
  private readonly db: any;

  constructor(private readonly databaseService: DatabaseService) {
    this.db = this.databaseService.orm;
  }

  public async createUser(userData: UserInsert): Promise<UserRow> {
    const [createdUser] = await this.db
      .insert(user)
      .values(userData)
      .returning();
    return createdUser;
  }

  public async findByTelegramId(
    telegramId: number,
  ): Promise<UserRow | undefined> {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.telegramId, telegramId))
      .limit(1);
    return foundUser;
  }

  public async updateUser(
    telegramId: number,
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
}
