import OpenAI from 'openai';

export class GptAdapter {
	private openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	public async createEmbedding(
		text: string,
	): Promise<OpenAI.CreateEmbeddingResponse> {
		return await this.openAi.embeddings.create({
			model: 'text-embedding-ada-002',
			input: text,
		});
	}
}
