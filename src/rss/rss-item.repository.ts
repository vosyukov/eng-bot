import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { rssItems } from "./rss-item.entity";
import { DatabaseService } from "../database/drizzle.module";

export type RssItemRow = typeof rssItems.$inferSelect;

@Injectable()
export class RssItemRepository {
  private readonly db: any;

  constructor(private readonly databaseService: DatabaseService) {
    this.db = this.databaseService.orm;
  }

  public async addItem(
    title: string,
    link: string,
    pubDate: Date,
    content: string | null,
    feedUrl: string,
    guid: string,
  ): Promise<void> {
    const record: typeof rssItems.$inferInsert = {
      title,
      link,
      pubDate,
      content,
      feedUrl,
      guid,
    };

    try {
      // Use upsert operation instead of simple insert
      await this.db
        .insert(rssItems)
        .values(record)
        .onConflictDoUpdate({
          target: rssItems.guid,
          set: {
            title,
            link,
            pubDate,
            content,
            feedUrl,
            // We don't update guid as it's our conflict target
            // Update the createdAt timestamp to show it was refreshed
            createdAt: new Date(),
          },
        });
    } catch (error) {
      console.error("Error in upsert operation:", error);
      throw error;
    }
  }

  public async getItemByGuid(guid: string): Promise<RssItemRow | undefined> {
    const items = await this.db
      .select()
      .from(rssItems)
      .where(eq(rssItems.guid, guid));
    return items[0];
  }

  public async getItems(feedUrl?: string): Promise<RssItemRow[]> {
    const conditions = [];

    if (feedUrl) {
      conditions.push(eq(rssItems.feedUrl, feedUrl));
    }

    const items = await this.db
      .select()
      .from(rssItems)
      .where(and(...conditions));

    return items;
  }
}
