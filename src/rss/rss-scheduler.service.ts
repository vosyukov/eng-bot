import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { RssParserService } from "./rss-parser.service";
import { RSS_PARSE_INTERVAL_MINUTES } from "./rss-config";
import { LoggingService, InjectLogger } from "../logging";

@Injectable()
export class RssSchedulerService implements OnApplicationBootstrap {
  constructor(
    private readonly rssParserService: RssParserService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log("Running initial RSS parse on startup...");
    this.rssParserService.parseAndSave().catch((error) => {
      this.logger.error(
        "Error in initial RSS parse:",
        error instanceof Error ? error.stack : String(error),
      );
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
      this.logger.error(
        "Error in RSS parser cron job:",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
