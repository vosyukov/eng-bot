import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramBotAdapter } from './telegram-bot.adapter';
import { I18nModule } from '../i18n/i18n.module';
import { UtilsModule } from '../utils/utils.module';
import { AssistantModule } from '../assistant/assistant.module';
import { MessageHistoryModule } from '../message-history/message-history.module';
import { MessageManagerModule } from '../message-manager/message-manager.module';

@Module({
  imports: [
    ConfigModule,
    I18nModule,
    UtilsModule,
    AssistantModule,
    MessageHistoryModule,
    forwardRef(() => MessageManagerModule),
  ],
  providers: [TelegramService, TelegramBotAdapter],
  exports: [TelegramService],
})
export class TelegramModule {}
