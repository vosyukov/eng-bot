import { Module } from "@nestjs/common";
import { AssistantService } from "./assistant.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
