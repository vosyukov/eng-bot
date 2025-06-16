import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TelegramBotAdapter {
  private bot: Telegraf<Context>;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }
    this.bot = new Telegraf<Context>(token);
  }

  public async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
    }
  }

  public getBot(): Telegraf<Context> {
    return this.bot;
  }
}