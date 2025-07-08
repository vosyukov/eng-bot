import { Module } from "@nestjs/common";
import { TestService } from "./test.service";
import { UserModule } from "../user/user.module";
import { MessageHistoryModule } from "../message-history/message-history.module";
import { MessageHandlerModule } from "../message-handler/message-handler.module";
import { AssistantModule } from "../assistant/assistant.module";

@Module({
  imports: [
    UserModule,
    MessageHistoryModule,
    AssistantModule,
    MessageHandlerModule,
  ],
  providers: [TestService],
})
export class TestModule {}
