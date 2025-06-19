import {
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
export enum MessageStatus {
  NEW,
  PROCESSING,
  SENT,
  REVOKED,
}
export enum MessageType {
  SCHEDULED,
}
export const scheduledMessage = pgTable("scheduled_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  time: timestamp("time").notNull(),
  sender: text("sender").notNull(),
  chatId: integer("chat_id").notNull(),
  message: jsonb("message")
    .$type<{ text: string; translation: string }>()
    .notNull(),

  status: smallint("status").notNull(),
  type: smallint("type").notNull(),
});
