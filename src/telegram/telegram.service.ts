import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context } from 'telegraf';
import { TelegramBotAdapter } from './telegram-bot.adapter';
import { I18nService } from '../i18n/i18n.service';
import { UtilsService } from '../utils/utils.service';
import { AssistantService } from '../assistant/assistant.service';
import { MessageHistoryRepository } from '../message-history/message-history.repository';
import { ScheduleMessageRepository } from '../message-manager/schedule-message.repository';
import { MessageStatus, MessageType } from '../message-manager/scheduled-message.entity';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly telegramBotAdapter: TelegramBotAdapter,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
    private readonly utilsService: UtilsService,
    private readonly assistantService: AssistantService,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    private readonly scheduleMessageRepository: ScheduleMessageRepository,
  ) {}

  onModuleInit() {
    const bot = this.telegramBotAdapter.getBot();

    console.log('init')

    bot.start(async (ctx) => {
      const lang = ctx.from?.language_code?.split('-')[0] || 'en';
      const startMessage = this.i18nService.getLocalizedText('startMessage', lang);
      await ctx.reply(startMessage);
    });

    bot.on('text', async (ctx) => {
      const userMessage = ctx.message.text;
      const timestamp = new Date(ctx.message.date * 1000);
      const chatId = ctx.chat.id;

      await this.scheduleMessageRepository.updateStatus({
        chatIds: [chatId],
        types: [MessageType.SCHEDULED],
      }, MessageStatus.REVOKED);

      await this.messageHistoryRepository.addMessage(chatId, userMessage, 'user', timestamp);

      const contextMessages = await this.messageHistoryRepository.getMessages({ chatIds: [chatId] });

      const tutorReply = await this.assistantService.request({
        role: 'user',
        message: userMessage,
        timestamp,
      }, contextMessages);

      await this.messageHistoryRepository.addMessage(chatId, tutorReply.mainMessage, 'assistant', new Date());
      if (tutorReply.nextQuestion && tutorReply.tNextQuestion) {
        const text = `${this.utilsService.escapeMarkdownV2(tutorReply.nextQuestion)}\n\n ||${this.utilsService.escapeMarkdownV2(tutorReply.tNextQuestion)}||`;
        await this.scheduleMessageRepository.addMessage(
          chatId,
          text,
          MessageType.SCHEDULED,
          'assistant',
          this.utilsService.getRandomFutureDate(),
        );
      }

      let text: string = '';

      if (tutorReply.grammarNote) {
        text += `>${this.utilsService.escapeMarkdownV2(tutorReply.grammarNote)}\n\n`;
      }

      if (tutorReply.mainMessage) {
        text += `${this.utilsService.escapeMarkdownV2(tutorReply.mainMessage)}\n\n`;
      }

      if (tutorReply.tMainMessage) {
        text += `||${this.utilsService.escapeMarkdownV2(tutorReply.tMainMessage)}||`;
      }

      await this.scheduleMessageRepository.addMessage(
        chatId,
        text,
        MessageType.URGENT,
        'assistant',
      );
    });

    bot.launch();
    console.log('Telegram bot started');
  }

  async onModuleDestroy() {
    console.log('Stopping Telegram bot...');
    const bot = this.telegramBotAdapter.getBot();
    await bot.stop();
    console.log('Telegram bot stopped');
  }

  public async sendMessage(chatId: number, message: string): Promise<void> {
    await this.telegramBotAdapter.sendMessage(chatId, message);
  }
}
