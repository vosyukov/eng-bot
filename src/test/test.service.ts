import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { UserRepository } from "../user/user.repository";
import { AssistantService } from "../assistant/assistant.service";
import { MessageHistoryRepository } from "../message-history/message-history.repository";
import { TelegramService } from "../message-handler/services/telegram.service";

@Injectable()
export class TestService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly assistantService: AssistantService,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    private readonly telegramService: TelegramService,
  ) {}
  @Cron("0 */1 * * *")
  public async test(): Promise<void> {
    const user = await this.userRepository.getUser({ telegramId: "263537201" });

    if (!user) {
      return;
    }

    const contextMessages = await this.messageHistoryRepository.getMessages({
      userIds: [user.id],
    });

    const tutorReply = await this.assistantService.getNews(
      user,
      contextMessages,
    );
    console.log(tutorReply.mainMessage);
    await this.messageHistoryRepository.addMessage(
      user.id,
      tutorReply.mainMessage,
      "assistant",
      new Date(),
    );

    await this.telegramService.sendMessage(user.telegramId!, {
      ...tutorReply,
      grammarNote: null,
    });
  }
}
