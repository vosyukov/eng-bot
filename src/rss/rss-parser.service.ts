import { Injectable, OnModuleInit, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import Parser from "rss-parser";
import { RssItemRepository } from "./rss-item.repository";
import { LoggingService, InjectLogger } from "../logging";

@Injectable()
export class RssParserService implements OnModuleInit {
  private parser: Parser;
  private feedUrls: string[];

  constructor(
    private readonly rssItemRepository: RssItemRepository,
    private readonly configService: ConfigService,
    @Inject("RSS_FEED_URLS") feedUrls: string[],
    @InjectLogger() private readonly logger: LoggingService,
  ) {
    this.parser = new Parser({
      customFields: {
        item: [["content:encoded", "content"]],
      },
    });

    // Use the injected feedUrls
    this.feedUrls = feedUrls;
  }

  // Implement OnModuleInit interface
  onModuleInit() {
    this.logger.log("Running initial RSS parse on startup...");
    this.parseAndSave().catch((error) => {
      this.logger.error(
        "Error in initial RSS parse:",
        error instanceof Error ? error.stack : String(error),
      );
    });
  }

  public addFeedUrl(url: string): void {
    if (!this.feedUrls.includes(url)) {
      this.feedUrls.push(url);
    }
  }

  public removeFeedUrl(url: string): void {
    this.feedUrls = this.feedUrls.filter((feedUrl) => feedUrl !== url);
  }

  public getFeedUrls(): string[] {
    return [...this.feedUrls];
  }

  // Using a separate method for the cron job
  @Cron("0 */10 * * * *")
  public async handleCron() {
    await this.parseAndSave();
  }

  // The actual implementation that can be called from elsewhere
  public async parseAndSave(): Promise<void> {
    this.logger.log(`Starting RSS parsing at ${new Date().toISOString()}`);

    for (const feedUrl of this.feedUrls) {
      try {
        this.logger.log(`Parsing feed: ${feedUrl}`);
        const feed = await this.parser.parseURL(feedUrl);

        this.logger.log(`Found ${feed.items.length} items in feed: ${feedUrl}`);

        for (const item of feed.items) {
          if (!item.title || !item.link || !item.guid) {
            this.logger.warn("Skipping item with missing required fields");
            continue;
          }

          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

          await this.rssItemRepository.addItem(
            item.title,
            item.link,
            pubDate,
            item.content || item.contentSnippet || null,
            feedUrl,
            item.guid,
          );
        }

        this.logger.log(`Successfully processed feed: ${feedUrl}`);
      } catch (error) {
        this.logger.error(
          `Error parsing feed ${feedUrl}:`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.log(`Completed RSS parsing at ${new Date().toISOString()}`);
  }
}
