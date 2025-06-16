import { registerAs } from '@nestjs/config';

export default registerAs('rss', () => ({
  defaultFeeds: process.env.DEFAULT_RSS_FEEDS ? 
    process.env.DEFAULT_RSS_FEEDS.split(',') : 
    ['https://rssexport.rbc.ru/rbcnews/news/30/full.rss'],
  parseIntervalMinutes: parseInt(process.env.RSS_PARSE_INTERVAL_MINUTES || '10', 10),
}));