import { Module } from '@nestjs/common';
import { MessageHistoryRepository } from './message-history.repository';
import { DrizzleModule } from '../database/drizzle.module';

@Module({
  imports: [
    DrizzleModule
  ],
  providers: [MessageHistoryRepository],
  exports: [MessageHistoryRepository],
})
export class MessageHistoryModule {}
