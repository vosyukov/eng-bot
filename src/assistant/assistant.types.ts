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
  nextMessage: z.string(),
  tNextMessage: z.string(),
  userProfileInfo: z
    .object({
      name: z.string().nullable().optional().default(null),
      city: z.string().nullable().optional().default(null),
    })
    .nullable()
    .optional()
    .default(null),
});

export type RoleType = "system" | "user" | "assistant";
export type AssistantResponseType = z.infer<typeof ChatResponse>;
