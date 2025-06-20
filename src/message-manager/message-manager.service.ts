import { Injectable } from "@nestjs/common";
import { ScheduleMessageRepository } from "./schedule-message.repository";
import { MessageHistoryRepository } from "../message-history/message-history.repository";
import { AssistantService } from "../assistant/assistant.service";
import { UtilsService } from "../utils/utils.service";
import { MessageStatus, MessageType } from "./scheduled-message.entity";
import { InjectLogger, LoggingService } from "../logging";
import { UserRow } from "../user/user.entity";
import { UserRepository } from "../user/user.repository";

@Injectable()
export class MessageManagerService {
  constructor(
    private readonly scheduleMessageRepository: ScheduleMessageRepository,
    private readonly messageHistoryRepository: MessageHistoryRepository,
    private readonly assistantService: AssistantService,
    private readonly userRepository: UserRepository,
    private readonly utilsService: UtilsService,
    @InjectLogger() private readonly logger: LoggingService,
  ) {}

  public async handleTextMessage(
    userMessage: string,
    timestamp: Date,
    user: UserRow,
    telegramId: number,
  ): Promise<{ text: string }> {
    await this.scheduleMessageRepository.updateStatus(
      {
        userIds: [user.id],
        types: [MessageType.SCHEDULED],
      },
      MessageStatus.REVOKED,
    );
    console.log(telegramId);

    await this.messageHistoryRepository.addMessage(
      user.id,
      userMessage,
      "user",
      timestamp,
    );

    const contextMessages = await this.messageHistoryRepository.getMessages({
      userIds: [user.id],
    });

    const tutorReply = await this.assistantService.request(
      user,
      contextMessages,
    );

    if (tutorReply.userProfileInfo) {
      await this.userRepository.updateUser(user.telegramId, {
        city: tutorReply.userProfileInfo.city,
        firstName: tutorReply.userProfileInfo.name,
      });
    }

    let text: string = "";

    if (tutorReply.grammarNote) {
      text += `>${this.utilsService.escapeMarkdownV2(tutorReply.grammarNote)}\n\n`;
    }

    if (tutorReply.mainMessage) {
      text += `${this.utilsService.escapeMarkdownV2(tutorReply.mainMessage)}\n\n`;
    }

    if (tutorReply.tMainMessage) {
      text += `||${this.utilsService.escapeMarkdownV2(tutorReply.tMainMessage)}||`;
    }

    await this.messageHistoryRepository.addMessage(
      user.id,
      tutorReply.mainMessage,
      "assistant",
      new Date(),
    );

    if (tutorReply.nextMessage && tutorReply.tNextMessage) {
      console.log(user);
      await this.scheduleMessageRepository.addMessage(
        user.id,
        {
          text: tutorReply.nextMessage,
          translation: tutorReply.tNextMessage,
        },
        MessageType.SCHEDULED,
        "assistant",
        this.utilsService.getRandomFutureDate(),
      );
    }

    return { text };
  }
}
