import { Injectable, OnModuleInit, Inject, forwardRef } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ScheduleMessageRepository } from "./schedule-message.repository";
import { MessageHistoryRepository } from "../message-history/message-history.repository";
import { TelegramService } from "../telegram/telegram.service";
import { MessageStatus, MessageType } from "./scheduled-message.entity";
import { UtilsService } from "../utils/utils.service";
import { InjectLogger, LoggingService } from "../logging";

@Injectable()
export class MessageSchedulerService {
  constructor(
    private readonly scheduleMessageRepository: ScheduleMessageRepository,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
    private readonly utilsService: UtilsService,
    @InjectLogger()
    private readonly loggingService: LoggingService,
  ) {}

  @Cron("*/10 * * * * *")
  async processScheduledMessages() {
    this.loggingService.log("Processing scheduled messages...");
    const items = await this.scheduleMessageRepository.getMessages({
      types: [MessageType.SCHEDULED],
      statuses: [MessageStatus.NEW],
    });

    for await (const item of items) {
      const text = `${this.utilsService.escapeMarkdownV2(item.message.text)}\n\n ||${this.utilsService.escapeMarkdownV2(item.message.translation)}||`;

      await this.telegramService.sendMessage(item.chatId, text);
      this.messageHistoryRepository.addMessage(
        item.chatId,
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
