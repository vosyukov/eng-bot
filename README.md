# English Practice Bot

A Telegram bot for English language practice, built with NestJS.

## Features

- Telegram bot integration
- RSS feed parsing and storage
- Scheduled tasks
- PostgreSQL database integration with Drizzle ORM

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- Telegram Bot Token (from BotFather)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/database
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DEFAULT_RSS_FEEDS=https://rssexport.rbc.ru/rbcnews/news/30/full.rss
RSS_PARSE_INTERVAL_MINUTES=10
```

## Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npm run drizzle:generate

# Apply database migrations
npm run drizzle:migrate
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Project Structure

The application follows the NestJS modular architecture:

- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root module
- `src/rss/` - RSS module for parsing and storing feeds
- `src/telegram/` - Telegram bot integration
- `src/database/` - Database configuration and connection
- `src/logging/` - Logging service and utilities

## Logging

The application uses a custom logging service that formats logs for both development and production environments. In production, logs are formatted for Google Cloud Logging.

### Using the InjectLogger Decorator

Instead of manually setting the context for each service, you can use the `InjectLogger` decorator:

```typescript
import { Injectable } from '@nestjs/common';
import { LoggingService, InjectLogger } from '../logging';

@Injectable()
export class MyService {
  constructor(
    @InjectLogger() private readonly logger: LoggingService
  ) {}

  someMethod() {
    // The context is automatically set to "MyService"
    this.logger.log('This is a log message');
  }
}
```

## Development

```bash
# Run in development mode with hot reload
npm run start:dev

# Run linting
npm run lint

# Format code
npm run format
```
