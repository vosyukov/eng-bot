import { Global, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectLogger, LoggingService } from "../../logging";

import { Bot } from "@maxhub/max-bot-api";

@Global()
@Injectable()
export class MaxBotAdapter {
  private bot: Bot;

  constructor(
    private readonly configService: ConfigService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {
    const token = this.configService.getOrThrow<string>("MAX_BOT_TOKEN");

    this.bot = new Bot(token);
  }

  public async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.api.sendMessageToUser(chatId, message, {
        format: "markdown",
      });
    } catch (error) {
      this.logger.error(
        `Error sending message to chat ${chatId}:`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  public getBot(): Bot {
    return this.bot;
  }
}
