import { PromptLayer } from "promptlayer";
import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AssistantResponseType } from "./assistant.types";
import { MessageHistoryRow } from "../message-history/message-history.repository";
import { InjectLogger } from "../logging";

@Injectable()
export class AssistantService {
  constructor(
    private readonly configService: ConfigService,
    @InjectLogger()
    private readonly loggerService: LoggerService,
  ) {}

  public async request(
    userId: string,
    contextMessages: MessageHistoryRow[],
  ): Promise<AssistantResponseType> {
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

    const f = contextMessages.map((m) => ({
      sender: m.sender as never,
      text: `${m.message}`,
      timestamp: m.time,
    }));

    const response = (await promptLayer.run({
      promptName: "eng_bot", // имя вашего шаблона
      inputVariables: {
        chat_history: JSON.stringify(f),
      },
      stream: false,
      metadata: {
        userId,
      },
    })) as {
      request_id: any;
      raw_response: any;
      prompt_blueprint: any;
    };

    const tutorReply = JSON.parse(
      response.raw_response.choices?.[0]?.message.content,
    ) as AssistantResponseType;

    this.loggerService.log("tutorReply: ", { userId, ...tutorReply });
    return tutorReply;
  }
}
