import { Module } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { DrizzleModule } from "../database/drizzle.module";

@Module({
  imports: [DrizzleModule],
  providers: [UserRepository, UserService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
