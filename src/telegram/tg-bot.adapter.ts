import { Context,  Telegraf } from 'telegraf';


export class TgBotAdapter {
	private readonly bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN!);

	public async reply(ctx: Context, message: string) {
		await ctx.reply(message, { parse_mode: 'MarkdownV2' });
	}

	public async sendMessage(chatId: number, message: string): Promise<void> {
		this.bot.telegram.sendMessage(chatId, message, {
			parse_mode: 'MarkdownV2',
		});
	}
}