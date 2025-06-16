import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RssParserService } from './rss-parser.service';
import { RSS_PARSE_INTERVAL_MINUTES } from './rss-config';

@Injectable()
export class RssSchedulerService implements OnModuleInit {
  constructor(
    private readonly rssParserService: RssParserService,
  ) {}

  onModuleInit() {
    console.log('Running initial RSS parse on startup...');
    this.rssParserService.parseAndSave().catch(error => {
      console.error('Error in initial RSS parse:', error);
    });
  }

  /**
   * Parse RSS feeds at the configured interval
   */
  @Cron(`*/${RSS_PARSE_INTERVAL_MINUTES} * * * *`)
  async parseRssFeeds() {
    try {
      await this.rssParserService.parseAndSave();
    } catch (error) {
      console.error('Error in RSS parser cron job:', error);
    }
  }
}