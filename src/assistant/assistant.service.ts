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
		message: UserMessage,
		contextMessages: MessageHistoryRow[],
	): Promise<ChatResponseType> {
		const promptLayerClient = new PromptLayer({ apiKey: "pl_b6143b929fd9d49b6367906fb5ec2461" });
		console.log(await promptLayerClient.templates.all())
		// Typescript
		const OpenAI = promptLayerClient.OpenAI;
		const assistant = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });

		const f = contextMessages.map((m) => ({
			role: m.sender as never,
			content: `[${m.time}]: ${m.message}`,
		}));
		const chatResp = await assistant.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				// { role: 'system', content: this.systemPrompt },
				...f,
				{
					role: message.role,
					content: `[${message.timestamp}]: ${message.message}`,
				},
			],
			// store: true,

			response_format: zodResponseFormat(ChatResponse, 'ChatResponse'),
			// max_tokens: 150,
		});

		// @ts-ignore
		const tutorReply = JSON.parse(
			// @ts-ignore
			chatResp.choices?.[0]?.message.content,
		) as ChatResponseType;

		return tutorReply;
	}
}
