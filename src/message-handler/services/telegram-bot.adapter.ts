import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Context, Telegraf } from "telegraf";
import { InjectLogger, LoggingService } from "../../logging";

@Injectable()
export class TelegramBotAdapter {
  private bot: Telegraf<Context>;

  constructor(
    private readonly configService: ConfigService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {
    const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN");
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not defined");
    }
    this.bot = new Telegraf<Context>(token);
  }

  public async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: "MarkdownV2",
      });
    } catch (error) {
      this.logger.error(
        `Error sending message to chat ${chatId}:`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  public async sendMessage2(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      this.logger.error(
        `Error sending message to chat ${chatId}:`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  public getBot(): Telegraf<Context> {
    return this.bot;
  }
}
