import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScheduleMessageRepository } from './schedule-message.repository';
import { MessageHistoryRepository } from '../message-history/message-history.repository';
import { TelegramService } from '../telegram/telegram.service';
import { MessageStatus, MessageType } from './scheduled-message.entity';

@Injectable()
export class MessageSchedulerService implements OnModuleInit {
  constructor(
    private readonly scheduleMessageRepository: ScheduleMessageRepository,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    console.log('Message scheduler service initialized');
  }

  /**
   * Process urgent messages every second
   */
  @Cron('*/1 * * * * *')
  async processUrgentMessages() {
    const items = await this.scheduleMessageRepository.getMessages({
      types: [MessageType.URGENT],
      statuses: [MessageStatus.NEW],
    });

    for await (const item of items) {
      await Promise.all([
        this.scheduleMessageRepository.updateStatus(
          { ids: [item.id] },
          MessageStatus.SENT,
        ),
        this.messageHistoryRepository.addMessage(item.chatId, item.message, 'assistant', new Date()),
        this.telegramService.sendMessage(item.chatId, item.message),
      ]);
    }
  }

  /**
   * Process scheduled messages every 30 seconds
   */
  @Cron('*/30 * * * * *')
  async processScheduledMessages() {
    const items = await this.scheduleMessageRepository.getMessages({
      types: [MessageType.SCHEDULED],
      statuses: [MessageStatus.NEW],
    });

    for await (const item of items) {
      if (new Date() < item.time) {
        continue;
      }
      await this.telegramService.sendMessage(item.chatId, item.message);
      this.messageHistoryRepository.addMessage(item.chatId, item.message, 'assistant', new Date());

      await this.scheduleMessageRepository.updateStatus(
        { ids: [item.id] },
        MessageStatus.SENT,
      );
    }
  }
}
