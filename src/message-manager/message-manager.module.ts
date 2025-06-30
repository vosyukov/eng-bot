import { Module, forwardRef } from "@nestjs/common";
import { ScheduleMessageRepository } from "./schedule-message.repository";
import { DrizzleModule } from "../database/drizzle.module";
import { MessageSchedulerService } from "./message-scheduler.service";
import { MessageManagerService } from "./message-manager.service";
import { MessageHistoryModule } from "../message-history/message-history.module";
import { ScheduleModule } from "@nestjs/schedule";

import { UtilsModule } from "../utils/utils.module";
import { AssistantModule } from "../assistant/assistant.module";
import { UserModule } from "../user/user.module";
import { MessageHandlerModule } from "../message-handler/message-handler.module";

@Module({
  imports: [
    DrizzleModule,
    MessageHistoryModule,
    ScheduleModule.forRoot(),
    forwardRef(() => MessageHandlerModule),
    UtilsModule,
    AssistantModule,
    UserModule,
  ],
  providers: [
    ScheduleMessageRepository,
    MessageSchedulerService,
    MessageManagerService,
  ],
  exports: [
    ScheduleMessageRepository,
    MessageSchedulerService,
    MessageManagerService,
  ],
})
export class MessageManagerModule {}
