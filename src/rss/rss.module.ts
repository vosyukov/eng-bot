import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RssParserService } from './rss-parser.service';
import { RssItemRepository } from './rss-item.repository';
import { DrizzleModule } from '../database/drizzle.module';
import { RssSchedulerService } from './rss-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import rssConfig from './rss.config';

@Module({
  imports: [
    ConfigModule.forFeature(rssConfig),
    DrizzleModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    RssParserService, 
    RssItemRepository,
    RssSchedulerService,
    {
      provide: 'RSS_FEED_URLS',
      useFactory: (configService: ConfigService) => {
        return configService.get<string[]>('rss.defaultFeeds') || [];
      },
      inject: [ConfigService],
    }
  ],
  exports: [RssParserService, RssSchedulerService],
})
export class RssModule {}
