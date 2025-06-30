import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { RssModule } from "./rss/rss.module";

import { MessageHistoryModule } from "./message-history/message-history.module";
import { MessageManagerModule } from "./message-manager/message-manager.module";
import { AssistantModule } from "./assistant/assistant.module";
import { HealthcheckModule } from "./healthcheck/healthcheck.module";
import { LoggingModule } from "./logging/logging.module";
import { UserModule } from "./user/user.module";
import { MessageHandlerModule } from "./message-handler/message-handler.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MessageHandlerModule,
    LoggingModule,
    RssModule,
    MessageHistoryModule,
    MessageManagerModule,
    AssistantModule,
    HealthcheckModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
