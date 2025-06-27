import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { TelegramBotAdapter } from "./telegram-bot.adapter";
import { I18nService } from "../i18n/i18n.service";
import { UtilsService } from "../utils/utils.service";
import { MessageManagerService } from "../message-manager/message-manager.service";
import { LoggingService, InjectLogger } from "../logging";
import { UserService } from "../user/user.service";
import fetch from "node-fetch";
import { init, event } from "@haensl/google-analytics/measurement-protocol";

init({
  fetch,
  measurementId: "G-JQQB5R0FRC",
  measurementSecret: "Gd5HjuNVQ96YNPnAq3h-Lg",
});
@Injectable()
export class TelegramService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private readonly telegramBotAdapter: TelegramBotAdapter,
    private readonly i18nService: I18nService,
    private readonly utilsService: UtilsService,
    private readonly messageManagerService: MessageManagerService,
    private readonly userService: UserService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {}

  onApplicationBootstrap() {
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
      const telegramId = ctx.from.id;

      // Get user from database
      const user = await this.userService.findUserByTelegramId(telegramId);
      if (!user) {
        this.logger.error(`User not found for telegramId: ${telegramId}`);
        return;
      }
      event({ name: "text-message", params: { user_id: user.id } });
      const { text } = await this.messageManagerService.handleTextMessage(
        userMessage,
        timestamp,
        user,
        telegramId,
      );

      await this.sendMessage(chatId, text);
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

  public async sendMessage(chatId: string, message: string): Promise<void> {
    await this.telegramBotAdapter.sendMessage(Number(chatId), message);
  }
}
