import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilsService {
  public escapeMarkdownV2(text: string | null): string {
    return text ? text.replace(/([_\*\[\]()~`>#+\-=|{}\.!\\])/g, "\\$1") : "";
  }

  public getRandomFutureDate(): Date {
    const now = Date.now();
    const minOffset = 5 * 60 * 1000;
    const maxOffset = 15 * 60 * 1000;

    const randomOffset =
      Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;

    return new Date(now + randomOffset);
  }
}
