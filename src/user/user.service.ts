import { Injectable } from "@nestjs/common";
import { UserFilter, UserRepository } from "./user.repository";
import { UserRow } from "./user.entity";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user or updates an existing one based on Telegram user data
   * using upsert operation with unique keys
   */
  async saveUser(telegramUser: {
    telegramId?: string;
    maxId?: string;
    first_name?: string;
    last_name?: string;
    username?: string | null;
    language_code?: string;
    chat_id?: string;
  }): Promise<UserRow> {
    // Prepare user data for upsert
    const userData = {
      telegramId: telegramUser.telegramId,
      maxId: telegramUser.maxId,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
      languageCode: telegramUser.language_code,
      chatId: telegramUser.chat_id,
    };

    // Perform upsert operation
    return this.userRepository.upsertUser(userData);
  }

  /**
   * Finds a user by their UUID
   */
  async findUserById(id: string): Promise<UserRow | undefined> {
    return this.userRepository.findById(id);
  }

  async getUser(filter: UserFilter): Promise<UserRow | null> {
    return this.userRepository.getUser(filter);
  }
}
