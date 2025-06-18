import { z } from "zod";

export interface UserMessage {
  role: "user";
  message: string;
  timestamp: Date;
}

export const ChatResponse = z.object({
  grammarNote: z.union([
    z.string().min(1, { message: "grammarNote не может быть пустой строкой" }),
    z.null(),
  ]),
  mainMessage: z.string(),
  tMainMessage: z.string(),
  nextQuestion: z.string(),
  tNextQuestion: z.string(),
});

export type RoleType = "system" | "user" | "assistant";
export type AssistantResponseType = z.infer<typeof ChatResponse>;
