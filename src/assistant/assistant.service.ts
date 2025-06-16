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
		chatId: number,
		contextMessages: MessageHistoryRow[],
	): Promise<ChatResponseType> {
		const promptLayerApiKey = this.configService.get<string>('PROMPTLAYER_API_KEY');
		const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

		// Initialize PromptLayer with API key from config
		const promptLayer = new PromptLayer({ apiKey: promptLayerApiKey });

		// Get the OpenAI client through PromptLayer
		const OpenAIWithPL = promptLayer.OpenAI;

		// Create OpenAI instance with PromptLayer tracking
		const assistant = new OpenAIWithPL({ apiKey: openaiApiKey });

		const f = contextMessages.map((m) => ({
			role: m.sender as never,
			content: `[${m.time}]: ${m.message}`,
		}));

		// Create chat completion with PromptLayer tracking
		const chatResp = await assistant.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				...f,

			],
			response_format: zodResponseFormat(ChatResponse, 'ChatResponse'),
			// Add PromptLayer tracking metadata
			pl_tags: ['eng-bot', 'chat-completion'],
			pl_id: chatId.toString(), // Add trace_id for exact search in PromptLayer
		});

		const tutorReply = JSON.parse(
			chatResp.choices?.[0]?.message.content,
		) as ChatResponseType;

		return tutorReply;
	}
}
