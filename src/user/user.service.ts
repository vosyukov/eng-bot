import { Injectable } from "@nestjs/common";
import { UserFilter, UserRepository } from "./user.repository";
import { UserRow } from "./user.entity";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user or updates an existing one based on Telegram user data
   */
  async saveUser(telegramUser: {
    telegramId: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    chat_id?: string;
  }): Promise<UserRow> {
    const existingUser = await this.userRepository.findByTelegramId(
      telegramUser.telegramId,
    );

    if (existingUser) {
      // Update existing user
      const updatedUser = await this.userRepository.updateUser(
        telegramUser.telegramId,
        {
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          languageCode: telegramUser.language_code,
          chatId: telegramUser.chat_id,
        },
      );

      if (!updatedUser) {
        // If update fails, return the existing user
        return existingUser;
      }

      return updatedUser;
    } else {
      // Create new user
      const newUser = await this.userRepository.createUser({
        telegramId: telegramUser.telegramId,
        chatId: telegramUser.chat_id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
      });
      return newUser;
    }
  }

  /**
   * Finds a user by their Telegram ID
   */
  async findUserByTelegramId(telegramId: number): Promise<UserRow | undefined> {
    return this.userRepository.findByTelegramId(telegramId.toString());
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
