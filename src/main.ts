import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggingService } from "./logging/logging.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  // Get the logger service
  const logger = app.get(LoggingService);
  logger.setContext("Bootstrap");

  // Use the logger as the application logger
  app.useLogger(logger);

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);
  logger.log(`Server is running on http://localhost:${PORT}`);

  const handleShutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Starting graceful shutdown...`);

    try {
      await app.close();
      logger.log("Application closed");
    } catch (error) {
      logger.error(
        "Error during shutdown:",
        error instanceof Error ? error.stack : String(error),
      );
    }
  };

  process.once("SIGINT", () => handleShutdown("SIGINT"));
  process.once("SIGTERM", () => handleShutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  // We can't use the logger service here because it's not initialized yet
  console.error("Error starting application:", error);
  process.exit(1);
});
