import { PromptLayer } from "promptlayer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AssistantResponseType } from "./assistant.types";
import { MessageHistoryRow } from "../message-history/message-history.repository";

@Injectable()
export class AssistantService {
  constructor(private readonly configService: ConfigService) {}

  public async request(
    chatId: number,
    contextMessages: MessageHistoryRow[],
  ): Promise<AssistantResponseType> {
    const promptLayerApiKey = this.configService.get<string>(
      "PROMPTLAYER_API_KEY",
    );
    // const openaiApiKey = this.configService.get<string>("OPENAI_API_KEY");

    // Initialize PromptLayer with API key from config
    const promptLayer = new PromptLayer({
      apiKey: promptLayerApiKey,
      enableTracing: true,
    });

    // Get the OpenAI client through PromptLayer
    // const OpenAIWithPL = promptLayer.OpenAI;

    // Create OpenAI instance with PromptLayer tracking
    // const assistant = new OpenAIWithPL({ apiKey: openaiApiKey });

    // const f = contextMessages.map((m) =>  `[${m.time}]: ${m.message}`);
    const f = contextMessages.map((m) => ({
      sender: m.sender as never,
      text: `${m.message}`,
      timestamp: m.time,
    }));

    const response = (await promptLayer.run({
      promptName: "eng_bot", // имя вашего шаблона
      inputVariables: {
        // если в шаблоне есть {username}, {topic} и т.п.
        chat_history: JSON.stringify(f),
      },
      stream: false,
      metadata: {
        chatId: chatId.toString(),
      },
    })) as {
      request_id: any;
      raw_response: any;
      prompt_blueprint: any;
    };

    const tutorReply = JSON.parse(
      response.raw_response.choices?.[0]?.message.content,
    ) as AssistantResponseType;

    return tutorReply;
  }
}
