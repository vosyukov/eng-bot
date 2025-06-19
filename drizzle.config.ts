import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/message-manager/scheduled-message.entity.ts",
    "./src/message-history/message-history.entity.ts",
    "./src/rss/rss-item.entity.ts",
    "./src/user/user.entity.ts"
  ],
  dialect: "postgresql",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
