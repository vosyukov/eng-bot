import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  /**
   * Escapes special characters for Telegram MarkdownV2 format
   * @param text The text to escape
   * @returns Escaped text
   */
  public escapeMarkdownV2(text: string | null): string {
    // Escape all special Telegram MarkdownV2 characters
    return text ? text.replace(/([_\*\[\]()~`>#+\-=|{}\.!\\])/g, '\\$1') : '';
  }

  /**
   * Generates a random future date between 1 and 3 minutes from now
   * @returns A Date object representing a future time
   */
  public getRandomFutureDate(): Date {
    const now = Date.now();
    const minOffset = 1 * 60 * 1000; // 1 minute in milliseconds
    const maxOffset = 3 * 60 * 1000; // 3 minutes in milliseconds

    // Random number from minOffset to maxOffset (inclusive)
    const randomOffset = Math.floor(
      Math.random() * (maxOffset - minOffset + 1),
    ) + minOffset;

    return new Date(now + randomOffset);
  }
}