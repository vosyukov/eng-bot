import { Injectable, LoggerService, LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LoggingService implements LoggerService {
  private context?: string;
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = configService.get("NODE_ENV") === "production";
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: any, context?: string) {
    this.printMessage("info", message, context || this.context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage("error", message, context || this.context, trace);
  }

  warn(message: any, context?: string) {
    this.printMessage("warn", message, context || this.context);
  }

  debug(message: any, context?: string) {
    this.printMessage("debug", message, context || this.context);
  }

  verbose(message: any, context?: string) {
    this.printMessage("verbose", message, context || this.context);
  }

  private printMessage(
    level: LogLevel | "info" | "verbose",
    message: any,
    context?: string,
    trace?: string,
  ) {
    const now = new Date();
    const formattedMessage = this.formatMessage(level, message, context, trace);

    // In production, format logs for Google Cloud Logging
    if (this.isProduction) {
      // Google Cloud Logging expects JSON logs with severity field
      const gcpLog = {
        severity: this.mapSeverity(level),
        message:
          typeof message === "object" ? JSON.stringify(message) : message,
        context: context || "Application",
        timestamp: now.toISOString(),
        ...(trace && { trace }),
      };

      console.log(JSON.stringify(gcpLog));
    } else {
      // In development, use more human-readable format
      console.log(formattedMessage);
    }
  }

  private formatMessage(
    level: LogLevel | "info" | "verbose",
    message: any,
    context?: string,
    trace?: string,
  ): string {
    const pid = process.pid;
    const now = new Date();
    const timestamp = now.toISOString();

    let formattedMessage = `[${pid}] ${timestamp} [${level.toUpperCase()}]`;

    if (context) {
      formattedMessage += ` [${context}]`;
    }

    formattedMessage += `: ${
      typeof message === "object" ? JSON.stringify(message) : message
    }`;

    if (trace) {
      formattedMessage += `\n${trace}`;
    }

    return formattedMessage;
  }

  private mapSeverity(level: LogLevel | "info" | "verbose"): string {
    // Map NestJS log levels to Google Cloud Logging severity levels
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
    switch (level) {
      case "error":
        return "ERROR";
      case "warn":
        return "WARNING";
      case "debug":
        return "DEBUG";
      case "verbose":
        return "DEBUG";
      case "log":
      case "info":
      default:
        return "INFO";
    }
  }
}
