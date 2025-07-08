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

import { MaxBotAdapter } from "./max-bot.adapter";
amplitude.init("5277c82bcd0b1af4935a287e06bb33f2");
@Injectable()
export class MaxService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private readonly maxBotAdapter: MaxBotAdapter,
    private readonly i18nService: I18nService,
    private readonly messageManagerService: MessageManagerService,
    private readonly utilsService: UtilsService,
    private readonly userService: UserService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {}

  async onApplicationBootstrap() {
    const bot = this.maxBotAdapter.getBot();

    this.logger.log("Initializing Telegram service");

    bot.on("bot_started", async (ctx) => {
      console.log(ctx);
      const lang = "ru";
      const startMessage = this.i18nService.getLocalizedText(
        "startMessage",
        lang,
      );

      // Save user data to database
      if (ctx.user) {
        try {
          const savedUser = await this.userService.saveUser({
            maxId: ctx.user.user_id.toString(),
            first_name: ctx.user.name,
            username: ctx.user.username,
            language_code: "ru",
            chat_id: ctx.chatId.toString(),
          });
          this.logger.log(`User saved: ${savedUser.telegramId}`);

          amplitude.track(
            "register",
            { userId: savedUser.id },
            {
              language: savedUser.languageCode || undefined,
              user_id: savedUser.id,
              platform: "max",
              device_id: `max-${savedUser.telegramId}`,
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

    bot.on("message_created", async (ctx) => {
      const userMessage = ctx.message.body.text || "";
      const timestamp = new Date(ctx.message.timestamp * 1000);
      const chatId = ctx.chatId.toString();
      const maxId = ctx.chatId.toString();
      const lang = "ru";

      const user = await this.userService.getUser({ maxId });

      if (!user) {
        this.logger.error(`User not found for telegramId: ${maxId}`);
        return;
      }

      amplitude.track(
        "text_message",
        { userId: user.id },
        {
          language: lang,
          user_id: user.id,
          platform: "max",
          device_id: `max-${user.telegramId}`,
        },
      );

      const result = await this.messageManagerService.handleTextMessage(
        userMessage,
        timestamp,
        user,
      );

      await this.sendMessage(chatId, result);
    });

    bot.start();
    this.logger.log("Telegram bot started");
  }

  async onApplicationShutdown() {
    this.logger.log("Stopping Telegram bot...");
    const bot = this.maxBotAdapter.getBot();
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

    await this.maxBotAdapter.sendMessage(Number(chatId), text);
  }
}
