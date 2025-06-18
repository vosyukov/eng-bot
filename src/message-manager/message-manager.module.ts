import { Module, forwardRef } from "@nestjs/common";
import { ScheduleMessageRepository } from "./schedule-message.repository";
import { DrizzleModule } from "../database/drizzle.module";
import { MessageSchedulerService } from "./message-scheduler.service";
import { MessageHistoryModule } from "../message-history/message-history.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [
    DrizzleModule,
    MessageHistoryModule,
    ScheduleModule.forRoot(),
    forwardRef(() => TelegramModule),
  ],
  providers: [ScheduleMessageRepository, MessageSchedulerService],
  exports: [ScheduleMessageRepository, MessageSchedulerService],
})
export class MessageManagerModule {}
