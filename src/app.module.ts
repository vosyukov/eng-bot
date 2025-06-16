import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RssModule } from './rss/rss.module';
import { TelegramModule } from './telegram/telegram.module';
import { MessageHistoryModule } from './message-history/message-history.module';
import { MessageManagerModule } from './message-manager/message-manager.module';
import { AssistantModule } from './assistant/assistant.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { UtilsModule } from './utils/utils.module';
import { I18nModule } from './i18n/i18n.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    RssModule,
    TelegramModule,
    MessageHistoryModule,
    MessageManagerModule,
    AssistantModule,
    HealthcheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
