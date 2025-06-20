import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ScheduleMessageRepository } from "./schedule-message.repository";
import { MessageHistoryRepository } from "../message-history/message-history.repository";
import { TelegramService } from "../telegram/telegram.service";
import { MessageStatus, MessageType } from "./scheduled-message.entity";
import { UtilsService } from "../utils/utils.service";
import { InjectLogger, LoggingService } from "../logging";
import { UserService } from "../user/user.service";

@Injectable()
export class MessageSchedulerService {
  constructor(
    private readonly scheduleMessageRepository: ScheduleMessageRepository,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
    private readonly utilsService: UtilsService,
    private readonly userService: UserService,
    @InjectLogger()
    private readonly loggingService: LoggingService,
  ) {}

  public async onHandleMessage(): Promise<void> {}

  @Cron("*/10 * * * * *")
  async processScheduledMessages() {
    const items = await this.scheduleMessageRepository.getMessages({
      types: [MessageType.SCHEDULED],
      statuses: [MessageStatus.NEW],
    });

    for await (const item of items) {
      const text = `${this.utilsService.escapeMarkdownV2(item.message.text)}\n\n ||${this.utilsService.escapeMarkdownV2(item.message.translation)}||`;
      console.log(item);
      const user = await this.userService.findUserById(item.userId);
      if (!user) {
        continue;
      }
      await this.telegramService.sendMessage(user.telegramId, text);
      this.messageHistoryRepository.addMessage(
        item.userId,
        item.message.text,
        "assistant",
        new Date(),
      );

      await this.scheduleMessageRepository.updateStatus(
        { ids: [item.id] },
        MessageStatus.SENT,
      );
    }
  }
}
