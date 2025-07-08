import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { UserRepository } from "../user/user.repository";
import { AssistantService } from "../assistant/assistant.service";
import { MessageHistoryRepository } from "../message-history/message-history.repository";
import { TelegramBotAdapter } from "../message-handler/services/telegram-bot.adapter";

@Injectable()
export class TestService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly assistantService: AssistantService,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    private readonly telegramBotAdapter: TelegramBotAdapter,
  ) {}
  @Cron("*/60 * * * * *")
  public async test(): Promise<void> {
    const user = await this.userRepository.getUser({ telegramId: "263537201" });

    if (!user) {
      return;
    }

    const contextMessages = await this.messageHistoryRepository.getMessages({
      userIds: [user.id],
    });

    const a = await this.assistantService.getNews(user, contextMessages);

    await this.telegramBotAdapter.sendMessage2(Number(user.telegramId), a);
  }
}
