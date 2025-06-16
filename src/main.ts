import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegramService } from './telegram/telegram.service';
import { ScheduleMessageRepository } from './message-manager/schedule-message.repository';
import { MessageHistoryRepository } from './message-history/message-history.repository';
import { RssItemRepository } from './rss/rss-item.repository';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Get port from environment or use default
  const PORT = process.env.PORT || 8080;

  await app.listen(PORT);
  console.log(`Server is running on http://localhost:${PORT}`);

  // Register shutdown handlers
  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    try {
      // Close the NestJS application
      await app.close();
      console.log('Application closed');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  };

  process.once('SIGINT', () => handleShutdown('SIGINT'));
  process.once('SIGTERM', () => handleShutdown('SIGTERM'));
}

bootstrap().catch(error => {
  console.error('Error starting application:', error);
  process.exit(1);
});
