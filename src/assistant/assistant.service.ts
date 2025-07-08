import { PromptLayer } from "promptlayer";
import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  AssistantResponseType,
  NewsResponse,
  NewsResponseType,
} from "./assistant.types";
import { MessageHistoryRow } from "../message-history/message-history.repository";
import { InjectLogger } from "../logging";
import { UserRow } from "../user/user.entity";

@Injectable()
export class AssistantService {
  constructor(
    private readonly configService: ConfigService,
    @InjectLogger()
    private readonly loggerService: LoggerService,
  ) {}

  public async getNews(
    user: UserRow,
    contextMessages: MessageHistoryRow[],
  ): Promise<{ mainMessage: string; tMainMessage: string }> {
    const f = contextMessages.map((m) => ({
      sender: m.sender as never,
      text: `${m.message}`,
      timestamp: m.time,
    }));

    const inputVariables = {
      chat_history: JSON.stringify(f),
      userProfileInfo: JSON.stringify({
        name: user.firstName,
        city: user.city,
      }),
    };

    const metadata = {
      userId: user.id,
    };

    const response = await this.req("news2", inputVariables, metadata);

    const tutorReply = JSON.parse(
      response.raw_response.choices?.[0]?.message.content,
    ) as NewsResponseType;

    return tutorReply;
  }

  public async req(
    promptName: string,
    inputVariables?: Record<string, unknown> | undefined,
    metadata?: Record<string, string> | undefined,
    promptVersion?: string,
  ): Promise<{
    request_id: any;
    raw_response: any;
    prompt_blueprint: any;
  }> {
    const promptLayerApiKey = this.configService.get<string>(
      "PROMPTLAYER_API_KEY",
    );
    const promptLayerOriginal = new PromptLayer({
      apiKey: promptLayerApiKey,
      enableTracing: true,
    });

    const promptLayer = new Proxy(promptLayerOriginal, {
      get(target, prop) {
        if (prop === "run") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          return async function (...args) {
            const originalConsoleLog = console.log;

            console.log = () => {};

            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              // eslint-disable-next-line prefer-spread
              const result = await target.run.apply(target, args);
              return result;
            } finally {
              console.log = originalConsoleLog;
            }
          };
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return target[prop];
      },
    });

    const response = (await promptLayer.run({
      promptName: promptName,
      promptVersion: promptVersion ? Number(promptVersion) : undefined,
      inputVariables: inputVariables,
      stream: false,
      metadata: metadata,
    })) as {
      request_id: any;
      raw_response: any;
      prompt_blueprint: any;
    };

    return response;
  }

  public async request(
    user: UserRow,
    contextMessages: MessageHistoryRow[],
  ): Promise<AssistantResponseType> {
    const promptLayerVersion = this.configService.get<string | undefined>(
      "PROMPTLAYER_VERSION",
    );

    const f = contextMessages.map((m) => ({
      sender: m.sender as never,
      text: `${m.message}`,
      timestamp: m.time,
    }));

    const inputVariables = {
      chat_history: JSON.stringify(f),
      userProfileInfo: JSON.stringify({
        name: user.firstName,
        city: user.city,
      }),
    };

    const metadata = {
      userId: user.id,
    };

    const response = await this.req(
      "eng_bot",
      inputVariables,
      metadata,
      promptLayerVersion,
    );

    const tutorReply = JSON.parse(
      response.raw_response.choices?.[0]?.message.content,
    ) as AssistantResponseType;

    this.loggerService.log("tutorReply: ", { userId: user.id, ...tutorReply });
    return tutorReply;
  }
}
