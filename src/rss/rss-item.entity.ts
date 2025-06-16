import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const rssItems = pgTable('rss_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  link: text('link').notNull(),
  pubDate: timestamp('pub_date').notNull(),
  content: text('content'),
  feedUrl: text('feed_url').notNull(),
  guid: text('guid').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});