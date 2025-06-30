import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";

import * as amplitude from "@amplitude/analytics-node";
import { UserService } from "../../user/user.service";
import { InjectLogger, LoggingService } from "../../logging";
import { MessageManagerService } from "../../message-manager/message-manager.service";
import { I18nService } from "../../i18n/i18n.service";

import { UtilsService } from "../../utils/utils.service";
import { TelegramBotAdapter } from "./telegram-bot.adapter";
amplitude.init("5277c82bcd0b1af4935a287e06bb33f2");
@Injectable()
export class TelegramService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private readonly telegramBotAdapter: TelegramBotAdapter,
    private readonly i18nService: I18nService,
    private readonly messageManagerService: MessageManagerService,
    private readonly utilsService: UtilsService,
    private readonly userService: UserService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {}

  async onApplicationBootstrap() {
    const bot = this.telegramBotAdapter.getBot();

    this.logger.log("Initializing Telegram service");

    bot.start(async (ctx) => {
      const lang = ctx.from?.language_code?.split("-")[0] || "en";
      const startMessage = this.i18nService.getLocalizedText(
        "startMessage",
        lang,
      );

      // Save user data to database
      if (ctx.from) {
        try {
          const savedUser = await this.userService.saveUser({
            telegramId: ctx.from.id.toString(),
            first_name: ctx.from.first_name,
            last_name: ctx.from.last_name,
            username: ctx.from.username,
            language_code: ctx.from.language_code,
            chat_id: ctx.chat?.id.toString(),
          });
          this.logger.log(`User saved: ${savedUser.telegramId}`);

          amplitude.track(
            "register",
            { userId: savedUser.id },
            {
              language: savedUser.languageCode || undefined,
              user_id: savedUser.id,
              platform: "telegram",
              device_id: `telegram-${savedUser.telegramId}`,
            },
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;
          this.logger.error(`Failed to save user: ${errorMessage}`, errorStack);
        }
      }

      await ctx.reply(startMessage);
    });

    bot.on("text", async (ctx) => {
      const userMessage = ctx.message.text;
      const timestamp = new Date(ctx.message.date * 1000);
      const chatId = ctx.chat.id.toString();
      const telegramId = ctx.from.id.toString();
      const lang = ctx.from.language_code;

      const user = await this.userService.getUser({ telegramId });

      if (!user) {
        this.logger.error(`User not found for telegramId: ${telegramId}`);
        return;
      }

      amplitude.track(
        "text_message",
        { userId: user.id },
        {
          language: lang,
          user_id: user.id,
          platform: "telegram",
          device_id: `telegram-${user.telegramId}`,
        },
      );

      const result = await this.messageManagerService.handleTextMessage(
        userMessage,
        timestamp,
        user,
      );

      await this.sendMessage(chatId, result);
    });

    bot.launch();
    this.logger.log("Telegram bot started");
  }

  async onApplicationShutdown() {
    this.logger.log("Stopping Telegram bot...");
    const bot = this.telegramBotAdapter.getBot();
    await bot.stop();
    this.logger.log("Telegram bot stopped");
  }

  public async sendMessage(
    chatId: string,
    message: {
      grammarNote: string | null;
      mainMessage: string;
      tMainMessage: string;
    },
  ): Promise<void> {
    let text: string = "";

    if (message.grammarNote) {
      text += `>${this.utilsService.escapeMarkdownV2(message.grammarNote)}\n\n`;
    }

    if (message.mainMessage) {
      text += `${this.utilsService.escapeMarkdownV2(message.mainMessage)}\n\n`;
    }

    if (message.tMainMessage) {
      text += `||${this.utilsService.escapeMarkdownV2(message.tMainMessage)}||`;
    }

    await this.telegramBotAdapter.sendMessage(Number(chatId), text);
  }
}
