import { Injectable, Inject, Optional } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { rssItems } from './rss-item.entity';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export type RssItemRow = typeof rssItems.$inferSelect;

@Injectable()
export class RssItemRepository {
  private readonly db: any;
  private pool: Pool | null = null;
  private isInjected = false;

  constructor(
    @Optional() @Inject('DRIZZLE_ORM') injectedDb?: any,
  ) {
    if (injectedDb) {
      // When used with NestJS DI
      this.db = injectedDb;
      this.isInjected = true;
    } else {
      // When instantiated directly
      try {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        this.db = drizzle(this.pool);
      } catch (error) {
        console.error('Failed to create database connection:', error);
        // Create a mock db that logs operations instead of executing them
        this.db = {
          insert: () => ({ 
            values: () => {
              console.log('Mock insert operation');
              return {
                onConflictDoUpdate: () => console.log('Mock upsert operation')
              };
            }
          }),
          select: () => ({ from: () => ({ where: () => [] }) }),
        };
      }
    }
  }

  /**
   * Close the database connection pool if it was created by this repository
   */
  public async close(): Promise<void> {
    if (this.pool && !this.isInjected) {
      console.log('Closing RssItemRepository database connection...');
      await this.pool.end();
      console.log('RssItemRepository database connection closed');
    }
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
      console.error('Error in upsert operation:', error);
      throw error;
    }
  }

  public async getItemByGuid(guid: string): Promise<RssItemRow | undefined> {
    const items = await this.db.select().from(rssItems).where(eq(rssItems.guid, guid));
    return items[0];
  }

  public async getItems(feedUrl?: string): Promise<RssItemRow[]> {
    const conditions = [];

    if (feedUrl) {
      conditions.push(eq(rssItems.feedUrl, feedUrl));
    }

    const items = await this.db.select().from(rssItems).where(
      and(...conditions),
    );

    return items;
  }
}
