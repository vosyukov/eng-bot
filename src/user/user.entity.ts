import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramId: text("telegram_id").unique(),
  maxId: text("max_id").unique(),
  chatId: text("chat_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username"),
  languageCode: text("language_code"),
  city: text("city"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserRow = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;
