import { Module } from "@nestjs/common";
import { HealthcheckController } from "./healthcheck.controller";

@Module({
  controllers: [HealthcheckController],
  providers: [],
  exports: [],
})
export class HealthcheckModule {}
