import { forwardRef, Global, Module } from "@nestjs/common";
import { TelegramService } from "./services/telegram.service";
import { ConfigModule } from "@nestjs/config";
import { I18nModule } from "../i18n/i18n.module";
import { UtilsModule } from "../utils/utils.module";
import { AssistantModule } from "../assistant/assistant.module";
import { MessageHistoryModule } from "../message-history/message-history.module";
import { MessageManagerModule } from "../message-manager/message-manager.module";
import { UserModule } from "../user/user.module";
import { TelegramBotAdapter } from "./services/telegram-bot.adapter";

@Global()
@Module({
  imports: [
    ConfigModule,
    I18nModule,
    UtilsModule,
    AssistantModule,
    MessageHistoryModule,
    forwardRef(() => MessageManagerModule),
    UserModule,
  ],
  providers: [TelegramService, TelegramBotAdapter],
  exports: [TelegramService, TelegramBotAdapter],
})
export class MessageHandlerModule {}
