import { Context, Telegraf } from 'telegraf';

import cron from 'node-cron';
import * as dotenv from 'dotenv';


import { Assistant } from './assistant.ts';
import { TgBotAdapter } from './tg-bot.adapter.ts';
import 'dotenv/config';
import { ScheduleMessageRepository } from './message-manager/schedule-message.repository.ts';
import { MessageStatus, MessageType } from './message-manager/scheduled-message.entity.ts';
import { MessageHistoryRepository } from './message-history/message-history.repository.ts';
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
dotenv.config();
function escapeMarkdownV2(text: string | null): string {
	// Экранируем все специальные символы Telegram MarkdownV2
	return text ? text.replace(/([_\*\[\]()~`>#+\-=|{}\.!\\])/g, '\\$1') : '';
}
export interface UserMessage {
	role: 'user';
	message: string;
	timestamp: Date;
}

// Создаём HTTP-сервер на порту 8080
serve(async (req) => {
	const { method, url } = req;

	if (method === "GET") {
		// Здесь можно анализировать URL или параметры
		const responseBody = JSON.stringify({ message: "Hello from Deno!", path: new URL(url).pathname });
		return new Response(responseBody, {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Если метод не GET, возвращаем 405 Method Not Allowed
	return new Response("Method Not Allowed", { status: 405 });
}, { port: 8080 });

console.log("Server is running on http://localhost:8080");

const base = import.meta.dirname;  // в сборке — «виртуальная» директория модуля

const systemPrompt = Deno.readTextFileSync(`${base}/static/p.txt`);

console.log(systemPrompt)

const bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN!);

const tgBotAdapter = new TgBotAdapter();
const scheduleMessageRepository = new ScheduleMessageRepository();
const messageHistoryRepository = new MessageHistoryRepository();
const assistant = new Assistant();
interface Localization {
	startMessage: string;
	grammarSystemPrompt: string;
	tutorSystemPrompt: string;
	correctedLabel: string;
	tutorLabel: string;
}

const translations: Record<string, Localization> = {
	ru: {
		startMessage: 'Привет! Я бот для практики английского. Давай общаться!',
		grammarSystemPrompt: 'Вы ассистент по проверке грамматики.',
		tutorSystemPrompt: systemPrompt,
		correctedLabel: 'Исправлено',
		tutorLabel: 'Учитель',
	},
	en: {
		startMessage: 'Hi! I’m your English practice bot. Let’s chat!',
		grammarSystemPrompt: 'You are a grammar correction assistant.',
		tutorSystemPrompt: systemPrompt,
		correctedLabel: 'Corrected',
		tutorLabel: 'Tutor',
	},
	es: {
		startMessage: '¡Hola! Soy tu bot de práctica de inglés. ¡Hablemos!',
		grammarSystemPrompt: 'Eres un asistente de corrección gramatical.',
		tutorSystemPrompt: systemPrompt,
		correctedLabel: 'Corregido',
		tutorLabel: 'Tutor',
	},
	de: {
		startMessage: 'Hallo! Ich bin dein Englisch-Übungsbot. Lass uns reden!',
		grammarSystemPrompt: 'Du bist ein Grammatik-Korrekturassistent.',
		tutorSystemPrompt: systemPrompt,
		correctedLabel: 'Korrigiert',
		tutorLabel: 'Tutor',
	},
};

function getRandomFutureDate(): Date {
	const now = Date.now();
	const minOffset = 1 * 60 * 1000; // 1 минута в миллисекундах
	const maxOffset = 3 * 60 * 1000; // 3 минуты в миллисекундах

	// Случайное число от minOffset до maxOffset (включительно)
	const randomOffset = Math.floor(
		Math.random() * (maxOffset - minOffset + 1),
	) + minOffset;

	return new Date(now + randomOffset);
}

bot.start(async (ctx) => {
	const lang = ctx.from?.language_code?.split('-')[0] || 'en';
	const loc = translations[lang] || translations.en;
	await ctx.reply(loc.startMessage);
});

bot.on('text', async (ctx) => {
	// const lang = ctx.from?.language_code?.split('-')[0] || 'en';

	const userMessage = ctx.message.text;
	const timestamp = new Date(ctx.message.date * 1000);
	const chatId = ctx.chat.id;
	await scheduleMessageRepository.updateStatus({
		chatIds: [chatId],
		types: [MessageType.SCHEDULED],
	}, MessageStatus.REVOKED);

	await messageHistoryRepository.addMessage(chatId, userMessage, 'user', timestamp);
	const contextMessages = await messageHistoryRepository.getMessages({ chatIds: [chatId] });



	const tutorReply = await assistant.request({
		role: 'user',
		message: userMessage,
		timestamp,
	}, contextMessages);

	await messageHistoryRepository.addMessage(chatId, tutorReply.mainMessage, 'assistant', new Date());

	if (tutorReply.nextQuestion && tutorReply.tNextQuestion) {
		const text = `${escapeMarkdownV2(tutorReply.nextQuestion)}\n\n ||${escapeMarkdownV2(tutorReply.tNextQuestion)}||`;
		await scheduleMessageRepository.addMessage(
			chatId,
			text,
			MessageType.SCHEDULED,
			'assistant',
			getRandomFutureDate(),
		);
	}

	// console.log(tutorReply)
	console.log('--------------');

	// 6) Parse JSON and send separate messages
	try {
		const parsed = tutorReply;

		let text: string = '';

		if (parsed.grammarNote) {
			text += `>${escapeMarkdownV2(parsed.grammarNote)}\n\n`;
		}

		if (parsed.mainMessage) {
			text += `${escapeMarkdownV2(parsed.mainMessage)}\n\n`;
		}

		if (parsed.tMainMessage) {
			text += `||${escapeMarkdownV2(parsed.tMainMessage)}||`;
		}

		await scheduleMessageRepository.addMessage(
			chatId,
			text,
			MessageType.URGENT,
			'assistant',
		);
	} catch (err) {
		console.log(err);
		// Fallback: send whole reply if JSON parsing fails
		// await ctx.reply(tutorReply, { parse_mode: 'Markdown' });
	}
});

// Daily practice reminder at 9:00 Berlin time
cron.schedule('*/1 * * * * *', async () => {
	const items = await scheduleMessageRepository.getMessages({
		types: [MessageType.URGENT],
		statuses: [MessageStatus.NEW],
	});

	for await (const item of items) {
		await Promise.all([
			scheduleMessageRepository.updateStatus(
				{ ids: [item.id] },
				MessageStatus.SENT,
			),
			messageHistoryRepository.addMessage(item.chatId, item.message, 'assistant', new Date()),
			tgBotAdapter.sendMessage(item.chatId, item.message),
		]);
	}
});

cron.schedule('*/30 * * * * *', async () => {
	const items = await scheduleMessageRepository.getMessages({
		types: [MessageType.SCHEDULED],
		statuses: [MessageStatus.NEW],
	});

	for await (const item of items) {
		if (new Date() < item.time) {
			continue;
		}
		await tgBotAdapter.sendMessage(item.chatId, item.message);
		messageHistoryRepository.addMessage(item.chatId, item.message, 'assistant', new Date());

		await scheduleMessageRepository.updateStatus(
			{ ids: [item.id] },
			MessageStatus.SENT,
		);
	}
}, { timezone: 'Europe/Berlin' });

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
