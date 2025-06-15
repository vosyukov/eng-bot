import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import { z } from 'zod';
import { PromptLayer } from "promptlayer";

import { UserMessage } from './index.ts';
import { MessageHistoryRow } from "./message-history/message-history.repository.ts";

const ChatResponse = z.object({
	grammarNote: z.union([
		z.string().min(1, { message: 'grammarNote не может быть пустой строкой' }),
		z.null(),
	]),
	mainMessage: z.string(),
	tMainMessage: z.string(),
	nextQuestion: z.string(),
	tNextQuestion: z.string(),
});
export type RoleType = 'system' | 'user' | 'assistant';
type ChatResponseType = z.infer<typeof ChatResponse>;

export class Assistant {


	constructor() {}

	public async request(
		message: UserMessage,
		contextMessages: MessageHistoryRow[],
	): Promise<ChatResponseType> {



		const promptLayerClient = new PromptLayer({ apiKey: "pl_b6143b929fd9d49b6367906fb5ec2461" });

		// Typescript
		const OpenAI = promptLayerClient.OpenAI;
		 const assistant = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
