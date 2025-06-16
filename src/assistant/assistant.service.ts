import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import { PromptLayer } from "promptlayer";
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ChatResponse, ChatResponseType, UserMessage } from './assistant.types';
import { MessageHistoryRow } from "../message-history/message-history.repository";

@Injectable()
export class AssistantService {
	constructor(
		private readonly configService: ConfigService,
	) {}

	public async request(

		contextMessages: MessageHistoryRow[],
	): Promise<ChatResponseType> {
		const promptLayerApiKey = this.configService.get<string>('PROMPTLAYER_API_KEY');
		const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

		// Initialize PromptLayer with API key from config
		const promptLayer = new PromptLayer({ apiKey: promptLayerApiKey, enableTracing: true });

		// Get the OpenAI client through PromptLayer
		const OpenAIWithPL = promptLayer.OpenAI;

		// Create OpenAI instance with PromptLayer tracking
		const assistant = new OpenAIWithPL({ apiKey: openaiApiKey });

		const f = contextMessages.map((m) => ({
			role: m.sender as never,
			content: `[${m.time}]: ${m.message}`,
		}));



		const response = await promptLayer.run({
			promptName: "eng_bot",        // имя вашего шаблона
			inputVariables: {                     // если в шаблоне есть {username}, {topic} и т.п.
				chat_history: f.join('\n'),
			},
			stream: false

		}) as {
			request_id: any;
			raw_response: any;
			prompt_blueprint: any;
		};
console.log(response);
		const tutorReply = JSON.parse(
			response.raw_response.choices?.[0]?.message.content,
		) as ChatResponseType;

		return tutorReply;
	}
}
